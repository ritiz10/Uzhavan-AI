from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.weather import WeatherCurrentOut, WeatherForecastOut
from app.services.weather_service import weather_service

router = APIRouter(prefix="/weather", tags=["Agro-Weather Intelligence"])

@router.get("/current", response_model=WeatherCurrentOut)
def get_current_weather(
    district: Optional[str] = Query("Thanjavur", description="Tamil Nadu district name")
):
    """Fetch current real-time or simulated agro-climatic parameters for specified district."""
    return weather_service.get_current_weather(district)

@router.get("/forecast", response_model=WeatherForecastOut)
def get_weather_forecast(
    district: Optional[str] = Query("Thanjavur", description="Tamil Nadu district name")
):
    """Fetch 7-day agro-meteorological forecast with farming advisories."""
    return weather_service.get_forecast(district)
