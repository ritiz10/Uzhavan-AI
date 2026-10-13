from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="farmer", nullable=False)  # "farmer", "admin"
    district = Column(String(100), nullable=True, index=True)
    village = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    farms = relationship("Farm", back_populates="user", cascade="all, delete-orphan")
    crop_recommendations = relationship("CropRecommendation", back_populates="user", cascade="all, delete-orphan")
    disease_predictions = relationship("DiseasePrediction", back_populates="user", cascade="all, delete-orphan")
    irrigation_advisories = relationship("IrrigationAdvisory", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
