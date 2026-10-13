from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.crop_recommendation import CropRecommendation
from app.schemas.crop import CropRecommendationInput, CropRecommendationOut
from app.services.crop_service import crop_service
from app.ai.crop_model import CROP_AGRONOMIC_PROFILES

router = APIRouter(prefix="/crop-recommendation", tags=["Crop Recommendation"])

@router.post("/predict", response_model=CropRecommendationOut)
def predict_crop(
    input_data: CropRecommendationInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Executes AI Crop Recommendation based on soil NPK, pH, and environmental parameters.
    Persists recommendation record and generates farmer alerts.
    """
    return crop_service.predict_and_store(db, current_user.id, input_data)

@router.get("/history", response_model=List[CropRecommendationOut])
def get_prediction_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve historical crop recommendations for the current user."""
    records = crop_service.get_history(db, current_user.id, limit)
    results = []
    for r in records:
        profile = CROP_AGRONOMIC_PROFILES.get(r.recommended_crop, CROP_AGRONOMIC_PROFILES["Paddy"])
        results.append(CropRecommendationOut(
            id=r.id,
            recommended_crop=r.recommended_crop,
            confidence=r.confidence,
            confidence_display=f"{r.confidence:.1f}%",
            suitability="Highly Suitable" if r.confidence >= 75 else "Moderately Suitable",
            expected_growing_season=r.season or profile["season"],
            water_requirement=profile["water_req"],
            fertilizer_guidance=profile["fertilizer"],
            reason=r.explanation or "",
            alternatives=[],
            model_type=r.model_type,
            is_fallback=(r.model_type != "trained_model"),
            disclaimer="AI model output is an advisory guidance tool based on soil-climate parameters and should not be construed as guaranteed harvest yield.",
            created_at=r.created_at
        ))
    return results

@router.get("/{rec_id}", response_model=CropRecommendationOut)
def get_recommendation_detail(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    r = db.query(CropRecommendation).filter(
        CropRecommendation.id == rec_id,
        CropRecommendation.user_id == current_user.id
    ).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation record not found.")

    profile = CROP_AGRONOMIC_PROFILES.get(r.recommended_crop, CROP_AGRONOMIC_PROFILES["Paddy"])
    return CropRecommendationOut(
        id=r.id,
        recommended_crop=r.recommended_crop,
        confidence=r.confidence,
        confidence_display=f"{r.confidence:.1f}%",
        suitability="Highly Suitable" if r.confidence >= 75 else "Moderately Suitable",
        expected_growing_season=r.season or profile["season"],
        water_requirement=profile["water_req"],
        fertilizer_guidance=profile["fertilizer"],
        reason=r.explanation or "",
        alternatives=[],
        model_type=r.model_type,
        is_fallback=(r.model_type != "trained_model"),
        disclaimer="AI model output is an advisory guidance tool based on soil-climate parameters and should not be construed as guaranteed harvest yield.",
        created_at=r.created_at
    )
