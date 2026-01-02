from uuid import UUID
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import Transaction, User, Wallet, Category, TransactionType, AnalyticsCache

class TransactionService:
    """Transaction management service"""
    
    @staticmethod
    async def create_transaction(
        db: AsyncSession,
        user_id: UUID,
        wallet_id: UUID,
        category_id: UUID,
        transaction_type: TransactionType,
        amount: float,
        description: str,
        raw_input: str = None,
        ai_confidence: float = None
    ) -> Transaction:
        """Create a new transaction"""
        transaction = Transaction(
            user_id=user_id,
            wallet_id=wallet_id,
            category_id=category_id,
            type=transaction_type,
            amount=amount,
            description=description,
            raw_input=raw_input,
            ai_confidence=ai_confidence
        )
        db.add(transaction)
        await db.commit()
        await db.refresh(transaction)
        
        # Update wallet balance
        await TransactionService._update_wallet_balance(db, wallet_id, transaction_type, amount)
        
        return transaction
    
    @staticmethod
    async def _update_wallet_balance(
        db: AsyncSession,
        wallet_id: UUID,
        transaction_type: TransactionType,
        amount: float
    ):
        """Update wallet balance based on transaction"""
        wallet = await db.get(Wallet, wallet_id)
        if wallet:
            if transaction_type == TransactionType.INCOME:
                wallet.balance += amount
            elif transaction_type == TransactionType.EXPENSE:
                wallet.balance -= amount
            await db.commit()
    
    @staticmethod
    async def get_user_transactions(
        db: AsyncSession,
        user_id: UUID,
        limit: int = 50,
        offset: int = 0
    ) -> List[Transaction]:
        """Get user transactions with pagination"""
        result = await db.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return result.scalars().all()
    
    @staticmethod
    async def get_last_transaction(db: AsyncSession, user_id: UUID) -> Optional[Transaction]:
        """Get the last transaction for undo"""
        result = await db.execute(
            select(Transaction)
            .where(Transaction.user_id == user_id)
            .order_by(Transaction.created_at.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def delete_transaction(db: AsyncSession, transaction_id: UUID) -> bool:
        """Delete a transaction (for undo)"""
        transaction = await db.get(Transaction, transaction_id)
        if transaction:
            # Reverse wallet balance
            wallet = await db.get(Wallet, transaction.wallet_id)
            if wallet:
                if transaction.type == TransactionType.INCOME:
                    wallet.balance -= transaction.amount
                elif transaction.type == TransactionType.EXPENSE:
                    wallet.balance += transaction.amount
            
            await db.delete(transaction)
            await db.commit()
            return True
        return False

    @staticmethod
    async def get_daily_summary(db: AsyncSession, user_id: UUID) -> dict:
        """Get daily transaction summary"""
        today = datetime.utcnow().date()
        start = datetime.combine(today, datetime.min.time())
        end = datetime.combine(today, datetime.max.time())
        
        # Get income
        income_result = await db.execute(
            select(func.sum(Transaction.amount))
            .where(and_(
                Transaction.user_id == user_id,
                Transaction.type == TransactionType.INCOME,
                Transaction.created_at.between(start, end)
            ))
        )
        income = income_result.scalar() or 0
        
        # Get expense
        expense_result = await db.execute(
            select(func.sum(Transaction.amount))
            .where(and_(
                Transaction.user_id == user_id,
                Transaction.type == TransactionType.EXPENSE,
                Transaction.created_at.between(start, end)
            ))
        )
        expense = expense_result.scalar() or 0
        
        # Get transaction count
        count_result = await db.execute(
            select(func.count(Transaction.id))
            .where(and_(
                Transaction.user_id == user_id,
                Transaction.created_at.between(start, end)
            ))
        )
        count = count_result.scalar() or 0
        
        return {
            "income": income,
            "expense": expense,
            "net": income - expense,
            "transaction_count": count,
            "top_categories": await TransactionService._get_top_categories(db, user_id, start, end)
        }
    
    @staticmethod
    async def get_monthly_summary(db: AsyncSession, user_id: UUID) -> dict:
        """Get monthly transaction summary"""
        today = datetime.utcnow()
        start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Get income
        income_result = await db.execute(
            select(func.sum(Transaction.amount))
            .where(and_(
                Transaction.user_id == user_id,
                Transaction.type == TransactionType.INCOME,
                Transaction.created_at >= start
            ))
        )
        total_income = income_result.scalar() or 0
        
        # Get expense
        expense_result = await db.execute(
            select(func.sum(Transaction.amount))
            .where(and_(
                Transaction.user_id == user_id,
                Transaction.type == TransactionType.EXPENSE,
                Transaction.created_at >= start
            ))
        )
        total_expense = expense_result.scalar() or 0
        
        net_income = total_income - total_expense
        expense_ratio = (total_expense / total_income * 100) if total_income > 0 else 0
        saving_ratio = 100 - expense_ratio if total_income > 0 else 0
        
        return {
            "total_income": total_income,
            "total_expense": total_expense,
            "net_income": net_income,
            "expense_ratio": expense_ratio,
            "saving_ratio": saving_ratio,
            "top_categories": await TransactionService._get_top_categories(db, user_id, start, today)
        }
    
    @staticmethod
    async def _get_top_categories(
        db: AsyncSession,
        user_id: UUID,
        start: datetime,
        end: datetime
    ) -> List[dict]:
        """Get top expense categories"""
        result = await db.execute(
            select(Category.name, func.sum(Transaction.amount).label('total'))
            .join(Transaction, Transaction.category_id == Category.id)
            .where(and_(
                Transaction.user_id == user_id,
                Transaction.type == TransactionType.EXPENSE,
                Transaction.created_at.between(start, end)
            ))
            .group_by(Category.name)
            .order_by(func.sum(Transaction.amount).desc())
            .limit(5)
        )
        return [{"name": row[0], "amount": row[1]} for row in result.all()]
