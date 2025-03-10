from fastapi import APIRouter, HTTPException, Body, Depends
import random

from ..models.schemas import AccountBalance, ApiKeyConfig
from ..utils.storage import ApiKeyStorage

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
        
        # In a real implementation, this would:
        # 1. Connect to the Luno API using the stored credentials
        # 2. Fetch the actual account balance
        
        # For demo purposes, we'll return mock values
        return {
            "fiat": round(random.uniform(5000, 10000), 2),  # USD balance
            "crypto": round(random.uniform(0.1, 0.5), 6)    # BTC balance
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Error fetching account balance: {str(e)}")

@router.post("/api-keys", response_model=dict)
async def save_api_keys(api_keys: ApiKeyConfig = Body(...)):
    """
    Save Luno API keys to use for trading
    """
    try:
        # In a real implementation, this would:
        # 1. Encrypt the API keys before storing
        # 2. Validate the keys with Luno API
        
        # For demo purposes, we'll just store the keys as-is
        ApiKeyStorage.save_api_keys({
            "luno_api_key": api_keys.api_key,
            "luno_api_secret": api_keys.api_secret
        })
        
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
    
    # In a real implementation, this would:
    # 1. Attempt to connect to the Luno API with the stored keys
    # 2. Return the actual validation status
    
    # For demo purposes, we'll just assume they're valid if they exist
    return {
        "configured": True,
        "valid": True,
        "message": "API keys are valid"
    }