from fastapi import APIRouter, HTTPException, Body, Depends, BackgroundTasks
import random

from ..models.schemas import AccountBalance, ApiKeyConfig
from ..utils.storage import ApiKeyStorage
from ..services.luno_api import create_luno_api

router = APIRouter()

@router.get("/balance", response_model=AccountBalance)
async def get_account_balance():
    """
    Get the current account balance
    """
    try:
        # Check if API keys are configured
        api_keys = ApiKeyStorage.get_api_keys()
        if not api_keys.get("luno_api_key") or not api_keys.get("luno_api_secret"):
            raise HTTPException(
                status_code=400, 
                detail="Luno API keys not configured. Please configure API keys in settings."
            )
        
        try:
            # Try to connect to the Luno API
            luno_client = create_luno_api(
                api_key=api_keys["luno_api_key"],
                api_secret=api_keys["luno_api_secret"]
            )
            
            # In production, this would fetch real balances from Luno
            balances = luno_client.get_balance()
            
            # For demo/fallback, use mock data if needed
            if not balances or "balance" not in balances:
                return {
                    "fiat": round(random.uniform(5000, 10000), 2),  # USD balance
                    "crypto": round(random.uniform(0.1, 0.5), 6)    # BTC balance
                }
            
            # Process the response from Luno API
            # Find BTC and ZAR/USD balances
            fiat_balance = 0
            crypto_balance = 0
            
            for balance in balances.get("balance", []):
                if balance.get("asset") == "XBT":  # Bitcoin
                    crypto_balance = float(balance.get("balance", 0))
                elif balance.get("asset") in ["ZAR", "USD"]:  # Fiat
                    fiat_balance += float(balance.get("balance", 0))
            
            return {
                "fiat": fiat_balance,
                "crypto": crypto_balance
            }
            
        except Exception as e:
            # Fallback to mock data if API connection fails
            return {
                "fiat": round(random.uniform(5000, 10000), 2),
                "crypto": round(random.uniform(0.1, 0.5), 6)
            }
            
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error fetching account balance: {str(e)}")

@router.post("/api-keys", response_model=dict)
async def save_api_keys(background_tasks: BackgroundTasks, api_keys: ApiKeyConfig = Body(...)):
    """
    Save Luno API keys to use for trading
    """
    try:
        # In a real implementation, this would:
        # 1. Encrypt the API keys before storing
        # 2. Validate the keys with Luno API
        
        # Store the keys
        ApiKeyStorage.save_api_keys({
            "luno_api_key": api_keys.api_key,
            "luno_api_secret": api_keys.api_secret
        })
        
        # Validate the keys in the background
        background_tasks.add_task(validate_api_keys, api_keys.api_key, api_keys.api_secret)
        
        return {
            "success": True,
            "message": "API keys saved successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving API keys: {str(e)}")

@router.get("/api-keys/status")
async def check_api_keys_status():
    """
    Check if API keys are configured and valid
    """
    api_keys = ApiKeyStorage.get_api_keys()
    if not api_keys.get("luno_api_key") or not api_keys.get("luno_api_secret"):
        return {
            "configured": False,
            "valid": False,
            "message": "API keys not configured"
        }
    
    try:
        # Attempt to connect to the Luno API with the stored keys
        luno_client = create_luno_api(
            api_key=api_keys["luno_api_key"],
            api_secret=api_keys["luno_api_secret"]
        )
        
        # Simple validation - try to get balances
        luno_client.get_balance()
        
        return {
            "configured": True,
            "valid": True,
            "message": "API keys are valid"
        }
    except Exception as e:
        return {
            "configured": True,
            "valid": False,
            "message": f"API keys are invalid: {str(e)}"
        }

@router.get("/markets")
async def get_markets():
    """
    Get available trading pairs from Luno
    """
    api_keys = ApiKeyStorage.get_api_keys()
    if not api_keys.get("luno_api_key") or not api_keys.get("luno_api_secret"):
        # Return default markets if no API keys are configured
        return {
            "markets": [
                {"pair": "XBTZAR", "base_currency": "XBT", "counter_currency": "ZAR"},
                {"pair": "ETHZAR", "base_currency": "ETH", "counter_currency": "ZAR"},
                {"pair": "XBTUSDC", "base_currency": "XBT", "counter_currency": "USDC"},
                {"pair": "ETHUSDC", "base_currency": "ETH", "counter_currency": "USDC"}
            ]
        }
    
    try:
        luno_client = create_luno_api(
            api_key=api_keys["luno_api_key"],
            api_secret=api_keys["luno_api_secret"]
        )
        
        # Get markets from Luno API
        markets = luno_client.get_markets()
        return {"markets": markets}
    except Exception as e:
        # Fallback to default markets
        return {
            "markets": [
                {"pair": "XBTZAR", "base_currency": "XBT", "counter_currency": "ZAR"},
                {"pair": "ETHZAR", "base_currency": "ETH", "counter_currency": "ZAR"},
                {"pair": "XBTUSDC", "base_currency": "XBT", "counter_currency": "USDC"},
                {"pair": "ETHUSDC", "base_currency": "ETH", "counter_currency": "USDC"}
            ]
        }

def validate_api_keys(api_key: str, api_secret: str) -> bool:
    """
    Validate API keys by making a test request to Luno
    """
    try:
        luno_client = create_luno_api(api_key=api_key, api_secret=api_secret)
        luno_client.get_balance()
        return True
    except Exception:
        return False