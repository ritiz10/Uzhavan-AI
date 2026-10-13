from app.schemas.auth import (
    UserRegister, UserLogin, UserUpdate, PasswordChange, UserOut, Token, TokenData
)
from app.schemas.farm import FarmCreate, FarmUpdate, FarmOut
from app.schemas.crop import (
    CropRecommendationInput, CropRecommendationOut, AlternativeCrop,
    CropCreate, CropUpdate, CropOut
)
from app.schemas.disease import (
    DiseasePredictionOut, DiseaseCreate, DiseaseUpdate, DiseaseOut
)
from app.schemas.irrigation import IrrigationInput, IrrigationOut
from app.schemas.weather import WeatherCurrentOut, WeatherForecastDay, WeatherForecastOut
from app.schemas.notification import NotificationOut
from app.schemas.dashboard import FarmerDashboardOut, AdminDashboardOut

__all__ = [
    "UserRegister", "UserLogin", "UserUpdate", "PasswordChange", "UserOut", "Token", "TokenData",
    "FarmCreate", "FarmUpdate", "FarmOut",
    "CropRecommendationInput", "CropRecommendationOut", "AlternativeCrop",
    "CropCreate", "CropUpdate", "CropOut",
    "DiseasePredictionOut", "DiseaseCreate", "DiseaseUpdate", "DiseaseOut",
    "IrrigationInput", "IrrigationOut",
    "WeatherCurrentOut", "WeatherForecastDay", "WeatherForecastOut",
    "NotificationOut",
    "FarmerDashboardOut", "AdminDashboardOut"
]
