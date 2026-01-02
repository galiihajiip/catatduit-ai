from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum

class TransactionType(str, Enum):
    EXPENSE = "expense"
    INCOME = "income"
    TRANSFER = "transfer"

# User Schemas
class UserBase(BaseModel):
    telegram_id: str
    name: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: UUID
    is_pro: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Wallet Schemas
class WalletBase(BaseModel):
    name: str
    color_hex: Optional[str] = "#16A085"
    icon: Optional[str] = "wallet"

class WalletCreate(WalletBase):
    balance: Optional[float] = 0.0

class WalletResponse(WalletBase):
    id: UUID
    balance: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    color_hex: Optional[str] = "#3498DB"
    icon: Optional[str] = "category"

class CategoryResponse(CategoryBase):
    id: UUID
    type: TransactionType
    
    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionBase(BaseModel):
    amount: float
    description: Optional[str] = None
    type: TransactionType

class TransactionCreate(TransactionBase):
    wallet_id: UUID
    category_id: UUID

class TransactionResponse(TransactionBase):
    id: UUID
    wallet_id: UUID
    category_id: UUID
    ai_confidence: Optional[float]
    created_at: datetime
    
    class Config:
        from_attributes = True


# AI Schemas
class AIParseResult(BaseModel):
    intent: TransactionType
    amount: float
    currency: str = "IDR"
    category: str
    wallet: Optional[str] = None
    description: str
    confidence: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AIConfirmationRequest(BaseModel):
    raw_text: str
    parsed_result: AIParseResult
    confirmed: bool

# Analytics Schemas
class MonthlySummary(BaseModel):
    month: str
    total_income: float
    total_expense: float
    net_income: float
    expense_ratio: float
    saving_ratio: float

class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    color_hex: str
    icon: str

class AnalyticsResponse(BaseModel):
    summary: MonthlySummary
    category_breakdown: List[CategoryBreakdown]
    weekly_trend: List[dict]
    transaction_frequency: int

# Telegram Schemas
class TelegramUpdate(BaseModel):
    update_id: int
    message: Optional[dict] = None

class TelegramResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None
