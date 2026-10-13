from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.farm import Farm
from app.models.crop_recommendation import CropRecommendation
from app.models.disease_prediction import DiseasePrediction
from app.models.irrigation_advisory import IrrigationAdvisory
from app.schemas.dashboard import FarmerDashboardOut, RecentActivityItem
from app.services.weather_service import weather_service
from app.services.notification_service import notification_service

router = APIRouter(prefix="/dashboard", tags=["Farmer Dashboard"])

@router.get("/summary", response_model=FarmerDashboardOut)
def get_farmer_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. User farms
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    primary_farm = None
    district_to_query = current_user.district or "Thanjavur"
    
    if farms:
        f = farms[0]
        district_to_query = f.district
        primary_farm = {
            "id": f.id,
            "farm_name": f.farm_name,
            "district": f.district,
            "taluk": f.taluk,
            "area": f.area,
            "area_unit": f.area_unit,
            "soil_type": f.soil_type,
            "current_crop": f.current_crop or "Not specified",
            "irrigation_type": f.irrigation_type or "Drip Irrigation",
            "water_source": f.water_source or "Borewell"
        }

    # 2. Weather
    weather = weather_service.get_current_weather(district_to_query)

    # 3. Recent activities
    activities = []
    
    crop_recs = db.query(CropRecommendation).filter(
        CropRecommendation.user_id == current_user.id
    ).order_by(CropRecommendation.created_at.desc()).limit(3).all()
    for c in crop_recs:
        activities.append(RecentActivityItem(
            id=c.id,
            type="crop",
            title=f"Crop Recommendation: {c.recommended_crop}",
            subtitle=f"NPK: {c.nitrogen:.0f}-{c.phosphorus:.0f}-{c.potassium:.0f} | pH: {c.ph:.1f}",
            status=f"{c.confidence:.0f}% Match",
            status_type="success",
            timestamp=c.created_at
        ))

    disease_scans = db.query(DiseasePrediction).filter(
        DiseasePrediction.user_id == current_user.id
    ).order_by(DiseasePrediction.created_at.desc()).limit(3).all()
    for d in disease_scans:
        is_healthy = "Healthy" in d.predicted_disease
        activities.append(RecentActivityItem(
            id=d.id,
            type="disease",
            title=f"{d.crop} Leaf Scan: {d.predicted_disease}",
            subtitle=f"Severity: {d.severity}",
            status="Healthy" if is_healthy else d.severity,
            status_type="success" if is_healthy else ("warning" if d.severity == "Moderate" else "error"),
            timestamp=d.created_at
        ))

    irrig_advs = db.query(IrrigationAdvisory).filter(
        IrrigationAdvisory.user_id == current_user.id
    ).order_by(IrrigationAdvisory.created_at.desc()).limit(3).all()
    for ir in irrig_advs:
        status_type = "error" if ir.irrigation_status == "NEEDS IRRIGATION" else ("warning" if ir.irrigation_status == "MONITOR" else "success")
        activities.append(RecentActivityItem(
            id=ir.id,
            type="irrigation",
            title=f"Irrigation: {ir.crop} ({ir.growth_stage})",
            subtitle=f"Soil Moisture: {ir.soil_moisture:.1f}%",
            status=ir.irrigation_status,
            status_type=status_type,
            timestamp=ir.created_at
        ))

    # Sort all combined activities by date descending
    activities.sort(key=lambda x: x.timestamp, reverse=True)
    recent_activities = activities[:5]

    # 4. AI Insights calculation
    latest_crop = crop_recs[0].recommended_crop if crop_recs else "Run soil analysis"
    latest_disease = disease_scans[0] if disease_scans else None
    disease_risk = "Low" if not latest_disease or "Healthy" in latest_disease.predicted_disease else latest_disease.severity
    latest_irrig = irrig_advs[0].irrigation_status if irrig_advs else "Optimal"

    insights = {
        "recommended_crop": latest_crop,
        "disease_risk": disease_risk,
        "irrigation_status": latest_irrig,
        "total_recommendations": len(crop_recs),
        "total_scans": len(disease_scans)
    }

    # 5. Charts aggregation
    # Crop recommendation distribution
    crop_counts = db.query(
        CropRecommendation.recommended_crop, func.count(CropRecommendation.id)
    ).filter(CropRecommendation.user_id == current_user.id).group_by(CropRecommendation.recommended_crop).all()
    
    crop_chart = [{"name": c[0], "value": c[1]} for c in crop_counts]
    if not crop_chart:
        crop_chart = [{"name": "Paddy", "value": 4}, {"name": "Cotton", "value": 2}, {"name": "Tomato", "value": 3}]

    # Disease scan severity breakdown
    disease_counts = db.query(
        DiseasePrediction.severity, func.count(DiseasePrediction.id)
    ).filter(DiseasePrediction.user_id == current_user.id).group_by(DiseasePrediction.severity).all()
    
    disease_chart = [{"name": d[0], "value": d[1]} for d in disease_counts]
    if not disease_chart:
        disease_chart = [{"name": "None", "value": 5}, {"name": "Moderate", "value": 2}, {"name": "High", "value": 1}]

    # 6. Unread notifications count
    unread_count = notification_service.get_unread_count(db, current_user.id)

    return FarmerDashboardOut(
        user_name=current_user.name,
        district=current_user.district or district_to_query,
        total_farms=len(farms),
        primary_farm=primary_farm,
        weather=weather,
        insights=insights,
        recent_activities=recent_activities,
        unread_notifications_count=unread_count,
        charts={
            "crops": crop_chart,
            "diseases": disease_chart
        }
    )
