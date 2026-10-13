from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class WeatherForecastDay(BaseModel):
    date: str
    day_name: str
    temperature_min: float
    temperature_max: float
    humidity: float
    rain_probability: float
    condition: str
    icon: str
    agri_advice: str

class WeatherCurrentOut(BaseModel):
    district: str
    temperature: float
    humidity: float
    rain_probability: float
    rainfall: float
    wind_speed: float
    condition: str
    provider: str
    is_demo: bool
    recorded_at: datetime
    agricultural_summary: str

class WeatherForecastOut(BaseModel):
    district: str
    provider: str
    is_demo: bool
    current: WeatherCurrentOut
    forecast: List[WeatherForecastDay]
