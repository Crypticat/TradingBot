#!/usr/bin/env python3
"""
Startup script for the Trading Bot API server
"""
import uvicorn
import os
import sys

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting Luno Trading Bot API server...")
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )