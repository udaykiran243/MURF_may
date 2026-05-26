"""
SereneMind AI - Emotional Support Companion Backend
FastAPI application with real-time voice therapy capabilities
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from app.api import voice_router, auth_router, therapy_router, user_router, admin_router
from app.database import init_db

# Application initialization
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown
    pass

# Create FastAPI app
app = FastAPI(
    title="SereneMind AI",
    description="AI-powered emotional support and therapy companion",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
ALLOWED_ORIGINS = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(voice_router.router, prefix="/api/voice", tags=["voice"])
app.include_router(therapy_router.router, prefix="/api/therapy", tags=["therapy"])
app.include_router(user_router.router, prefix="/api/users", tags=["users"])
app.include_router(admin_router.router, prefix="/api/admin", tags=["admin"])

@app.get("/")
async def root():
    return {
        "message": "SereneMind AI - Emotional Support Companion",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SereneMind AI Backend"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=os.getenv("DEBUG", False),
        log_level="info"
    )
