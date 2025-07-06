#!/usr/bin/env python3
"""
Startup script for the Trading Bot API server
"""
import uvicorn
import os
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

if __name__ == "__main__":
    print("Starting Luno Trading Bot API server...")
    # Import and configure logging before starting
    from backend.app.config import get_config, configure_logging
    configure_logging()

    config = get_config()
    print(f"Log level: {config.get_log_level_name()}")
    print(f"Server will run on {config.host}:{config.port}")

    uvicorn.run(
        "backend.app.main:app",
        host=config.host,
        port=config.port,
        reload=config.reload
    )