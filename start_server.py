#!/usr/bin/env python3
"""
Startup script for the Trading Bot API server
"""
import uvicorn


if __name__ == "__main__":
    print("Starting Luno Trading Bot API server...")
    uvicorn.run(
        "backend.app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )