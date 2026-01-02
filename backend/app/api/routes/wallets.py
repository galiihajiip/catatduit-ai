from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from app.db.database import get_db
from app.models.models import Wallet, User
from app.schemas.schemas import WalletCreate, WalletResponse

router = APIRouter(prefix="/wallets", tags=["wallets"])

@router.get("/", response_model=List[WalletResponse])
async def get_wallets(
    user_id: UUID,  # In production, get from JWT
    db: AsyncSession = Depends(get_db)
):
    """Get all wallets for a user"""
    result = await db.execute(
        select(Wallet).where(Wallet.user_id == user_id)
    )
    wallets = result.scalars().all()
    return wallets

@router.post("/", response_model=WalletResponse, status_code=status.HTTP_201_CREATED)
async def create_wallet(
    wallet: WalletCreate,
    user_id: UUID,  # In production, get from JWT
    db: AsyncSession = Depends(get_db)
):
    """Create a new wallet"""
    # Check wallet limit for non-pro users
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Count existing wallets
    result = await db.execute(
        select(Wallet).where(Wallet.user_id == user_id)
    )
    existing_wallets = result.scalars().all()
    
    # Free users limited to 3 wallets
    if not user.is_pro and len(existing_wallets) >= 3:
        raise HTTPException(
            status_code=403,
            detail="Free users can only have 3 wallets. Upgrade to Pro for unlimited wallets."
        )
    
    new_wallet = Wallet(
        user_id=user_id,
        name=wallet.name,
        balance=wallet.balance,
        color_hex=wallet.color_hex,
        icon=wallet.icon
    )
    db.add(new_wallet)
    await db.commit()
    await db.refresh(new_wallet)
    
    return new_wallet

@router.put("/{wallet_id}", response_model=WalletResponse)
async def update_wallet(
    wallet_id: UUID,
    wallet_data: WalletCreate,
    user_id: UUID,  # In production, get from JWT
    db: AsyncSession = Depends(get_db)
):
    """Update a wallet"""
    result = await db.execute(
        select(Wallet).where(Wallet.id == wallet_id, Wallet.user_id == user_id)
    )
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    wallet.name = wallet_data.name
    wallet.color_hex = wallet_data.color_hex
    wallet.icon = wallet_data.icon
    
    await db.commit()
    await db.refresh(wallet)
    
    return wallet

@router.delete("/{wallet_id}")
async def delete_wallet(
    wallet_id: UUID,
    user_id: UUID,  # In production, get from JWT
    db: AsyncSession = Depends(get_db)
):
    """Delete a wallet"""
    result = await db.execute(
        select(Wallet).where(Wallet.id == wallet_id, Wallet.user_id == user_id)
    )
    wallet = result.scalar_one_or_none()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")
    
    await db.delete(wallet)
    await db.commit()
    
    return {"message": "Wallet deleted successfully"}
