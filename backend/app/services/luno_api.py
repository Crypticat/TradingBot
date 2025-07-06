"""
Service for integrating with the Luno API using luno-python library
"""
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta, timezone
import logging
import requests
import luno_python.client as luno
# pylint: disable=broad-exception-raised

# Set up logging
logger = logging.getLogger(__name__)


class LunoAPI:
    """
    Luno API client for trading cryptocurrency using luno-python library
    """

    def __init__(self, api_key: Optional[str] = None, api_secret: Optional[str] = None):
        """Initialize with optional API credentials for authenticated endpoints"""
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = "https://api.luno.com/api/1"

        # Create authenticated client only if credentials provided
        if api_key and api_secret:
            self.client = luno.Client(api_key_id=api_key, api_key_secret=api_secret)
        else:
            self.client = None

    def _make_public_request(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make a public API request using requests library"""
        try:
            url = f"{self.base_url}/{endpoint}"
            response = requests.get(url, params=params or {}, timeout=10)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as exc:
            logger.error("Error making public request to %s: %s", endpoint, str(exc))
            raise Exception(f"Error connecting to Luno API: {str(exc)}") from exc

    def get_balance(self) -> Dict[str, Any]:
        """Get account balances (requires authentication)"""
        if not self.client:
            raise Exception("API credentials required for balance information")

        try:
            return self.client.get_balances()
        except Exception as exc:
            logger.error("Error getting balances: %s", str(exc))
            raise Exception(f"Error connecting to Luno API: {str(exc)}") from exc

    def get_ticker(self, pair: str) -> Dict[str, Any]:
        """Get ticker for a trading pair (public endpoint)"""
        try:
            return self._make_public_request("ticker", {"pair": pair})
        except Exception as exc:
            logger.error("Error getting ticker for %s: %s", pair, str(exc))
            raise Exception(f"Error connecting to Luno API: {str(exc)}") from exc

    def get_tickers(self) -> Dict[str, Any]:
        """Get tickers for all trading pairs (public endpoint)"""
        try:
            return self._make_public_request("tickers")
        except Exception as exc:
            logger.error("Error getting tickers: %s", str(exc))
            raise Exception(f"Error connecting to Luno API: {str(exc)}") from exc

    def get_order_book(self, pair: str) -> Dict[str, Any]:
        """Get order book for a trading pair (public endpoint)"""
        try:
            return self._make_public_request("orderbook", {"pair": pair})
        except Exception as exc:
            logger.error("Error getting order book for %s: %s", pair, str(exc))
            raise Exception(f"Error connecting to Luno API: {str(exc)}") from exc

    def get_trades(self, pair: str, since: Optional[str] = None) -> Dict[str, Any]:
        """Get recent trades for a trading pair"""
        if since:
            # Check if since is already in milliseconds format (numeric string)
            if isinstance(since, str) and since.isdigit():
                since_ms = since
            else:
                try:
                    # Parse human-readable timestamp
                    dt = datetime.fromisoformat(since.replace('Z', '+00:00'))
                    since_ms = str(int(dt.timestamp() * 1000))
                except ValueError as exc:
                    logger.warning("Invalid timestamp format: %s", str(exc))
                    since_ms = None
        else:
            since_ms = None

        # Check if since_ms is less than 24 hours since now, if so make it 24 hours since now
        if since_ms:
            since_dt = datetime.fromtimestamp(int(since_ms) / 1000, tz=timezone.utc)
            now_dt = datetime.now(timezone.utc)
            if (now_dt - since_dt).total_seconds() > 24 * 3600:
                logger.warning("Since timestamp is more than 24 hours old, "+
                               "using 24 hour old time instead")
                since_ms = str(int((now_dt - timedelta(hours=23, minutes=59)).timestamp() * 1000))
                # Show human readable timestamp
                # Convert since_ms to datetime
                since_dt = datetime.fromtimestamp(int(since_ms) / 1000)
                logger.warning("Since timestamp: %s", since_dt.isoformat())

        try:
            if not self.client:
                raise Exception("API credentials required for trades data")
            return self.client.list_trades(pair=pair, since=since_ms)
        except Exception as exc:
            logger.error("Error getting trades for %s: %s", pair, str(exc))
            raise Exception(f"Error connecting to Luno API: {str(exc)}") from exc

    def get_orders(self, state: Optional[str] = None, pair: Optional[str] = None) -> Dict[str, Any]:
        """Get orders for the account (requires authentication)"""
        if not self.client:
            raise Exception("API credentials required for orders data")

        try:
            return self.client.list_orders(state=state, pair=pair)
        except Exception as exc:
            logger.error("Error listing orders: %s", str(exc))
            raise Exception(f"Error connecting to Luno API: {str(exc)}") from exc

    def create_order(self, pair: str, order_type: str, price: Optional[float] = None,
                     volume: Optional[float] = None, is_market_order: bool = False,
                     counter_volume: Optional[float] = None) -> Dict[str, Any]:
        """
        Create a new order (market or limit)

        Args:
            pair: Trading pair (e.g., 'XBTZAR')
            order_type: 'buy' or 'sell'
            price: Limit price (required for limit orders)
            volume: Amount of base currency to buy/sell (e.g., amount of BTC)
            is_market_order: Whether this is a market order
            counter_volume: Amount of counter currency to use (for market buy orders)
        """
        try:
            # Convert to strings as required by Luno API
            price_str = str(price) if price is not None else None
            volume_str = str(volume) if volume is not None else None
            counter_volume_str = str(counter_volume) if counter_volume is not None else None

            order_type_lower = order_type.lower()

            if is_market_order:
                # Market order handling
                if order_type_lower == 'buy':
                    # For market buy, we use counter_volume (e.g., amount of ZAR to spend)
                    if counter_volume_str is None:
                        raise ValueError("Market buy orders require counter_volume parameter")
                    return self.client.post_market_order(
                        pair=pair,
                        type='BUY',
                        counter_volume=counter_volume_str
                    )
                elif order_type_lower == 'sell':
                    # For market sell, we use base_volume (e.g., amount of BTC to sell)
                    if volume_str is None:
                        raise ValueError("Market sell orders require volume parameter")
                    return self.client.post_market_order(
                        pair=pair,
                        type='SELL',
                        base_volume=volume_str
                    )
                else:
                    raise ValueError(f"Unsupported order type: {order_type}. Use 'buy' or 'sell'.")
            else:
                # Limit order handling
                if price_str is None or volume_str is None:
                    raise ValueError("Limit orders require both price and volume parameters")

                if order_type_lower == 'buy':
                    return self.client.post_limit_order(
                        pair=pair,
                        type='BID',
                        price=price_str,
                        volume=volume_str
                    )
                elif order_type_lower == 'sell':
                    return self.client.post_limit_order(
                        pair=pair,
                        type='ASK',
                        price=price_str,
                        volume=volume_str
                    )
                else:
                    raise ValueError(f"Unsupported order type: {order_type}. Use 'buy' or 'sell'.")
        except Exception as exc:
            logger.error("Error creating order: %s", str(exc))
            raise Exception(f"Error connecting to Luno API: {str(exc)}") from exc

    def stop_order(self, order_id: str) -> Dict[str, Any]:
        """Stop an order"""
        try:
            return self.client.stop_order(order_id=order_id)
        except Exception as exc:
            logger.error("Error stopping order %s: %s", order_id, str(exc))
            raise Exception(f"Error connecting to Luno API: {str(exc)}") from exc

    def get_markets(self) -> List[Dict[str, Any]]:
        """Get available markets (trading pairs) - public endpoint"""
        try:
            response = self._make_public_request("markets")
            return response.get('markets', [])
        except Exception as exc:
            logger.error("Error getting markets: %s", str(exc))
            raise Exception(f"Error connecting to Luno API: {str(exc)}") from exc

    def get_candles(self, pair: str, since: Optional[str] = None,
                    duration: int = 60) -> Dict[str, Any]:
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
                except ValueError as exc:
                    logger.warning("Invalid timestamp format: %s", str(exc))

            logger.info("Getting candles for %s with duration %ss, since: %s",
                      pair, duration, since_ms)

            # Call Luno API to get candle data
            candles = self.client.get_candles(
                pair=pair,
                duration=duration,
                since=since_ms
            )

            return candles
        except Exception as exc:
            logger.error("Error getting candles for %s: %s", pair, str(exc))
            raise Exception(f"Error connecting to Luno API: {str(exc)}") from exc



# Factory function to create a Luno API client
def create_luno_api(api_key: str, api_secret: str) -> LunoAPI:
    """Create a Luno API client with the given credentials"""
    return LunoAPI(api_key=api_key, api_secret=api_secret)
