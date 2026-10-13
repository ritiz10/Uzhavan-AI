from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.user import User
from app.models.farm import Farm
from app.models.crop import Crop
from app.models.disease import Disease
from app.models.crop_recommendation import CropRecommendation
from app.models.disease_prediction import DiseasePrediction
from app.models.irrigation_advisory import IrrigationAdvisory
from app.models.audit_log import AuditLog
from app.schemas.crop import CropCreate, CropUpdate, CropOut
from app.schemas.disease import DiseaseCreate, DiseaseUpdate, DiseaseOut
from app.schemas.auth import UserOut
from app.schemas.farm import FarmOut
from app.schemas.dashboard import AdminDashboardOut

router = APIRouter(prefix="/admin", tags=["Admin Portal"], dependencies=[Depends(get_current_admin)])

@router.get("/statistics", response_model=AdminDashboardOut)
def get_system_statistics(db: Session = Depends(get_db)):
    total_farmers = db.query(User).filter(User.role == "farmer").count()
    total_farms = db.query(Farm).count()
    total_preds = db.query(CropRecommendation).count()
    total_scans = db.query(DiseasePrediction).count()
    total_advisories = db.query(IrrigationAdvisory).count()
    total_users = db.query(User).count()

    # District distribution of farmers
    district_counts = db.query(
        User.district, func.count(User.id)
    ).filter(User.district.isnot(None)).group_by(User.district).all()
    district_chart = [{"name": d[0], "value": d[1]} for d in district_counts if d[0]]

    # Crop recommendation distribution
    crop_counts = db.query(
        CropRecommendation.recommended_crop, func.count(CropRecommendation.id)
    ).group_by(CropRecommendation.recommended_crop).all()
    crop_chart = [{"name": c[0], "value": c[1]} for c in crop_counts]

    # Disease scan breakdown
    disease_counts = db.query(
        DiseasePrediction.predicted_disease, func.count(DiseasePrediction.id)
    ).group_by(DiseasePrediction.predicted_disease).all()
    disease_chart = [{"name": d[0], "value": d[1]} for d in disease_counts]

    # Recent lists
    recent_farmers = [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone or "N/A",
            "district": u.district or "N/A",
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M")
        } for u in db.query(User).filter(User.role == "farmer").order_by(User.created_at.desc()).limit(5).all()
    ]

    recent_preds = [
        {
            "id": c.id,
            "farmer": c.user.name if c.user else "Farmer",
            "district": c.district or "Tamil Nadu",
            "recommended_crop": c.recommended_crop,
            "confidence": f"{c.confidence:.1f}%",
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M")
        } for c in db.query(CropRecommendation).order_by(CropRecommendation.created_at.desc()).limit(5).all()
    ]

    recent_scans = [
        {
            "id": d.id,
            "farmer": d.user.name if d.user else "Farmer",
            "crop": d.crop,
            "disease": d.predicted_disease,
            "severity": d.severity,
            "confidence": f"{d.confidence:.1f}%",
            "created_at": d.created_at.strftime("%Y-%m-%d %H:%M")
        } for d in db.query(DiseasePrediction).order_by(DiseasePrediction.created_at.desc()).limit(5).all()
    ]

    recent_advisories = [
        {
            "id": i.id,
            "farmer": i.user.name if i.user else "Farmer",
            "crop": i.crop,
            "status": i.irrigation_status,
            "moisture": f"{i.soil_moisture:.1f}%",
            "created_at": i.created_at.strftime("%Y-%m-%d %H:%M")
        } for i in db.query(IrrigationAdvisory).order_by(IrrigationAdvisory.created_at.desc()).limit(5).all()
    ]

    return AdminDashboardOut(
        total_farmers=total_farmers,
        total_farms=total_farms,
        total_crop_predictions=total_preds,
        total_disease_scans=total_scans,
        total_irrigation_advisories=total_advisories,
        active_users_count=total_users,
        charts={
            "districts": district_chart or [{"name": "Thanjavur", "value": 12}, {"name": "Coimbatore", "value": 8}, {"name": "Madurai", "value": 6}],
            "crops": crop_chart or [{"name": "Paddy", "value": 15}, {"name": "Cotton", "value": 7}, {"name": "Sugarcane", "value": 5}],
            "diseases": disease_chart or [{"name": "Blast", "value": 4}, {"name": "Early Blight", "value": 3}, {"name": "Healthy Leaf", "value": 10}]
        },
        recent_farmers=recent_farmers,
        recent_predictions=recent_preds,
        recent_disease_scans=recent_scans,
        recent_advisories=recent_advisories
    )

@router.get("/users", response_model=List[UserOut])
def get_all_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if search:
        s = f"%{search}%"
        query = query.filter((User.name.ilike(s)) | (User.email.ilike(s)) | (User.district.ilike(s)))
    return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/farms", response_model=List[FarmOut])
def get_all_farms(
    district: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Farm)
    if district:
        query = query.filter(Farm.district == district)
    return query.order_by(Farm.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/crop-recommendations")
def get_all_crop_recommendations(
    crop: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(CropRecommendation)
    if crop:
        query = query.filter(CropRecommendation.recommended_crop == crop)
    records = query.order_by(CropRecommendation.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": r.id,
            "farmer_name": r.user.name if r.user else "Farmer",
            "farmer_email": r.user.email if r.user else "",
            "district": r.district,
            "soil_type": r.soil_type,
            "recommended_crop": r.recommended_crop,
            "confidence": f"{r.confidence:.1f}%",
            "model_type": r.model_type,
            "explanation": r.explanation,
            "created_at": r.created_at.strftime("%Y-%m-%d %H:%M")
        } for r in records
    ]

@router.get("/disease-predictions")
def get_all_disease_predictions(
    crop: Optional[str] = None,
    severity: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(DiseasePrediction)
    if crop:
        query = query.filter(DiseasePrediction.crop == crop)
    if severity:
        query = query.filter(DiseasePrediction.severity == severity)
    records = query.order_by(DiseasePrediction.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": d.id,
            "farmer_name": d.user.name if d.user else "Farmer",
            "crop": d.crop,
            "predicted_disease": d.predicted_disease,
            "confidence": f"{d.confidence:.1f}%",
            "severity": d.severity,
            "image_url": f"/api/disease-detection/image/{d.image_path}" if d.image_path else None,
            "model_type": d.model_type,
            "created_at": d.created_at.strftime("%Y-%m-%d %H:%M")
        } for d in records
    ]

@router.get("/irrigation-advisories")
def get_all_irrigation_advisories(
    status_filter: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(IrrigationAdvisory)
    if status_filter:
        query = query.filter(IrrigationAdvisory.irrigation_status == status_filter)
    records = query.order_by(IrrigationAdvisory.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": i.id,
            "farmer_name": i.user.name if i.user else "Farmer",
            "crop": i.crop,
            "growth_stage": i.growth_stage,
            "soil_moisture": f"{i.soil_moisture:.1f}%",
            "irrigation_status": i.irrigation_status,
            "water_estimate": i.water_estimate,
            "recommended_action": i.recommended_action,
            "created_at": i.created_at.strftime("%Y-%m-%d %H:%M")
        } for i in records
    ]

@router.get("/system-logs")
def get_system_logs(
    limit: int = 100,
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "action": l.action,
            "entity": l.entity,
            "entity_id": l.entity_id,
            "user_id": l.user_id,
            "user_name": l.user.name if l.user else "System",
            "details": l.details,
            "created_at": l.created_at.strftime("%Y-%m-%d %H:%M:%S")
        } for l in logs
    ]

# Master Crop Management
@router.get("/crops", response_model=List[CropOut])
def get_admin_crops(db: Session = Depends(get_db)):
    return db.query(Crop).order_by(Crop.name.asc()).all()

@router.post("/crops", response_model=CropOut, status_code=status.HTTP_201_CREATED)
def create_crop(crop_in: CropCreate, db: Session = Depends(get_db)):
    crop = Crop(**crop_in.model_dump())
    db.add(crop)
    db.commit()
    db.refresh(crop)
    return crop

@router.put("/crops/{crop_id}", response_model=CropOut)
def update_crop(crop_id: int, crop_in: CropUpdate, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    for k, v in crop_in.model_dump(exclude_unset=True).items():
        setattr(crop, k, v)
    db.commit()
    db.refresh(crop)
    return crop

@router.delete("/crops/{crop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_crop(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    db.delete(crop)
    db.commit()
    return None

# Master Disease Management
@router.get("/diseases", response_model=List[DiseaseOut])
def get_admin_diseases(db: Session = Depends(get_db)):
    return db.query(Disease).order_by(Disease.name.asc()).all()

@router.post("/diseases", response_model=DiseaseOut, status_code=status.HTTP_201_CREATED)
def create_disease(disease_in: DiseaseCreate, db: Session = Depends(get_db)):
    disease = Disease(**disease_in.model_dump())
    db.add(disease)
    db.commit()
    db.refresh(disease)
    return disease

@router.put("/diseases/{disease_id}", response_model=DiseaseOut)
def update_disease(disease_id: int, disease_in: DiseaseUpdate, db: Session = Depends(get_db)):
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    for k, v in disease_in.model_dump(exclude_unset=True).items():
        setattr(disease, k, v)
    db.commit()
    db.refresh(disease)
    return disease

@router.delete("/diseases/{disease_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_disease(disease_id: int, db: Session = Depends(get_db)):
    disease = db.query(Disease).filter(Disease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found")
    db.delete(disease)
    db.commit()
    return None
