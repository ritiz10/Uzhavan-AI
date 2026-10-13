from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Disease(Base):
    __tablename__ = "diseases"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    symptoms = Column(Text, nullable=False)
    severity = Column(String(50), default="Moderate", nullable=False)  # Low, Moderate, High, Severe
    prevention = Column(Text, nullable=True)
    advisory = Column(Text, nullable=True)

    # Relationships
    crop_rel = relationship("Crop", back_populates="diseases")
