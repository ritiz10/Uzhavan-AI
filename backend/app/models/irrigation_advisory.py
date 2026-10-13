from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class IrrigationAdvisory(Base):
    __tablename__ = "irrigation_advisories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="SET NULL"), nullable=True, index=True)
    
    crop = Column(String(100), nullable=False)
    growth_stage = Column(String(100), nullable=False)
    soil_type = Column(String(100), nullable=True)
    soil_moisture = Column(Float, nullable=False)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    rain_probability = Column(Float, nullable=True)
    land_area = Column(Float, nullable=True)
    irrigation_type = Column(String(100), nullable=True)
    
    # Decision outputs
    irrigation_status = Column(String(50), nullable=False)  # NEEDS IRRIGATION, MONITOR, NO IMMEDIATE IRRIGATION
    recommended_action = Column(Text, nullable=False)
    water_estimate = Column(String(100), nullable=True)     # e.g., "1,200 Litres / acre"
    recommended_timing = Column(String(150), nullable=True) # e.g., "Early morning (5:30 AM - 8:00 AM)"
    reason = Column(Text, nullable=True)
    weather_consideration = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="irrigation_advisories")
    farm = relationship("Farm", back_populates="irrigation_advisories")
