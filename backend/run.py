"""
Script to run the FastAPI server
"""
import uvicorn

if __name__ == "__main__":
    print("Starting Luno Trading Bot API server...")
    # Import and configure logging before starting
    from app.config import get_config, configure_logging
    configure_logging()

    config = get_config()
    print(f"Log level: {config.get_log_level_name()}")
    print(f"Server will run on {config.host}:{config.port}")

    uvicorn.run(
        "app.main:app",
        host=config.host,
        port=config.port,
        reload=config.reload
    )
