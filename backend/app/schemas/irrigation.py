from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class IrrigationInput(BaseModel):
    farm_id: Optional[int] = None
    crop: str = Field(..., min_length=2)
    growth_stage: str = Field(..., description="Vegetative, Flowering, Fruiting, Maturity, Initial, Tillering")
    soil_type: Optional[str] = "Red Loam"
    soil_moisture: float = Field(..., ge=0, le=100, description="Volumetric soil moisture percentage (0-100%)")
    temperature: Optional[float] = Field(default=30.0, ge=0, le=60)
    humidity: Optional[float] = Field(default=65.0, ge=0, le=100)
    rainfall: Optional[float] = Field(default=0.0, ge=0)
    rain_probability: Optional[float] = Field(default=10.0, ge=0, le=100, description="Forecast rain probability %")
    land_area: Optional[float] = Field(default=1.0, gt=0)
    irrigation_type: Optional[str] = "Drip Irrigation"

class IrrigationOut(BaseModel):
    id: Optional[int] = None
    crop: str
    growth_stage: str
    irrigation_status: str       # NEEDS IRRIGATION, MONITOR, NO IMMEDIATE IRRIGATION
    status_color: str            # red, yellow, green
    recommended_action: str
    water_estimate: str
    recommended_timing: str
    reason: str
    weather_consideration: str
    assumptions_note: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
