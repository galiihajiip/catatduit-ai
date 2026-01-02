from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.models import User, Wallet, Category, TransactionType
from app.schemas.schemas import TelegramUpdate
from app.ai.nlp_engine import nlp_engine
from app.services.telegram_service import TelegramService
from app.services.transaction_service import TransactionService
from app.core.config import settings
import json

router = APIRouter(prefix="/telegram", tags=["telegram"])

# In-memory store for pending confirmations (use Redis in production)
pending_confirmations = {}

@router.post("/webhook")
async def telegram_webhook(update: dict, db: AsyncSession = Depends(get_db)):
    """Handle incoming Telegram updates"""
    
    # Handle callback queries (button clicks)
    if "callback_query" in update:
        return await handle_callback(update["callback_query"], db)
    
    # Handle messages
    if "message" not in update:
        return {"ok": True}
    
    message = update["message"]
    chat_id = message["chat"]["id"]
    text = message.get("text", "")
    user_info = message.get("from", {})
    
    # Get or create user
    user = await get_or_create_user(db, str(chat_id), user_info.get("first_name", "User"))
    
    # Handle commands
    if text.startswith("/"):
        return await handle_command(text, chat_id, user, db)
    
    # Parse with AI
    parsed = nlp_engine.parse(text)
    
    # Check confidence threshold
    if parsed.confidence >= settings.AI_CONFIDENCE_THRESHOLD:
        # Auto-save transaction
        transaction = await save_transaction(db, user, parsed)
        await TelegramService.send_success(chat_id, {
            "amount": parsed.amount,
            "category": parsed.category,
            "description": parsed.description
        })
    else:
        # Request confirmation
        pending_confirmations[chat_id] = {
            "parsed": parsed.__dict__,
            "raw_text": text
        }
        await TelegramService.send_confirmation(chat_id, parsed.__dict__)
    
    return {"ok": True}

async def get_or_create_user(db: AsyncSession, telegram_id: str, name: str) -> User:
    """Get existing user or create new one"""
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id)
    )
    user = result.scalar_one_or_none()
    
    if not user:
        user = User(telegram_id=telegram_id, name=name)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        # Create default wallet
        wallet = Wallet(user_id=user.id, name="Cash", balance=0)
        db.add(wallet)
        await db.commit()
        
        # Send welcome message
        await TelegramService.send_welcome(int(telegram_id), name)
    
    return user


async def handle_command(text: str, chat_id: int, user: User, db: AsyncSession):
    """Handle bot commands"""
    command = text.split()[0].lower()
    
    if command == "/start":
        await TelegramService.send_welcome(chat_id, user.name)
    
    elif command == "/today":
        summary = await TransactionService.get_daily_summary(db, user.id)
        await TelegramService.send_daily_summary(chat_id, summary)
    
    elif command == "/month":
        summary = await TransactionService.get_monthly_summary(db, user.id)
        await TelegramService.send_monthly_summary(chat_id, summary)
    
    elif command == "/summary":
        summary = await TransactionService.get_monthly_summary(db, user.id)
        await TelegramService.send_monthly_summary(chat_id, summary)
    
    elif command == "/undo":
        last_tx = await TransactionService.get_last_transaction(db, user.id)
        if last_tx:
            tx_data = {
                "amount": last_tx.amount,
                "category": last_tx.category.name if last_tx.category else "Unknown",
                "description": last_tx.description
            }
            await TransactionService.delete_transaction(db, last_tx.id)
            await TelegramService.send_undo_success(chat_id, tx_data)
        else:
            await TelegramService.send_message(chat_id, "❌ Tidak ada transaksi untuk dibatalkan.")
    
    else:
        await TelegramService.send_message(
            chat_id,
            "❓ Perintah tidak dikenal. Ketik langsung untuk mencatat transaksi."
        )
    
    return {"ok": True}

async def handle_callback(callback_query: dict, db: AsyncSession):
    """Handle inline keyboard callbacks"""
    chat_id = callback_query["message"]["chat"]["id"]
    data = callback_query["data"]
    
    if chat_id not in pending_confirmations:
        await TelegramService.send_message(chat_id, "❌ Tidak ada transaksi pending.")
        return {"ok": True}
    
    pending = pending_confirmations[chat_id]
    
    if data == "confirm_yes":
        # Get user
        result = await db.execute(
            select(User).where(User.telegram_id == str(chat_id))
        )
        user = result.scalar_one_or_none()
        
        if user:
            from dataclasses import dataclass
            
            @dataclass
            class ParsedData:
                intent: str
                amount: float
                category: str
                wallet: str
                description: str
                confidence: float
            
            parsed_data = ParsedData(**{k: v for k, v in pending["parsed"].items() 
                                        if k in ['intent', 'amount', 'category', 'wallet', 'description', 'confidence']})
            
            await save_transaction(db, user, parsed_data)
            await TelegramService.send_success(chat_id, pending["parsed"])
        
        del pending_confirmations[chat_id]
    
    elif data == "confirm_no":
        await TelegramService.send_message(chat_id, "❌ Transaksi dibatalkan. Silakan coba lagi.")
        del pending_confirmations[chat_id]
    
    elif data == "confirm_edit":
        await TelegramService.send_message(
            chat_id,
            "✏️ Silakan ketik ulang transaksi dengan lebih detail.\n\nContoh: beli bakso 15rb pake gopay"
        )
        del pending_confirmations[chat_id]
    
    return {"ok": True}

async def save_transaction(db: AsyncSession, user: User, parsed) -> None:
    """Save parsed transaction to database"""
    # Get or create category
    result = await db.execute(
        select(Category).where(Category.name == parsed.category)
    )
    category = result.scalar_one_or_none()
    
    if not category:
        tx_type = TransactionType.INCOME if parsed.intent == "income" else TransactionType.EXPENSE
        category = Category(name=parsed.category, type=tx_type)
        db.add(category)
        await db.commit()
        await db.refresh(category)
    
    # Get default wallet
    result = await db.execute(
        select(Wallet).where(Wallet.user_id == user.id).limit(1)
    )
    wallet = result.scalar_one_or_none()
    
    if not wallet:
        wallet = Wallet(user_id=user.id, name="Cash", balance=0)
        db.add(wallet)
        await db.commit()
        await db.refresh(wallet)
    
    # Create transaction
    tx_type = TransactionType.INCOME if parsed.intent == "income" else TransactionType.EXPENSE
    await TransactionService.create_transaction(
        db=db,
        user_id=user.id,
        wallet_id=wallet.id,
        category_id=category.id,
        transaction_type=tx_type,
        amount=parsed.amount,
        description=parsed.description,
        ai_confidence=parsed.confidence
    )
