from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class FarmCreate(BaseModel):
    farm_name: str = Field(..., min_length=2, max_length=150)
    district: str = Field(..., min_length=2, max_length=100)
    taluk: Optional[str] = None
    village: Optional[str] = None
    area: float = Field(..., gt=0)
    area_unit: str = Field(default="Acres")
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    water_source: Optional[str] = None
    current_crop: Optional[str] = None
    previous_crop: Optional[str] = None
    season: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FarmUpdate(BaseModel):
    farm_name: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    area: Optional[float] = Field(None, gt=0)
    area_unit: Optional[str] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None
    water_source: Optional[str] = None
    current_crop: Optional[str] = None
    previous_crop: Optional[str] = None
    season: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class FarmOut(BaseModel):
    id: int
    user_id: int
    farm_name: str
    district: str
    taluk: Optional[str]
    village: Optional[str]
    area: float
    area_unit: str
    soil_type: Optional[str]
    irrigation_type: Optional[str]
    water_source: Optional[str]
    current_crop: Optional[str]
    previous_crop: Optional[str]
    season: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
