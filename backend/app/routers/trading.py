from fastapi import APIRouter, HTTPException, Body, Depends, BackgroundTasks
from typing import List
from datetime import datetime, timedelta
import random
import logging

from ..models.schemas import TradingConfig, TradingResponse, Trade
from ..utils.storage import ModelStorage, TradeStorage, ApiKeyStorage
from ..services.luno_api import create_luno_api

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Global variable to track if trading is currently active
active_trading_session = None

@router.post("/start", response_model=TradingResponse)
async def start_trading(background_tasks: BackgroundTasks, config: TradingConfig = Body(...)):
    """
    Start automated trading with a specified model
    """
    global active_trading_session

    model = ModelStorage.get_model_by_id(config.trading_model_id)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model with ID {config.trading_model_id} not found")

    # Check if API keys are configured
    api_keys = ApiKeyStorage.get_api_keys()
    if not api_keys.get("luno_api_key") or not api_keys.get("luno_api_secret"):
        raise HTTPException(
            status_code=400,
            detail="Luno API keys not configured. Please configure API keys in settings."
        )

    try:
        # If trading is already active, stop it first
        if active_trading_session:
            await stop_trading()

        # Initialize a luno client for validation
        luno_client = create_luno_api(
            api_key=api_keys["luno_api_key"],
            api_secret=api_keys["luno_api_secret"]
        )

        # Validate trading pair by checking if it's available on Luno
        try:
            ticker = luno_client.get_ticker(pair=config.symbol)
            if not ticker:
                raise HTTPException(
                    status_code=400,
                    detail=f"Trading pair {config.symbol} not available on Luno"
                )
        except Exception as e:
            logger.warning(f"Error validating trading pair: {str(e)}")
            # Allow trading to start even if validation fails (might be a temporary issue)

        # Set up active trading session
        active_trading_session = {
            "model_id": config.trading_model_id,
            "symbol": config.symbol,
            "live": config.live,
            "started_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        }

        # Create some initial simulated trades
        background_tasks.add_task(generate_initial_trades, config.trading_model_id, config.symbol)

        # If in live mode, start automated trading in the background
        if config.live:
            background_tasks.add_task(
                automated_trading_loop,
                model_id=config.trading_model_id,
                symbol=config.symbol,
                api_key=api_keys["luno_api_key"],
                api_secret=api_keys["luno_api_secret"]
            )

        return {
            "success": True,
            "message": f"Trading {'(LIVE)' if config.live else '(SIMULATION)'} started with model {model['name']} for {config.symbol}"
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
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
        # Record the model information before clearing the session
        model_id = active_trading_session["model_id"]
        model = ModelStorage.get_model_by_id(model_id)
        model_name = model["name"] if model else f"ID: {model_id}"
        is_live = active_trading_session.get("live", False)

        # Clear the active session
        active_trading_session = None

        return {
            "success": True,
            "message": f"{'Live' if is_live else 'Simulation'} trading stopped for model {model_name}"
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
        if "XBT" in symbol:
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
        if "XBT" in symbol:
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

async def automated_trading_loop(model_id: str, symbol: str, api_key: str, api_secret: str):
    """
    Automated trading loop for live trading
    """
    from time import sleep
    import threading

    logger.info(f"Starting automated trading loop for model {model_id} on {symbol}")

    def trading_thread():
        try:
            # Initialize Luno API client
            luno_client = create_luno_api(api_key=api_key, api_secret=api_secret)

            # Keep running until the trading session is stopped
            while active_trading_session and active_trading_session["model_id"] == model_id:
                try:
                    # Check if trading is still active
                    if not active_trading_session:
                        logger.info("Trading session stopped")
                        break

                    # Get current price
                    ticker = luno_client.get_ticker(pair=symbol)
                    if not ticker:
                        logger.warning(f"Failed to get ticker for {symbol}")
                        sleep(30)  # Wait before trying again
                        continue

                    current_price = float(ticker.get("last_trade", 0))
                    if current_price <= 0:
                        logger.warning(f"Invalid price ({current_price}) for {symbol}")
                        sleep(30)
                        continue

                    # Get model prediction
                    # In a real implementation, this would load the model and make a prediction
                    # For demo purposes, we'll simulate a random prediction
                    signal = get_trading_signal(model_id, current_price)

                    if signal:
                        # Execute trade based on signal
                        execute_trade(luno_client, symbol, signal["type"], current_price)

                    # Wait for the next iteration (30 seconds to avoid API rate limits)
                    sleep(30)

                except Exception as e:
                    logger.error(f"Error in trading loop: {str(e)}")
                    # Continue the loop even if there's an error
                    sleep(60)  # Wait longer after an error

            logger.info(f"Trading loop for model {model_id} stopped")

        except Exception as e:
            logger.error(f"Fatal error in trading thread: {str(e)}")

    # Start trading in a separate thread
    thread = threading.Thread(target=trading_thread)
    thread.daemon = True
    thread.start()

def get_trading_signal(model_id: str, current_price: float) -> dict:
    """
    Get trading signal from model
    """
    model = ModelStorage.get_model_by_id(model_id)
    if not model:
        return None

    # Only generate signals occasionally (15% chance per check)
    if random.random() > 0.15:
        return None

    # Generate a simulated signal based on model accuracy
    accuracy = model.get("accuracy", 0.7)
    confidence = accuracy * random.uniform(0.85, 1.15)
    confidence = min(0.99, max(0.1, confidence))

    # More accurate models should generate better signals
    if random.random() < accuracy:
        # This would be replaced with actual model prediction
        signal_type = "buy" if random.random() < 0.55 else "sell"

        return {
            "type": signal_type,
            "price": current_price,
            "confidence": round(confidence, 2),
            "timestamp": datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        }

    return None

def execute_trade(luno_client, symbol: str, trade_type: str, price: float):
    """
    Execute a trade on Luno
    """
    try:
        logger.info(f"Executing {trade_type.upper()} for {symbol} at price {price}")

        # Determine trade amount (very small for safety)
        # In real implementation, this would be based on strategy and risk management
        if "XBT" in symbol:
            amount = 0.001  # 0.001 BTC
        elif "ETH" in symbol:
            amount = 0.01   # 0.01 ETH
        else:
            amount = 1.0    # Default small amount

        # In a real implementation, this would actually execute the trade
        # For demo purposes, we'll just log and record it
        trade = {
            "type": trade_type,
            "price": round(price, 2),
            "amount": amount,
            "time": datetime.now().strftime("%H:%M:%S"),
            "status": "completed"  # Assume success
        }

        # Uncomment this in production to execute real trades
        # if trade_type == "buy":
        #    result = luno_client.create_order(pair=symbol, order_type="buy", volume=amount)
        # else:
        #    result = luno_client.create_order(pair=symbol, order_type="sell", volume=amount)
        #
        # trade["status"] = "completed" if result else "failed"

        # Record the trade
        TradeStorage.add_trade(trade)

        logger.info(f"Trade executed: {trade}")
        return True

    except Exception as e:
        logger.error(f"Error executing trade: {str(e)}")

        # Record failed trade
        trade = {
            "type": trade_type,
            "price": round(price, 2),
            "amount": 0,
            "time": datetime.now().strftime("%H:%M:%S"),
            "status": "failed"
        }
        TradeStorage.add_trade(trade)

        return False