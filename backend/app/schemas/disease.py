from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class DiseasePredictionOut(BaseModel):
    id: Optional[int] = None
    crop: str
    predicted_disease: str
    confidence: float
    confidence_display: str
    severity: str
    symptoms: str
    recommendation: str
    prevention: str
    expert_advisory: str
    model_type: str
    is_fallback: bool
    disclaimer: str
    image_url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DiseaseCreate(BaseModel):
    crop_id: Optional[int] = None
    name: str = Field(..., min_length=2)
    symptoms: str = Field(..., min_length=5)
    severity: str = "Moderate"
    prevention: Optional[str] = None
    advisory: Optional[str] = None

class DiseaseUpdate(BaseModel):
    crop_id: Optional[int] = None
    name: Optional[str] = None
    symptoms: Optional[str] = None
    severity: Optional[str] = None
    prevention: Optional[str] = None
    advisory: Optional[str] = None

class DiseaseOut(BaseModel):
    id: int
    crop_id: Optional[int]
    name: str
    symptoms: str
    severity: str
    prevention: Optional[str]
    advisory: Optional[str]

    class Config:
        from_attributes = True
