import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.disease_prediction import DiseasePrediction
from app.schemas.disease import DiseasePredictionOut
from app.services.disease_service import disease_service
from app.ai.disease_model import DISEASE_KNOWLEDGEBASE

router = APIRouter(prefix="/disease-detection", tags=["Plant Disease Detection"])

@router.post("/predict", response_model=DiseasePredictionOut)
async def detect_disease(
    file: UploadFile = File(...),
    crop_name: Optional[str] = Form(None),
    farm_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a leaf or plant image to run AI-assisted disease detection.
    Analyzes visual features, checks symptoms, returns treatment recommendations, and records to history.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image (JPEG, PNG, or WebP)."
        )

    try:
        result = await disease_service.process_and_diagnose(
            db=db,
            user_id=current_user.id,
            file=file,
            crop_name=crop_name,
            farm_id=farm_id
        )
        return result
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Image processing error: {str(e)}")

@router.get("/history", response_model=List[DiseasePredictionOut])
def get_disease_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch disease detection scans for the current user."""
    records = disease_service.get_history(db, current_user.id, limit)
    results = []
    for r in records:
        crop_diseases = DISEASE_KNOWLEDGEBASE.get(r.crop, DISEASE_KNOWLEDGEBASE["Tomato"])
        disease_info = crop_diseases.get(r.predicted_disease, {})
        results.append(DiseasePredictionOut(
            id=r.id,
            crop=r.crop,
            predicted_disease=r.predicted_disease,
            confidence=r.confidence,
            confidence_display=f"{r.confidence:.1f}%",
            severity=r.severity,
            symptoms=r.symptoms or disease_info.get("symptoms", ""),
            recommendation=r.recommendation or disease_info.get("recommendation", ""),
            prevention=r.prevention or disease_info.get("prevention", ""),
            expert_advisory=disease_info.get("expert_advisory", "Consult your local TNAU Agronomist or KVK center."),
            model_type=r.model_type,
            is_fallback=(r.model_type != "trained_model"),
            disclaimer="AI-based detection is an advisory tool and should not replace professional agricultural diagnosis.",
            image_url=f"/api/disease-detection/image/{r.image_path}" if r.image_path else None,
            created_at=r.created_at
        ))
    return results

@router.get("/image/{filename}")
def get_uploaded_image(filename: str):
    """Securely serve uploaded crop inspection photo."""
    # Prevent directory traversal
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image not found.")
    return FileResponse(file_path)

@router.get("/{pred_id}", response_model=DiseasePredictionOut)
def get_disease_detail(
    pred_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    r = db.query(DiseasePrediction).filter(
        DiseasePrediction.id == pred_id,
        DiseasePrediction.user_id == current_user.id
    ).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Prediction record not found.")

    crop_diseases = DISEASE_KNOWLEDGEBASE.get(r.crop, DISEASE_KNOWLEDGEBASE["Tomato"])
    disease_info = crop_diseases.get(r.predicted_disease, {})
    return DiseasePredictionOut(
        id=r.id,
        crop=r.crop,
        predicted_disease=r.predicted_disease,
        confidence=r.confidence,
        confidence_display=f"{r.confidence:.1f}%",
        severity=r.severity,
        symptoms=r.symptoms or disease_info.get("symptoms", ""),
        recommendation=r.recommendation or disease_info.get("recommendation", ""),
        prevention=r.prevention or disease_info.get("prevention", ""),
        expert_advisory=disease_info.get("expert_advisory", "Consult your local TNAU Agronomist or KVK center."),
        model_type=r.model_type,
        is_fallback=(r.model_type != "trained_model"),
        disclaimer="AI-based detection is an advisory tool and should not replace professional agricultural diagnosis.",
        image_url=f"/api/disease-detection/image/{r.image_path}" if r.image_path else None,
        created_at=r.created_at
    )
