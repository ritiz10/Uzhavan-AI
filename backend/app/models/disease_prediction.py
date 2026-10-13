from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class DiseasePrediction(Base):
    __tablename__ = "disease_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="SET NULL"), nullable=True, index=True)
    
    crop = Column(String(100), nullable=False)
    image_path = Column(String(255), nullable=True)
    predicted_disease = Column(String(150), nullable=False, index=True)
    confidence = Column(Float, nullable=False)
    severity = Column(String(50), default="Moderate", nullable=False)
    symptoms = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    prevention = Column(Text, nullable=True)
    model_type = Column(String(50), default="development_fallback", nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="disease_predictions")
    farm = relationship("Farm", back_populates="disease_predictions")
