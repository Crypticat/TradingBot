from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

# Fix imports to use relative imports
from .routers import prices, models, trading, account, tasks
from .config import get_config, configure_logging

# Configure logging using the centralized configuration
configure_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting TradingBot API...")

    # Initialize database and task manager
    try:
        from .db.database import get_db_manager
        from .services.task_manager import get_task_manager
        from .services.shared_memory import initialize_shared_memory

        # Initialize database
        db_manager = get_db_manager()
        logger.info("Database initialized")

        # Initialize shared memory
        initialize_shared_memory(db_manager)
        logger.info("Shared memory initialized")

        # Initialize and start task manager
        task_manager = get_task_manager()
        task_manager.start()
        logger.info("Task manager started")

    except Exception as e:
        logger.error("Failed to initialize services: %s", e)
        raise

    yield

    # Shutdown
    logger.info("Shutting down TradingBot API...")
    try:
        from .services.task_manager import get_task_manager
        task_manager = get_task_manager()
        task_manager.stop()
        logger.info("Task manager stopped")
    except Exception as e:
        logger.error("Error during shutdown: %s", e)


app = FastAPI(
    title="Luno Trading Bot API",
    description="API for Luno cryptocurrency trading bot with task management",
    version="0.1.0",
    lifespan=lifespan
)

# Get configuration
config = get_config()

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prices.router, prefix="/api/prices", tags=["prices"])
app.include_router(models.router, prefix="/api/models", tags=["models"])
app.include_router(trading.router, prefix="/api/trading", tags=["trading"])
app.include_router(account.router, prefix="/api/account", tags=["account"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])

@app.get("/", tags=["root"])
async def root():
    """Root endpoint to check if API is running"""
    return JSONResponse(content={
        "status": "online",
        "message": "Luno Trading Bot API with Task Management is running",
        "version": "0.1.0"
    })

@app.get("/config", tags=["config"])
async def get_app_config():
    """Get current application configuration"""
    config = get_config()
    return JSONResponse(content={
        "log_level": config.get_log_level_name(),
        "host": config.host,
        "port": config.port,
        "reload": config.reload,
        "cors_origins": config.cors_origins,
        "db_path": config.db_path,
        "task_manager_enabled": config.task_manager_enabled
    })

@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint"""
    try:
        from .services.task_manager import get_task_manager
        task_manager = get_task_manager()
        status = task_manager.get_status()

        return JSONResponse(content={
            "status": "healthy",
            "task_manager": status,
            "timestamp": "2024-01-01T00:00:00Z"  # Will be updated by the actual datetime
        })
    except Exception as e:
        logger.error("Health check failed: %s", e)
        return JSONResponse(
            status_code=500,
            content={
                "status": "unhealthy",
                "error": str(e)
            }
        )

if __name__ == "__main__":
    import uvicorn
    config = get_config()
    uvicorn.run(
        "app.main:app",
        host=config.host,
        port=config.port,
        reload=config.reload
    )