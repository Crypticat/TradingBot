from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime, timedelta
import random
import logging

from ..models.schemas import CryptoPrice
from ..utils.storage import PriceStorage, ApiKeyStorage
from ..services.luno_api import create_luno_api

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/orderbook")
async def get_order_book(
    symbol: str = Query(..., description="Trading pair symbol (e.g., XBTZAR)")
):
    """
    Get the current order book for a cryptocurrency pair
    """
    try:
        try:
            # Create a Luno client without API keys since they're not required for public endpoints
            from luno_python.client import Client as LunoClient
            luno_client = LunoClient()
            
            # Get order book data from Luno
            order_book = luno_client.get_order_book(pair=symbol)
            if order_book:
                return {
                    "timestamp": datetime.now().isoformat(),
                    "pair": symbol,
                    "asks": order_book.get("asks", []),
                    "bids": order_book.get("bids", [])
                }
        except Exception as e:
            logger.warning(f"Failed to get order book from Luno API: {e}. Falling back to mock data.")
            # Continue to mock data if Luno API fails
        
        # If Luno API fails, generate mock order book
        return generate_mock_order_book(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching order book: {str(e)}")

def generate_mock_order_book(symbol: str) -> dict:
    """
    Generate mock order book data
    """
    # Get a base price for the symbol to build realistic order book around
    prices = PriceStorage.get_prices(symbol, "1h")
    if prices and len(prices) > 0:
        base_price = prices[-1]["price"]  # Use last known price
    else:
        # Set base price based on symbol if no price history
        if "XBT" in symbol:
            base_price = 42000.0
        elif "ETH" in symbol:
            base_price = 3200.0
        elif "XRP" in symbol:
            base_price = 0.58
        elif "SOL" in symbol:
            base_price = 95.0
        else:
            base_price = 100.0
    
    # Generate asks (sell orders) - slightly above base price
    asks = []
    current_ask = base_price * 1.001  # Start 0.1% above base price
    for i in range(10):  # Generate 10 ask levels
        volume = round(random.uniform(0.01, 2.0), 6)
        asks.append({
            "price": str(round(current_ask, 2)),
            "volume": str(volume)
        })
        # Increase price by 0.1-0.3% for next level
        current_ask *= (1 + random.uniform(0.001, 0.003))
    
    # Generate bids (buy orders) - slightly below base price
    bids = []
    current_bid = base_price * 0.999  # Start 0.1% below base price
    for i in range(10):  # Generate 10 bid levels
        volume = round(random.uniform(0.01, 2.0), 6)
        bids.append({
            "price": str(round(current_bid, 2)),
            "volume": str(volume)
        })
        # Decrease price by 0.1-0.3% for next level
        current_bid *= (1 - random.uniform(0.001, 0.003))
    
    return {
        "timestamp": datetime.now().isoformat(),
        "pair": symbol,
        "asks": asks,
        "bids": bids
    }

@router.get("/historical", response_model=List[CryptoPrice])
async def get_historical_prices(
    symbol: str = Query(..., description="Trading pair symbol (e.g., XBTZAR)"),
    interval: str = Query(..., description="Time interval (e.g., 1h, 4h, 1d)"),
    from_time: Optional[str] = Query(None, alias="from", description="Start time (ISO format)"),
    to_time: Optional[str] = Query(None, alias="to", description="End time (ISO format)")
):
    """
    Get historical price data for a cryptocurrency pair
    """
    try:
        # Try to get data from Luno if API keys are configured
        api_keys = ApiKeyStorage.get_api_keys()
        if api_keys.get("luno_api_key") and api_keys.get("luno_api_secret"):
            try:
                # Format to match Luno API requirements
                # Convert interval string to seconds
                interval_seconds = convert_interval_to_seconds(interval)
                
                luno_client = create_luno_api(
                    api_key=api_keys["luno_api_key"],
                    api_secret=api_keys["luno_api_secret"]
                )
                
                # Attempt to get data from Luno API
                # Note: Depending on the actual API capabilities, this might need adjustment
                print(f"Fetching data from Luno for {symbol} with interval {interval} and duration {interval_seconds} seconds")
                # Get candle data from Luno
                candle_data = luno_client.get_candles(
                    pair=symbol,
                    since=from_time,
                    duration=interval_seconds
                )

                print(f"Received candle data")
                
                if candle_data and len(candle_data.get('candles', [])) > 0:
                    # Process candle data to match our schema
                    return process_candle_data(candle_data.get('candles', []))
                
                # Fall back to trade data if candles aren't available
                trades = luno_client.get_trades(pair=symbol, since=from_time)
                if trades and 'trades' in trades and len(trades['trades']) > 0:
                    # Process trade data into price points
                    return process_trade_data(trades.get('trades', []), interval_seconds)
            
            except Exception as e:
                logger.warning(f"Failed to get data from Luno API: {e}. Falling back to cached/mock data.")
                # Continue to cached/mock data if Luno API fails
        
        # Check if we have cached data
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
    symbol: str = Query(..., description="Trading pair symbol (e.g., XBTZAR)")
):
    """
    Get current live price for a cryptocurrency pair
    """
    try:
        # Try to get live price from Luno if API keys are configured
        api_keys = ApiKeyStorage.get_api_keys()
        if api_keys.get("luno_api_key") and api_keys.get("luno_api_secret"):
            try:
                luno_client = create_luno_api(
                    api_key=api_keys["luno_api_key"],
                    api_secret=api_keys["luno_api_secret"]
                )
                
                # Get ticker data from Luno
                ticker = luno_client.get_ticker(pair=symbol)
                if ticker and 'last_trade' in ticker:
                    return {
                        "time": datetime.now().strftime("%H:%M:%S"),
                        "price": float(ticker['last_trade']),
                        "volume": float(ticker.get('rolling_24_hour_volume', 0))
                    }
            except Exception as e:
                logger.warning(f"Failed to get live price from Luno API: {e}. Falling back to cached/mock data.")
                # Continue to cached/mock data if Luno API fails
        
        # If Luno API fails or keys aren't configured, fall back to cached/mock data
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

@router.get("/tickers")
async def get_all_tickers():
    """
    Get ticker information for all available trading pairs on Luno
    """
    try:
        try:
            # Create a Luno client without API keys since they're not required for public endpoints
            from luno_python.client import Client as LunoClient
            luno_client = LunoClient()
            
            # Get all tickers from Luno
            tickers = luno_client.get_tickers()
            if tickers and "tickers" in tickers:
                return {
                    "timestamp": datetime.now().isoformat(),
                    "tickers": tickers.get("tickers", [])
                }
        except Exception as e:
            logger.warning(f"Failed to get tickers from Luno API: {e}. Falling back to mock data.")
            # Continue to mock data if Luno API fails
        
        # If Luno API fails, generate mock ticker data
        return generate_mock_tickers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching tickers: {str(e)}")

def generate_mock_tickers() -> dict:
    """
    Generate mock ticker data for common trading pairs
    """
    common_pairs = [
        "XBTZAR", "ETHZAR", "XRPZAR", "LTCZAR", "BCHZAR",
        "XBTUSDC", "ETHUSDC", "XRPUSDC", "LTCUSDC", "BCHUSDC"
    ]
    
    tickers = []
    
    for pair in common_pairs:
        # Set base price based on the first currency in the pair
        if "XBT" in pair:
            base_price = random.uniform(40000, 45000)
        elif "ETH" in pair:
            base_price = random.uniform(3000, 3500)
        elif "XRP" in pair:
            base_price = random.uniform(0.5, 0.65)
        elif "LTC" in pair:
            base_price = random.uniform(70, 85)
        elif "BCH" in pair:
            base_price = random.uniform(250, 280)
        else:
            base_price = random.uniform(50, 150)
        
        # Generate random ticker data
        bid = base_price * (1 - random.uniform(0.001, 0.005))
        ask = base_price * (1 + random.uniform(0.001, 0.005))
        last_trade = random.uniform(bid, ask)
        rolling_24_hour_volume = random.uniform(10, 100)
        
        tickers.append({
            "pair": pair,
            "timestamp": int(datetime.now().timestamp() * 1000),
            "bid": str(round(bid, 2)),
            "ask": str(round(ask, 2)),
            "last_trade": str(round(last_trade, 2)),
            "rolling_24_hour_volume": str(round(rolling_24_hour_volume, 2)),
            "status": "ACTIVE"
        })
    
    return {
        "timestamp": datetime.now().isoformat(),
        "tickers": tickers
    }

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
    if "XBT" in symbol:
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

def convert_interval_to_seconds(interval: str) -> int:
    """
    Convert interval string (e.g., '1h', '4h', '1d') to seconds
    """
    if interval.endswith('m'):
        return int(interval[:-1]) * 60
    elif interval.endswith('h'):
        return int(interval[:-1]) * 3600
    elif interval.endswith('d'):
        return int(interval[:-1]) * 86400
    else:
        return 3600  # Default to 1 hour

def process_candle_data(candles: List[dict]) -> List[dict]:
    """
    Process Luno candle data to match our schema
    """
    result = []
    for candle in candles:
        result.append({
            "time": candle.get("timestamp", ""),
            "price": float(candle.get("close", 0)),
            "volume": float(candle.get("volume", 0))
        })
    return result

def process_trade_data(trades: List[dict], interval_seconds: int) -> List[dict]:
    """
    Process Luno trade data into aggregated price points based on the interval
    """
    if not trades:
        return []
    
    # Group trades by time interval
    grouped_trades = {}
    for trade in trades:
        timestamp = trade.get("timestamp", "")
        if not timestamp:
            continue
            
        # Parse timestamp and round to interval
        try:
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            interval_start = dt.replace(
                microsecond=0,
                second=0,
                minute=(dt.minute // (interval_seconds // 60)) * (interval_seconds // 60)
            )
            key = interval_start.strftime("%Y-%m-%dT%H:%M:%S")
            
            if key not in grouped_trades:
                grouped_trades[key] = {
                    "prices": [],
                    "volumes": [],
                    "time": key
                }
                
            grouped_trades[key]["prices"].append(float(trade.get("price", 0)))
            grouped_trades[key]["volumes"].append(float(trade.get("volume", 0)))
        except (ValueError, TypeError) as e:
            logger.warning(f"Error parsing trade timestamp {timestamp}: {e}")
            continue
    
    # Calculate average price and total volume for each interval
    result = []
    for key, data in grouped_trades.items():
        if data["prices"]:
            avg_price = sum(data["prices"]) / len(data["prices"])
            total_volume = sum(data["volumes"])
            
            result.append({
                "time": data["time"],
                "price": round(avg_price, 2),
                "volume": round(total_volume, 2)
            })
    
    # Sort by time
    result.sort(key=lambda x: x["time"])
    return result