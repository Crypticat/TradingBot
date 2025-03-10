"""
Service for integrating with the Luno API
"""
import hmac
import hashlib
import base64
import time
from typing import Dict, List, Optional, Any
import requests
from requests.exceptions import RequestException

class LunoAPI:
    """
    Luno API client for trading cryptocurrency
    """
    BASE_URL = "https://api.luno.com/api/1"
    
    def __init__(self, api_key: str, api_secret: str):
        """Initialize with API credentials"""
        self.api_key = api_key
        self.api_secret = api_secret
    
    def _make_request(self, method: str, endpoint: str, params: Optional[Dict] = None) -> Dict:
        """Make authenticated request to Luno API"""
        url = f"{self.BASE_URL}/{endpoint}"
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Basic {base64.b64encode(f"{self.api_key}:{self.api_secret}".encode()).decode()}'
        }
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method.upper() == 'POST':
                response = requests.post(url, headers=headers, data=params)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            response.raise_for_status()
            return response.json()
        except RequestException as e:
            raise Exception(f"Error connecting to Luno API: {str(e)}")
    
    def get_balance(self) -> Dict[str, Any]:
        """Get account balances"""
        return self._make_request('GET', 'balance')
    
    def get_ticker(self, pair: str) -> Dict[str, Any]:
        """Get ticker for a trading pair"""
        return self._make_request('GET', 'ticker', {'pair': pair})
    
    def get_tickers(self) -> Dict[str, Any]:
        """Get tickers for all trading pairs"""
        return self._make_request('GET', 'tickers')
    
    def get_order_book(self, pair: str) -> Dict[str, Any]:
        """Get order book for a trading pair"""
        return self._make_request('GET', 'orderbook', {'pair': pair})
    
    def get_trades(self, pair: str, since: Optional[str] = None) -> Dict[str, Any]:
        """Get recent trades for a trading pair"""
        params = {'pair': pair}
        if since:
            params['since'] = since
        return self._make_request('GET', 'trades', params)
    
    def get_orders(self, state: Optional[str] = None, pair: Optional[str] = None) -> Dict[str, Any]:
        """Get orders for the account"""
        params = {}
        if state:
            params['state'] = state
        if pair:
            params['pair'] = pair
        return self._make_request('GET', 'listorders', params)
    
    def create_order(self, pair: str, type: str, price: Optional[float] = None, volume: float = None) -> Dict[str, Any]:
        """Create a new order"""
        params = {
            'pair': pair,
            'type': type,
        }
        
        if price:
            params['price'] = str(price)
        
        if volume:
            params['volume'] = str(volume)
            
        return self._make_request('POST', 'postorder', params)
    
    def stop_order(self, order_id: str) -> Dict[str, Any]:
        """Stop an order"""
        return self._make_request('POST', 'stoporder', {'order_id': order_id})

# Factory function to create a Luno API client
def create_luno_api(api_key: str, api_secret: str) -> LunoAPI:
    """Create a Luno API client with the given credentials"""
    return LunoAPI(api_key=api_key, api_secret=api_secret)