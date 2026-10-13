from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_name = Column(String(150), nullable=False)
    district = Column(String(100), nullable=False, index=True)
    taluk = Column(String(100), nullable=True)
    village = Column(String(150), nullable=True)
    area = Column(Float, nullable=False, default=1.0)
    area_unit = Column(String(50), default="Acres", nullable=False)  # Acres, Hectares, Cents
    soil_type = Column(String(100), nullable=True)
    irrigation_type = Column(String(100), nullable=True)
    water_source = Column(String(100), nullable=True)
    current_crop = Column(String(100), nullable=True)
    previous_crop = Column(String(100), nullable=True)
    season = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="farms")
    crop_recommendations = relationship("CropRecommendation", back_populates="farm")
    disease_predictions = relationship("DiseasePrediction", back_populates="farm")
    irrigation_advisories = relationship("IrrigationAdvisory", back_populates="farm")
    weather_records = relationship("WeatherRecord", back_populates="farm")
