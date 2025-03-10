from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Fix imports to use relative imports
from .routers import prices, models, trading, account

app = FastAPI(
    title="Luno Trading Bot API",
    description="API for Luno cryptocurrency trading bot",
    version="0.1.0"
)

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prices.router, prefix="/api/prices", tags=["prices"])
app.include_router(models.router, prefix="/api/models", tags=["models"])
app.include_router(trading.router, prefix="/api/trading", tags=["trading"])
app.include_router(account.router, prefix="/api/account", tags=["account"])

@app.get("/", tags=["root"])
async def root():
    """Root endpoint to check if API is running"""
    return JSONResponse(content={
        "status": "online",
        "message": "Luno Trading Bot API is running",
        "version": "0.1.0"
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)