from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from app.db.database import get_db
from app.models.models import Transaction, User, Wallet, Category, TransactionType
from app.schemas.schemas import TransactionCreate, TransactionResponse
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction: TransactionCreate,
    user_id: UUID,  # In production, get from JWT
    db: AsyncSession = Depends(get_db)
):
    """Create a new transaction"""
    # Verify wallet belongs to user
    result = await db.execute(
        select(Wallet).where(Wallet.id == transaction.wallet_id, Wallet.user_id == user_id)
    )
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    # Verify category exists
    result = await db.execute(
        select(Category).where(Category.id == transaction.category_id)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    tx_type = TransactionType(transaction.type.value)
    
    new_transaction = await TransactionService.create_transaction(
        db=db,
        user_id=user_id,
        wallet_id=transaction.wallet_id,
        category_id=transaction.category_id,
        transaction_type=tx_type,
        amount=transaction.amount,
        description=transaction.description
    )
    
    return new_transaction

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    user_id: UUID,  # In production, get from JWT
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get user transactions"""
    transactions = await TransactionService.get_user_transactions(db, user_id, limit, offset)
    return transactions

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: UUID,
    user_id: UUID,  # In production, get from JWT
    db: AsyncSession = Depends(get_db)
):
    """Delete a transaction"""
    # Verify transaction belongs to user
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == user_id
        )
    )
    transaction = result.scalar_one_or_none()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    success = await TransactionService.delete_transaction(db, transaction_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete transaction")
    
    return {"message": "Transaction deleted successfully"}
