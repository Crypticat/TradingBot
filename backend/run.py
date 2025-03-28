"""
Script to run the FastAPI server
"""
import uvicorn

if __name__ == "__main__":
    print("Starting Luno Trading Bot API server...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
