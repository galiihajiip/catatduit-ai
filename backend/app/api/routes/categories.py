from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from app.db.database import get_db
from app.models.models import Category, User, TransactionType
from app.schemas.schemas import CategoryBase, CategoryResponse

router = APIRouter(prefix="/categories", tags=["categories"])

# Default system categories
DEFAULT_CATEGORIES = [
    {"name": "Makanan", "color_hex": "#E74C3C", "icon": "restaurant", "type": TransactionType.EXPENSE},
    {"name": "Transportasi", "color_hex": "#3498DB", "icon": "directions_car", "type": TransactionType.EXPENSE},
    {"name": "Tagihan", "color_hex": "#F39C12", "icon": "receipt", "type": TransactionType.EXPENSE},
    {"name": "Keperluan Rumah Tangga", "color_hex": "#9B59B6", "icon": "home", "type": TransactionType.EXPENSE},
    {"name": "Belanja", "color_hex": "#1ABC9C", "icon": "shopping_bag", "type": TransactionType.EXPENSE},
    {"name": "Hiburan", "color_hex": "#E91E63", "icon": "movie", "type": TransactionType.EXPENSE},
    {"name": "Kesehatan", "color_hex": "#00BCD4", "icon": "medical_services", "type": TransactionType.EXPENSE},
    {"name": "Pemasukan", "color_hex": "#16A085", "icon": "attach_money", "type": TransactionType.INCOME},
    {"name": "Gaji", "color_hex": "#27AE60", "icon": "work", "type": TransactionType.INCOME},
    {"name": "Bonus", "color_hex": "#2ECC71", "icon": "card_giftcard", "type": TransactionType.INCOME},
    {"name": "Lainnya", "color_hex": "#7F8C8D", "icon": "more_horiz", "type": TransactionType.EXPENSE},
]

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """Get all categories"""
    result = await db.execute(select(Category))
    categories = result.scalars().all()
    
    # Initialize default categories if empty
    if not categories:
        for cat_data in DEFAULT_CATEGORIES:
            category = Category(**cat_data, is_system=True)
            db.add(category)
        await db.commit()
        
        result = await db.execute(select(Category))
        categories = result.scalars().all()
    
    return categories

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category: CategoryBase,
    user_id: UUID,  # In production, get from JWT
    db: AsyncSession = Depends(get_db)
):
    """Create a custom category (Pro feature)"""
    # Check if user is Pro
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.is_pro:
        raise HTTPException(
            status_code=403,
            detail="Custom categories require Pro subscription"
        )
    
    # Check if category name already exists
    result = await db.execute(
        select(Category).where(Category.name == category.name)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")
    
    new_category = Category(
        name=category.name,
        color_hex=category.color_hex,
        icon=category.icon,
        is_system=False
    )
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    
    return new_category
