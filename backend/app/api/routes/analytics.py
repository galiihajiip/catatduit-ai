from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import AnalyticsResponse, MonthlySummary
from app.services.analytics_service import AnalyticsService
from app.services.transaction_service import TransactionService

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/", response_model=AnalyticsResponse)
async def get_analytics(
    user_id: UUID,  # In production, get from JWT
    db: AsyncSession = Depends(get_db)
):
    """Get comprehensive analytics data"""
    # Verify user exists
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    analytics = await AnalyticsService.get_full_analytics(db, user_id)
    return analytics

@router.get("/summary/monthly", response_model=MonthlySummary)
async def get_monthly_summary(
    user_id: UUID,  # In production, get from JWT
    db: AsyncSession = Depends(get_db)
):
    """Get monthly summary"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    summary = await TransactionService.get_monthly_summary(db, user_id)
    return MonthlySummary(
        month=summary.get("month", ""),
        total_income=summary["total_income"],
        total_expense=summary["total_expense"],
        net_income=summary["net_income"],
        expense_ratio=summary["expense_ratio"],
        saving_ratio=summary["saving_ratio"]
    )

@router.get("/history")
async def get_historical_comparison(
    user_id: UUID,  # In production, get from JWT
    months: int = 6,
    db: AsyncSession = Depends(get_db)
):
    """Get historical monthly comparison (Pro feature)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if user is Pro
    if not user.is_pro:
        raise HTTPException(
            status_code=403,
            detail="This feature requires Pro subscription"
        )
    
    history = await AnalyticsService.get_historical_comparison(db, user_id, months)
    return {"history": history}
