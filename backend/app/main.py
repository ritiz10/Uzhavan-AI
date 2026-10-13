import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.database import init_db
from app.ai.model_loader import model_manager
from app.routers import (
    auth_router,
    farms_router,
    crop_router,
    disease_router,
    irrigation_router,
    weather_router,
    dashboard_router,
    notifications_router,
    admin_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and verify AI models
    print(f"[Startup] Initializing Database Schema...")
    init_db()
    print(f"[Startup] Verifying AI / ML Models...")
    _ = model_manager.get_models_status()
    print(f"[Startup] AI-Based Tamil Nadu Smart Farming Assistant backend is ready.")
    yield
    # Shutdown
    print(f"[Shutdown] Backend stopped.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Full-stack AI-powered agricultural advisory platform specialized for Tamil Nadu farmers. Delivers crop recommendations, plant disease detection, and smart irrigation scheduling.",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    msg = first_error.get("msg", "Validation error")
    loc = " -> ".join([str(l) for l in first_error.get("loc", [])])
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": f"{loc}: {msg}", "errors": errors}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    print(f"[Unhandled Error] {type(exc).__name__}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact agricultural support if issue persists."}
    )

# Static files for uploads if needed
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(farms_router, prefix=settings.API_V1_PREFIX)
app.include_router(crop_router, prefix=settings.API_V1_PREFIX)
app.include_router(disease_router, prefix=settings.API_V1_PREFIX)
app.include_router(irrigation_router, prefix=settings.API_V1_PREFIX)
app.include_router(weather_router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_V1_PREFIX)
app.include_router(notifications_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)

@app.get("/api/health", tags=["Health"])
def health_check():
    """System health check and uptime probe."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "models": model_manager.get_models_status()
    }

@app.get("/api/ai/status", tags=["AI Status"])
def get_ai_status():
    """Provides transparent metadata about whether trained models or fallback inference are active."""
    return model_manager.get_models_status()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
