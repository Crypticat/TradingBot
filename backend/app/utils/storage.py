import json
import os
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from pathlib import Path

# Create data directory if it doesn't exist
DATA_DIR = Path(__file__).parent.parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

def save_to_file(data: Any, filename: str) -> None:
    """Save data to a JSON file"""
    file_path = DATA_DIR / filename
    with open(file_path, "w") as f:
        json.dump(data, f, default=str)

def load_from_file(filename: str, default: Any = None) -> Any:
    """Load data from a JSON file"""
    file_path = DATA_DIR / filename
    print(f"Loading data from {file_path}")
    if not file_path.exists():
        return default
    with open(file_path, "r") as f:
        return json.load(f)

def generate_id() -> str:
    """Generate a unique ID"""
    return str(uuid.uuid4())

class ModelStorage:
    """Storage for model data"""
    FILENAME = "models.json"

    @classmethod
    def save_models(cls, models: List[Dict]) -> None:
        """Save models to file"""
        save_to_file(models, cls.FILENAME)

    @classmethod
    def get_models(cls) -> List[Dict]:
        """Get all models"""
        return load_from_file(cls.FILENAME, [])

    @classmethod
    def get_model_by_id(cls, model_id: str) -> Optional[Dict]:
        """Get a model by ID"""
        models = cls.get_models()
        for model in models:
            if model["id"] == model_id:
                return model
        return None

    @classmethod
    def add_model(cls, model: Dict) -> Dict:
        """Add a new model"""
        models = cls.get_models()
        model["id"] = generate_id()
        model["status"] = "active"
        model["accuracy"] = 0.0  # Will be updated after training
        model["last_run"] = None
        models.append(model)
        cls.save_models(models)
        return model

    @classmethod
    def update_model(cls, model_id: str, updates: Dict) -> Optional[Dict]:
        """Update a model"""
        models = cls.get_models()
        for i, model in enumerate(models):
            if model["id"] == model_id:
                models[i].update(updates)
                cls.save_models(models)
                return models[i]
        return None

class TradeStorage:
    """Storage for trade data"""
    FILENAME = "trades.json"

    @classmethod
    def save_trades(cls, trades: List[Dict]) -> None:
        """Save trades to file"""
        save_to_file(trades, cls.FILENAME)

    @classmethod
    def get_trades(cls) -> List[Dict]:
        """Get all trades"""
        return load_from_file(cls.FILENAME, [])

    @classmethod
    def add_trade(cls, trade: Dict) -> Dict:
        """Add a new trade"""
        trades = cls.get_trades()
        trade["id"] = len(trades) + 1
        trade["time"] = datetime.now().strftime("%H:%M:%S")
        trades.append(trade)
        cls.save_trades(trades)
        return trade

class ApiKeyStorage:
    """Storage for API keys"""
    FILENAME = "api_keys.json"

    @classmethod
    def save_api_keys(cls, api_keys: Dict) -> None:
        """Save API keys to file"""
        save_to_file(api_keys, cls.FILENAME)

    @classmethod
    def get_api_keys(cls) -> Dict:
        """Get API keys"""
        print(f"Loading API keys from {cls.FILENAME}")
        return load_from_file(cls.FILENAME, {})

class PriceStorage:
    """Storage for price data"""
    
    @classmethod
    def save_prices(cls, symbol: str, interval: str, prices: List[Dict]) -> None:
        """Save prices to file"""
        filename = f"{symbol.lower()}_{interval.lower()}_prices.json"
        save_to_file(prices, filename)

    @classmethod
    def get_prices(cls, symbol: str, interval: str) -> List[Dict]:
        """Get prices for a symbol and interval"""
        filename = f"{symbol.lower()}_{interval.lower()}_prices.json"
        return load_from_file(filename, [])