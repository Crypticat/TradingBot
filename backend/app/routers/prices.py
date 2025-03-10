from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
import random

from ..models.schemas import CryptoPrice
from ..utils.storage import PriceStorage

router = APIRouter()

@router.get("/historical", response_model=List[CryptoPrice])
async def get_historical_prices(
    symbol: str = Query(..., description="Trading pair symbol (e.g., BTC-USD)"),
    interval: str = Query(..., description="Time interval (e.g., 1h, 4h, 1d)"),
    from_time: Optional[str] = Query(None, alias="from", description="Start time (ISO format)"),
    to_time: Optional[str] = Query(None, alias="to", description="End time (ISO format)")
):
    """
    Get historical price data for a cryptocurrency pair
    """
    try:
        # First check if we have cached data
        prices = PriceStorage.get_prices(symbol, interval)
        
        # If no cached data, generate mock data
        if not prices:
            prices = generate_mock_price_data(symbol, interval)
            PriceStorage.save_prices(symbol, interval, prices)
            
        # Filter by time range if specified
        if from_time or to_time:
            filtered_prices = []
            for price in prices:
                time_str = price["time"]
                if from_time and time_str < from_time:
                    continue
                if to_time and time_str > to_time:
                    continue
                filtered_prices.append(price)
            return filtered_prices
            
        return prices
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching historical prices: {str(e)}")

@router.get("/live", response_model=CryptoPrice)
async def get_live_price(
    symbol: str = Query(..., description="Trading pair symbol (e.g., BTC-USD)")
):
    """
    Get current live price for a cryptocurrency pair
    """
    try:
        # In a real implementation, this would fetch from Luno API
        # For now, we'll generate a realistic current price
        
        # Get historical data to base our live price on
        prices = PriceStorage.get_prices(symbol, "1h")
        
        if not prices:
            # Generate sample data if none exists
            prices = generate_mock_price_data(symbol, "1h")
            PriceStorage.save_prices(symbol, "1h", prices)
        
        # Take the last price and add a small random change
        last_price = prices[-1]["price"]
        change = random.uniform(-0.02, 0.02) * last_price  # +/- 2%
        current_price = max(0, last_price + change)  # Ensure price is positive
        
        return {
            "time": datetime.now().strftime("%H:%M:%S"),
            "price": round(current_price, 2),
            "volume": random.uniform(10, 1000)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching live price: {str(e)}")

def generate_mock_price_data(symbol: str, interval: str) -> List[dict]:
    """
    Generate mock cryptocurrency price data
    """
    now = datetime.now()
    prices = []
    
    # Determine time step and number of data points based on interval
    if interval == "5m":
        time_step = timedelta(minutes=5)
        data_points = 288  # 24 hours of 5-minute data
    elif interval == "15m":
        time_step = timedelta(minutes=15)
        data_points = 96  # 24 hours of 15-minute data
    elif interval == "1h":
        time_step = timedelta(hours=1)
        data_points = 168  # 7 days of hourly data
    elif interval == "4h":
        time_step = timedelta(hours=4)
        data_points = 90  # 15 days of 4-hour data
    elif interval == "1d":
        time_step = timedelta(days=1)
        data_points = 60  # 60 days of daily data
    else:
        time_step = timedelta(hours=1)
        data_points = 24  # Default to 24 hours of hourly data
    
    # Set base price based on symbol
    if "BTC" in symbol:
        base_price = 42000.0
        volatility = 0.02  # 2% volatility
    elif "ETH" in symbol:
        base_price = 3200.0
        volatility = 0.025  # 2.5% volatility
    elif "XRP" in symbol:
        base_price = 0.58
        volatility = 0.03  # 3% volatility
    elif "SOL" in symbol:
        base_price = 95.0
        volatility = 0.035  # 3.5% volatility
    else:
        base_price = 100.0
        volatility = 0.02  # Default 2% volatility
    
    # Generate data with slight trend and random noise
    current_price = base_price
    for i in range(data_points):
        timestamp = now - time_step * (data_points - i)
        
        # Add a slight trend (25% chance of trend change at each point)
        if random.random() < 0.25:
            trend = random.uniform(-0.005, 0.005)  # -0.5% to +0.5% trend
        
        # Add random price movement
        change = random.normalvariate(0, volatility) * current_price
        current_price = max(0.01, current_price * (1 + change))
        
        # Add volume (correlated with price change)
        volume = abs(change) * random.uniform(500, 2000) / current_price
        
        prices.append({
            "time": timestamp.strftime("%Y-%m-%dT%H:%M:%S"),
            "price": round(current_price, 2),
            "volume": round(volume, 2)
        })
    
    return prices