from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class CropRecommendationInput(BaseModel):
    farm_id: Optional[int] = None
    nitrogen: float = Field(..., ge=0, le=300, description="Nitrogen content in soil (kg/ha)")
    phosphorus: float = Field(..., ge=0, le=200, description="Phosphorus content in soil (kg/ha)")
    potassium: float = Field(..., ge=0, le=300, description="Potassium content in soil (kg/ha)")
    ph: float = Field(..., ge=0, le=14, description="Soil pH value (0 - 14)")
    temperature: float = Field(..., ge=0, le=60, description="Temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity %")
    rainfall: float = Field(..., ge=0, le=3000, description="Annual / seasonal rainfall in mm")
    
    # Optional context
    soil_type: Optional[str] = None
    district: Optional[str] = None
    season: Optional[str] = None
    land_area: Optional[float] = None
    irrigation_type: Optional[str] = None
    previous_crop: Optional[str] = None
    water_availability: Optional[str] = None
    organic_carbon: Optional[float] = None

class AlternativeCrop(BaseModel):
    crop: str
    confidence: float

class CropRecommendationOut(BaseModel):
    id: Optional[int] = None
    recommended_crop: str
    confidence: float
    confidence_display: str
    suitability: str
    expected_growing_season: str
    water_requirement: str
    fertilizer_guidance: str
    reason: str
    alternatives: List[AlternativeCrop] = []
    model_type: str
    is_fallback: bool
    disclaimer: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Master Crop
class CropCreate(BaseModel):
    name: str = Field(..., min_length=2)
    scientific_name: Optional[str] = None
    season: Optional[str] = None
    water_requirement: Optional[str] = None
    soil_types: Optional[str] = None
    description: Optional[str] = None

class CropUpdate(BaseModel):
    name: Optional[str] = None
    scientific_name: Optional[str] = None
    season: Optional[str] = None
    water_requirement: Optional[str] = None
    soil_types: Optional[str] = None
    description: Optional[str] = None

class CropOut(BaseModel):
    id: int
    name: str
    scientific_name: Optional[str]
    season: Optional[str]
    water_requirement: Optional[str]
    soil_types: Optional[str]
    description: Optional[str]

    class Config:
        from_attributes = True
