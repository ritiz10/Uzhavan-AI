from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
import json
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Based Tamil Nadu Smart Farming Assistant"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"

    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./smart_farming.db",
        description="SQLAlchemy DB URL (MySQL or SQLite)"
    )

    # JWT
    JWT_SECRET: str = "tamil_nadu_smart_farming_super_secret_jwt_key_2026_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_DIR: str = os.path.join(BASE_DIR, "ai", "models")
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "..", "uploads")

    # Weather
    WEATHER_API_KEY: str = ""
    WEATHER_PROVIDER: str = "mock"  # "mock" or "openweather"

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure required directories exist
os.makedirs(settings.MODEL_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
