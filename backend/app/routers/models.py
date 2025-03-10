from fastapi import APIRouter, HTTPException, Body, Query, Depends
from typing import List, Optional
import random
from datetime import datetime, timedelta

from ..models.schemas import ModelCreate, ModelOut, TradeSignal
from ..utils.storage import ModelStorage

router = APIRouter()

@router.get("/", response_model=List[ModelOut])
async def get_models():
    """
    Get all available models
    """
    try:
        models = ModelStorage.get_models()
        return models
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching models: {str(e)}")

@router.get("/{model_id}", response_model=ModelOut)
async def get_model(model_id: str):
    """
    Get a specific model by ID
    """
    model = ModelStorage.get_model_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model with ID {model_id} not found")
    return model

@router.post("/", response_model=ModelOut)
async def create_model(model: ModelCreate = Body(...)):
    """
    Create a new model from labeled data points
    """
    try:
        # In a real implementation, this would:
        # 1. Process labeled data points
        # 2. Train a machine learning model (e.g., classification or regression)
        # 3. Save the model to disk
        # 4. Evaluate model accuracy
        
        # For demo purposes, we'll just save the model metadata
        model_dict = model.model_dump()
        
        # Calculate mock accuracy based on number of labeled points
        num_points = len(model_dict["labeled_points"])
        model_accuracy = min(0.5 + (num_points / 200), 0.95)  # More points = higher accuracy, up to 95%
        
        # Add model to storage with calculated accuracy
        created_model = ModelStorage.add_model(model_dict)
        created_model["accuracy"] = round(model_accuracy, 2)
        ModelStorage.update_model(created_model["id"], {"accuracy": created_model["accuracy"]})
        
        return created_model
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating model: {str(e)}")

@router.get("/{model_id}/run", response_model=List[TradeSignal])
async def run_model(
    model_id: str,
    symbol: str = Query(..., description="Trading pair symbol (e.g., BTC-USD)"),
    live: bool = Query(False, description="Whether to use live data")
):
    """
    Run a model to get trading signals
    """
    model = ModelStorage.get_model_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model with ID {model_id} not found")
    
    try:
        # In a real implementation, this would:
        # 1. Load the trained model from disk
        # 2. Fetch current market data (historical or live)
        # 3. Preprocess the data and extract features
        # 4. Make predictions using the model
        # 5. Generate trading signals based on predictions
        
        # For demo purposes, we'll generate mock signals
        signals = generate_mock_signals(model, symbol, live)
        
        # Update the model's last_run timestamp
        now = datetime.now().strftime("%Y-%m-%dT%H:%M:%S")
        ModelStorage.update_model(model_id, {"last_run": now})
        
        return signals
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error running model: {str(e)}")

def generate_mock_signals(model: dict, symbol: str, live: bool) -> List[dict]:
    """
    Generate mock trading signals for a model
    """
    # Use model accuracy to determine signal confidence
    accuracy = model.get("accuracy", 0.7)
    
    # Generate 1-3 signals
    num_signals = random.randint(1, 3)
    signals = []
    
    for _ in range(num_signals):
        # Randomize signal type with slight buy bias
        signal_type = "buy" if random.random() < 0.55 else "sell"
        
        # Generate price with slight variation based on symbol
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
        
        # Generate confidence based on model accuracy with some randomness
        confidence = accuracy * random.uniform(0.85, 1.15)
        confidence = min(0.99, max(0.1, confidence))  # Clamp between 0.1 and 0.99
        
        # Generate timestamp with some variance
        hours_offset = random.randint(0, 6) if not live else 0
        now = datetime.now()
        timestamp = (now - timedelta(hours=hours_offset)).strftime("%Y-%m-%dT%H:%M:%S")
        
        signals.append({
            "type": signal_type,
            "price": round(price, 2),
            "confidence": round(confidence, 2),
            "timestamp": timestamp
        })
    
    # Sort by timestamp (newest first)
    signals.sort(key=lambda s: s["timestamp"], reverse=True)
    
    return signals