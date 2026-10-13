from app.routers.auth import router as auth_router
from app.routers.farms import router as farms_router
from app.routers.crop_recommendation import router as crop_router
from app.routers.disease_detection import router as disease_router
from app.routers.irrigation import router as irrigation_router
from app.routers.weather import router as weather_router
from app.routers.dashboard import router as dashboard_router
from app.routers.notifications import router as notifications_router
from app.routers.admin import router as admin_router

__all__ = [
    "auth_router",
    "farms_router",
    "crop_router",
    "disease_router",
    "irrigation_router",
    "weather_router",
    "dashboard_router",
    "notifications_router",
    "admin_router"
]
