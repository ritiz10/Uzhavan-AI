from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class RecentActivityItem(BaseModel):
    id: int
    type: str  # "crop", "disease", "irrigation"
    title: str
    subtitle: str
    status: str
    status_type: str  # success, warning, info, error
    timestamp: datetime

class FarmerDashboardOut(BaseModel):
    user_name: str
    district: Optional[str]
    total_farms: int
    primary_farm: Optional[Dict[str, Any]]
    weather: Optional[Dict[str, Any]]
    insights: Dict[str, Any]
    recent_activities: List[RecentActivityItem]
    unread_notifications_count: int
    charts: Dict[str, Any]

class AdminDashboardOut(BaseModel):
    total_farmers: int
    total_farms: int
    total_crop_predictions: int
    total_disease_scans: int
    total_irrigation_advisories: int
    active_users_count: int
    charts: Dict[str, Any]
    recent_farmers: List[Dict[str, Any]]
    recent_predictions: List[Dict[str, Any]]
    recent_disease_scans: List[Dict[str, Any]]
    recent_advisories: List[Dict[str, Any]]
