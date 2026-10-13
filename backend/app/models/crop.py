from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    scientific_name = Column(String(150), nullable=True)
    season = Column(String(100), nullable=True)
    water_requirement = Column(String(100), nullable=True)  # Low, Medium, High, Very High
    soil_types = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)

    # Relationships
    diseases = relationship("Disease", back_populates="crop_rel", cascade="all, delete-orphan")
