from fastapi import APIRouter, HTTPException, Body, Depends
from typing import List
from datetime import datetime, timedelta
import random

from ..models.schemas import TradingConfig, TradingResponse, Trade
from ..utils.storage import ModelStorage, TradeStorage, ApiKeyStorage

router = APIRouter()

# Global variable to track if trading is currently active
active_trading_session = None

@router.post("/start", response_model=TradingResponse)
async def start_trading(config: TradingConfig = Body(...)):
    """
    Start automated trading with a specified model
    """
    global active_trading_session
    
    model = ModelStorage.get_model_by_id(config.model_id)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model with ID {config.model_id} not found")
    
    # Check if API keys are configured
    api_keys = ApiKeyStorage.get_api_keys()
    if not api_keys.get("luno_api_key") or not api_keys.get("luno_api_secret"):
        raise HTTPException(
            status_code=400, 
            detail="Luno API keys not configured. Please configure API keys in settings."
        )
    
    try:
        # In a real implementation, this would:
        # 1. Initialize a trading bot with the specified model and settings
        # 2. Connect to the Luno API using the stored credentials
        # 3. Start monitoring prices and executing trades
        
        # For demo purposes, we'll just track that trading is active
        active_trading_session = {
            "model_id": config.model_id,
            "symbol": config.symbol,
            "live": config.live,
            "started_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        }
        
        # Create some initial simulated trades
        generate_initial_trades(config.model_id, config.symbol)
        
        return {
            "success": True,
            "message": f"Trading started with model {model['name']} for {config.symbol}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting trading: {str(e)}")

@router.post("/stop", response_model=TradingResponse)
async def stop_trading():
    """
    Stop automated trading
    """
    global active_trading_session
    
    if not active_trading_session:
        return {
            "success": False,
            "message": "No active trading session to stop"
        }
    
    try:
        # In a real implementation, this would:
        # 1. Stop the trading bot
        # 2. Close any open positions if specified
        # 3. Disconnect from the API
        
        # For demo purposes, we'll just clear the active session
        model_id = active_trading_session["model_id"]
        model = ModelStorage.get_model_by_id(model_id)
        model_name = model["name"] if model else f"ID: {model_id}"
        
        active_trading_session = None
        
        return {
            "success": True,
            "message": f"Trading stopped for model {model_name}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error stopping trading: {str(e)}")

@router.get("/history", response_model=List[Trade])
async def get_trading_history():
    """
    Get trading history
    """
    try:
        trades = TradeStorage.get_trades()
        # Sort by ID (newest first)
        trades.sort(key=lambda t: t["id"], reverse=True)
        return trades
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trading history: {str(e)}")

@router.get("/status")
async def get_trading_status():
    """
    Get current trading status
    """
    if not active_trading_session:
        return {
            "active": False,
            "message": "No active trading session"
        }
    
    model_id = active_trading_session["model_id"]
    model = ModelStorage.get_model_by_id(model_id)
    model_name = model["name"] if model else f"ID: {model_id}"
    
    return {
        "active": True,
        "model_id": model_id,
        "model_name": model_name,
        "symbol": active_trading_session["symbol"],
        "live": active_trading_session["live"],
        "started_at": active_trading_session["started_at"]
    }

def generate_initial_trades(model_id: str, symbol: str) -> None:
    """
    Generate some initial simulated trades for demo purposes
    """
    # Generate 5-8 trades with a mix of buy/sell and completed/pending
    num_trades = random.randint(5, 8)
    
    for i in range(num_trades):
        # Determine trade type (slightly more buys than sells)
        trade_type = "buy" if random.random() < 0.6 else "sell"
        
        # Generate price based on symbol
        if "BTC" in symbol:
            price = random.uniform(40000, 45000)
        elif "ETH" in symbol:
            price = random.uniform(3000, 3500)
        elif "XRP" in symbol:
            price = random.uniform(0.5, 0.65)
        elif "SOL" in symbol:
            price = random.uniform(90, 105)
        else:
            price = random.uniform(90, 110)
        
        # Generate amount
        if "BTC" in symbol:
            amount = random.uniform(0.01, 0.1)
        elif "ETH" in symbol:
            amount = random.uniform(0.1, 1.0)
        elif "XRP" in symbol:
            amount = random.uniform(100, 1000)
        elif "SOL" in symbol:
            amount = random.uniform(1, 10)
        else:
            amount = random.uniform(1, 5)
        
        # Determine status (most trades are completed, some are pending)
        status = "completed" if random.random() < 0.8 else "pending"
        
        # Create trade with time offset
        minutes_ago = random.randint(1, 60 * 24)  # Up to 24 hours ago
        time_str = (datetime.now() - timedelta(minutes=minutes_ago)).strftime("%H:%M:%S")
        
        trade = {
            "type": trade_type,
            "price": round(price, 2),
            "amount": round(amount, 4),
            "time": time_str,
            "status": status
        }
        
        TradeStorage.add_trade(trade)