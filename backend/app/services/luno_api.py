"""
Service for integrating with the Luno API using luno-python library
"""
from typing import Dict, List, Optional, Any
from datetime import datetime
import logging
import luno_python.client as luno

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LunoAPI:
    """
    Luno API client for trading cryptocurrency using luno-python library
    """
    
    def __init__(self, api_key: str, api_secret: str):
        """Initialize with API credentials"""
        self.api_key = api_key
        self.api_secret = api_secret
        self.client = luno.Client(api_key_id=api_key, api_key_secret=api_secret)
    
    def get_balance(self) -> Dict[str, Any]:
        """Get account balances"""
        try:
            return self.client.get_balances()
        except Exception as e:
            logger.error(f"Error getting balances: {str(e)}")
            raise Exception(f"Error connecting to Luno API: {str(e)}")
    
    def get_ticker(self, pair: str) -> Dict[str, Any]:
        """Get ticker for a trading pair"""
        try:
            return self.client.get_ticker(pair=pair)
        except Exception as e:
            logger.error(f"Error getting ticker for {pair}: {str(e)}")
            raise Exception(f"Error connecting to Luno API: {str(e)}")
    
    def get_tickers(self) -> Dict[str, Any]:
        """Get tickers for all trading pairs"""
        try:
            return self.client.get_tickers()
        except Exception as e:
            logger.error(f"Error getting tickers: {str(e)}")
            raise Exception(f"Error connecting to Luno API: {str(e)}")
    
    def get_order_book(self, pair: str) -> Dict[str, Any]:
        """Get order book for a trading pair"""
        try:
            return self.client.get_order_book(pair=pair)
        except Exception as e:
            logger.error(f"Error getting order book for {pair}: {str(e)}")
            raise Exception(f"Error connecting to Luno API: {str(e)}")
    
    def get_trades(self, pair: str, since: Optional[str] = None) -> Dict[str, Any]:
        """Get recent trades for a trading pair"""
        try:
            params = {'pair': pair}
            if since:
                params['since'] = since
            return self.client.list_trades(pair=pair, since=since)
        # get_trades(pair=pair, since=since)
        except Exception as e:
            logger.error(f"Error getting trades for {pair}: {str(e)}")
            raise Exception(f"Error connecting to Luno API: {str(e)}")
    
    def get_orders(self, state: Optional[str] = None, pair: Optional[str] = None) -> Dict[str, Any]:
        """Get orders for the account"""
        try:
            return self.client.list_orders(state=state, pair=pair)
        except Exception as e:
            logger.error(f"Error listing orders: {str(e)}")
            raise Exception(f"Error connecting to Luno API: {str(e)}")
    
    def create_order(self, pair: str, order_type: str, price: Optional[float] = None, volume: float = None) -> Dict[str, Any]:
        """Create a new order"""
        try:
            # Convert types to match luno-python's expectations
            if price is not None:
                price = str(price)
            if volume is not None:
                volume = str(volume)
                
            if order_type.lower() == 'buy':
                return self.client.post_market_order(pair=pair, type='BID', volume=volume, price=price)
            elif order_type.lower() == 'sell':
                return self.client.post_market_order(pair=pair, type='ASK', volume=volume, price=price)
            else:
                raise ValueError(f"Unsupported order type: {order_type}. Use 'buy' or 'sell'.")
        except Exception as e:
            logger.error(f"Error creating order: {str(e)}")
            raise Exception(f"Error connecting to Luno API: {str(e)}")
    
    def stop_order(self, order_id: str) -> Dict[str, Any]:
        """Stop an order"""
        try:
            return self.client.stop_order(order_id=order_id)
        except Exception as e:
            logger.error(f"Error stopping order {order_id}: {str(e)}")
            raise Exception(f"Error connecting to Luno API: {str(e)}")
    
    def get_markets(self) -> List[Dict[str, Any]]:
        """Get available markets (trading pairs)"""
        try:
            response = self.client.get_markets()
            return response.get('markets', [])
        except Exception as e:
            logger.error(f"Error getting markets: {str(e)}")
            raise Exception(f"Error connecting to Luno API: {str(e)}")
    
    def get_candles(self, pair: str, since: Optional[str] = None, duration: int = 60) -> Dict[str, Any]:
        """
        Get candlestick data
        
        Args:
            pair: Trading pair
            since: Timestamp since when to get candles (ISO format or milliseconds since epoch)
            duration: Candle duration in seconds (e.g., 60, 300, 900, 1800, 3600, 86400)
        """
        try:
            # Convert ISO timestamp to milliseconds since epoch if provided
            since_ms = None
            if since:
                try:
                    # Check if since is already in milliseconds format (numeric string)
                    if since.isdigit():
                        since_ms = since
                    else:
                        # Parse ISO format timestamp
                        dt = datetime.fromisoformat(since.replace('Z', '+00:00'))
                        since_ms = str(int(dt.timestamp() * 1000))
                except ValueError as e:
                    logger.warning(f"Invalid timestamp format: {e}")
            
            logger.info(f"Getting candles for {pair} with duration {duration}s, since: {since_ms}")
            
            # Call Luno API to get candle data
            # Note: This assumes the Luno API has a get_candles method
            # In production, verify this method exists or implement a custom solution
            candles = self.client.get_candles(
                pair=pair,
                duration=duration,
                since=since_ms
            )
            
            return candles
        except Exception as e:
            logger.error(f"Error getting candles for {pair}: {str(e)}")
            raise Exception(f"Error connecting to Luno API: {str(e)}")
    
    # def _fetch_candles_from_trades(self, pair: str, since: Optional[str] = None, duration: int = 60) -> List[Dict]:
    #     """
    #     Build candles from trade data (helper method)
    #     This is a simplified implementation; in a real app, you'd implement proper OHLC calculation
    #     """
    #     # Get trades and process them into candles
    #     trades = self.get_trades(pair, since)
    #     if 'trades' not in trades:
    #         return []
            
    #     # Logic to process trades into candles would go here
    #     # This is simplified example code
    #     candles = []
    #     # Process logic would group trades by time intervals and calculate OHLC
        
    #     return candles

# Factory function to create a Luno API client
def create_luno_api(api_key: str, api_secret: str) -> LunoAPI:
    """Create a Luno API client with the given credentials"""
    return LunoAPI(api_key=api_key, api_secret=api_secret)