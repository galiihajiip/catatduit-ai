"""
OCR API Routes for Receipt Processing
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
import os
import uuid
from datetime import datetime

from app.db.database import get_db
from app.ai.ocr_engine import ocr_engine, ReceiptData
from app.models.models import Transaction, User, Wallet, Category
from app.schemas.schemas import TransactionResponse

router = APIRouter(prefix="/ocr", tags=["OCR"])

# Upload directory
UPLOAD_DIR = "uploads/receipts"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/scan-receipt")
async def scan_receipt(
    file: UploadFile = File(...),
    telegram_id: str = None,
    wallet_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Scan receipt image and extract transaction data
    """
    if not ocr_engine:
        raise HTTPException(
            status_code=500,
            detail="OCR engine not available. Install pytesseract first."
        )
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Save uploaded file
        file_id = str(uuid.uuid4())
        file_extension = file.filename.split('.')[-1]
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}.{file_extension}")
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Process with OCR
        receipt_data: ReceiptData = ocr_engine.process_image(file_path)
        
        # Get user
        user = db.query(User).filter(User.telegram_id == telegram_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get or create wallet
        if wallet_id:
            wallet = db.query(Wallet).filter(
                Wallet.id == wallet_id,
                Wallet.user_id == user.id
            ).first()
        else:
            # Use first wallet or create default
            wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
            if not wallet:
                wallet = Wallet(
                    user_id=user.id,
                    name="Cash",
                    balance=0,
                    color_hex="#16A085",
                    icon="wallet"
                )
                db.add(wallet)
                db.commit()
                db.refresh(wallet)
        
        # Create transaction
        if receipt_data.total_amount > 0:
            # Get category (default to Belanja for shopping receipts)
            category = db.query(Category).filter(
                Category.name == "Belanja"
            ).first()
            
            if not category:
                category = db.query(Category).filter(
                    Category.name == "Lainnya"
                ).first()
            
            # Create transaction
            transaction = Transaction(
                user_id=user.id,
                wallet_id=wallet.id,
                category_id=category.id if category else None,
                type="expense",
                amount=receipt_data.total_amount,
                description=f"Belanja di {receipt_data.merchant_name or 'Toko'}" + 
                           (f" - {len(receipt_data.items)} items" if receipt_data.items else ""),
                raw_input=f"OCR: {receipt_data.raw_text[:100]}...",
                ai_confidence=receipt_data.confidence,
                receipt_image_path=file_path
            )
            
            db.add(transaction)
            
            # Update wallet balance
            wallet.balance -= receipt_data.total_amount
            
            db.commit()
            db.refresh(transaction)
            
            return {
                "success": True,
                "message": "Receipt processed successfully",
                "receipt_data": {
                    "merchant": receipt_data.merchant_name,
                    "total": receipt_data.total_amount,
                    "items_count": len(receipt_data.items),
                    "items": [
                        {
                            "name": item.name,
                            "quantity": item.quantity,
                            "price": item.price,
                            "category": item.category
                        }
                        for item in receipt_data.items
                    ],
                    "date": receipt_data.date,
                    "payment_method": receipt_data.payment_method,
                    "confidence": receipt_data.confidence
                },
                "transaction": {
                    "id": str(transaction.id),
                    "amount": transaction.amount,
                    "description": transaction.description,
                    "wallet": wallet.name,
                    "new_balance": wallet.balance
                }
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Could not extract amount from receipt"
            )
            
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up file after processing (optional)
        # os.remove(file_path)
        pass

@router.post("/scan-receipt-base64")
async def scan_receipt_base64(
    image_base64: str,
    telegram_id: str,
    wallet_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Scan receipt from base64 encoded image
    """
    if not ocr_engine:
        raise HTTPException(
            status_code=500,
            detail="OCR engine not available"
        )
    
    try:
        # Process with OCR
        receipt_data: ReceiptData = ocr_engine.process_base64_image(image_base64)
        
        # Get user
        user = db.query(User).filter(User.telegram_id == telegram_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get wallet
        if wallet_id:
            wallet = db.query(Wallet).filter(
                Wallet.id == wallet_id,
                Wallet.user_id == user.id
            ).first()
        else:
            wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
        
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        # Create transaction
        if receipt_data.total_amount > 0:
            category = db.query(Category).filter(
                Category.name == "Belanja"
            ).first()
            
            transaction = Transaction(
                user_id=user.id,
                wallet_id=wallet.id,
                category_id=category.id if category else None,
                type="expense",
                amount=receipt_data.total_amount,
                description=f"Belanja di {receipt_data.merchant_name or 'Toko'}",
                raw_input=f"OCR Scan",
                ai_confidence=receipt_data.confidence
            )
            
            db.add(transaction)
            wallet.balance -= receipt_data.total_amount
            db.commit()
            db.refresh(transaction)
            
            return {
                "success": True,
                "receipt_data": {
                    "merchant": receipt_data.merchant_name,
                    "total": receipt_data.total_amount,
                    "items": [
                        {
                            "name": item.name,
                            "quantity": item.quantity,
                            "price": item.price
                        }
                        for item in receipt_data.items
                    ],
                    "confidence": receipt_data.confidence
                },
                "transaction_id": str(transaction.id),
                "new_balance": wallet.balance
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Could not extract amount from receipt"
            )
            
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
