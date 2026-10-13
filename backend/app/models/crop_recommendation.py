from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class CropRecommendation(Base):
    __tablename__ = "crop_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Soil and climate parameters
    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)
    ph = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    
    # Context
    season = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True, index=True)
    soil_type = Column(String(100), nullable=True)
    
    # Prediction output
    recommended_crop = Column(String(100), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    explanation = Column(Text, nullable=True)
    model_type = Column(String(50), default="development_fallback", nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="crop_recommendations")
    farm = relationship("Farm", back_populates="crop_recommendations")
