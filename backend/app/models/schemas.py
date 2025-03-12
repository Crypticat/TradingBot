from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime

class CryptoPrice(BaseModel):
    """Schema for crypto price data"""
    time: str
    price: float
    volume: Optional[float] = None

class TradeSignal(BaseModel):
    """Schema for trade signal data"""
    type: Literal["buy", "sell"]
    price: float
    confidence: float
    timestamp: str

class ModelBase(BaseModel):
    """Base schema for model data"""
    name: str
    description: str
    framework: str = "scikit-learn"
    
class ModelCreate(ModelBase):
    """Schema for model creation"""
    symbol: str
    labeled_points: List[dict]  # List of {x: timestamp, y: price, label: "bullish" | "bearish" | "neutral"}
    
class ModelOut(ModelBase):
    """Schema for model output"""
    id: str
    status: str
    accuracy: float
    last_run: Optional[str] = None
    
class Trade(BaseModel):
    """Schema for trade data"""
    id: int
    type: Literal["buy", "sell"]
    price: float
    amount: float
    time: str
    status: Literal["pending", "completed", "failed"]
    
class AccountBalance(BaseModel):
    """Schema for account balance"""
    fiat: float
    crypto: float
    
class ApiKeyConfig(BaseModel):
    """Schema for API key configuration"""
    api_key: str
    api_secret: str

class TradingConfig(BaseModel):
    """Schema for trading configuration"""
    trading_model_id: str
    symbol: str
    live: bool = False
    
class TradingResponse(BaseModel):
    """Schema for trading response"""
    success: bool
    message: str