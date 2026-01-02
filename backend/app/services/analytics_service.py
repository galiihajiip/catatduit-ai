from uuid import UUID
from datetime import datetime, timedelta
from typing import List, Dict
from sqlalchemy import select, func, and_, extract
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import Transaction, Category, TransactionType

class AnalyticsService:
    """Financial analytics service"""
    
    @staticmethod
    async def get_full_analytics(db: AsyncSession, user_id: UUID) -> dict:
        """Get comprehensive analytics data"""
        today = datetime.utcnow()
        month_start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        summary = await AnalyticsService._get_summary(db, user_id, month_start)
        category_breakdown = await AnalyticsService._get_category_breakdown(db, user_id, month_start)
        weekly_trend = await AnalyticsService._get_weekly_trend(db, user_id)
        frequency = await AnalyticsService._get_transaction_frequency(db, user_id, month_start)
        
        return {
            "summary": summary,
            "category_breakdown": category_breakdown,
            "weekly_trend": weekly_trend,
            "transaction_frequency": frequency
        }
    
    @staticmethod
    async def _get_summary(db: AsyncSession, user_id: UUID, start: datetime) -> dict:
        """Get monthly summary metrics"""
        income_result = await db.execute(
            select(func.sum(Transaction.amount))
            .where(and_(
                Transaction.user_id == user_id,
                Transaction.type == TransactionType.INCOME,
                Transaction.created_at >= start
            ))
        )
        total_income = income_result.scalar() or 0
        
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
            "month": start.strftime("%Y-%m"),
            "total_income": total_income,
            "total_expense": total_expense,
            "net_income": net_income,
            "expense_ratio": round(expense_ratio, 2),
            "saving_ratio": round(saving_ratio, 2)
        }
    
    @staticmethod
    async def _get_category_breakdown(db: AsyncSession, user_id: UUID, start: datetime) -> List[dict]:
        """Get expense breakdown by category"""
        result = await db.execute(
            select(
                Category.name,
                Category.color_hex,
                Category.icon,
                func.sum(Transaction.amount).label('total')
            )
            .join(Transaction, Transaction.category_id == Category.id)
            .where(and_(
                Transaction.user_id == user_id,
                Transaction.type == TransactionType.EXPENSE,
                Transaction.created_at >= start
            ))
            .group_by(Category.id, Category.name, Category.color_hex, Category.icon)
            .order_by(func.sum(Transaction.amount).desc())
        )
        
        rows = result.all()
        total = sum(row[3] for row in rows) if rows else 1
        
        return [
            {
                "category": row[0],
                "color_hex": row[1],
                "icon": row[2],
                "amount": row[3],
                "percentage": round((row[3] / total) * 100, 2)
            }
            for row in rows
        ]

    @staticmethod
    async def _get_weekly_trend(db: AsyncSession, user_id: UUID) -> List[dict]:
        """Get weekly income vs expense trend (last 4 weeks)"""
        today = datetime.utcnow()
        weeks = []
        
        for i in range(4):
            week_end = today - timedelta(days=i*7)
            week_start = week_end - timedelta(days=7)
            
            income_result = await db.execute(
                select(func.sum(Transaction.amount))
                .where(and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.INCOME,
                    Transaction.created_at.between(week_start, week_end)
                ))
            )
            income = income_result.scalar() or 0
            
            expense_result = await db.execute(
                select(func.sum(Transaction.amount))
                .where(and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.EXPENSE,
                    Transaction.created_at.between(week_start, week_end)
                ))
            )
            expense = expense_result.scalar() or 0
            
            weeks.append({
                "week": f"Week {4-i}",
                "start_date": week_start.strftime("%Y-%m-%d"),
                "end_date": week_end.strftime("%Y-%m-%d"),
                "income": income,
                "expense": expense
            })
        
        return list(reversed(weeks))
    
    @staticmethod
    async def _get_transaction_frequency(db: AsyncSession, user_id: UUID, start: datetime) -> int:
        """Get transaction count for the month"""
        result = await db.execute(
            select(func.count(Transaction.id))
            .where(and_(
                Transaction.user_id == user_id,
                Transaction.created_at >= start
            ))
        )
        return result.scalar() or 0
    
    @staticmethod
    async def get_historical_comparison(db: AsyncSession, user_id: UUID, months: int = 6) -> List[dict]:
        """Get historical monthly comparison (Pro feature)"""
        today = datetime.utcnow()
        history = []
        
        for i in range(months):
            month_date = today.replace(day=1) - timedelta(days=i*30)
            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            
            if month_date.month == 12:
                month_end = month_date.replace(year=month_date.year+1, month=1, day=1)
            else:
                month_end = month_date.replace(month=month_date.month+1, day=1)
            
            income_result = await db.execute(
                select(func.sum(Transaction.amount))
                .where(and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.INCOME,
                    Transaction.created_at.between(month_start, month_end)
                ))
            )
            income = income_result.scalar() or 0
            
            expense_result = await db.execute(
                select(func.sum(Transaction.amount))
                .where(and_(
                    Transaction.user_id == user_id,
                    Transaction.type == TransactionType.EXPENSE,
                    Transaction.created_at.between(month_start, month_end)
                ))
            )
            expense = expense_result.scalar() or 0
            
            history.append({
                "month": month_start.strftime("%Y-%m"),
                "income": income,
                "expense": expense,
                "net": income - expense
            })
        
        return list(reversed(history))
