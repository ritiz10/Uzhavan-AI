from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.irrigation_advisory import IrrigationAdvisory
from app.schemas.irrigation import IrrigationInput, IrrigationOut
from app.services.irrigation_service import irrigation_service

router = APIRouter(prefix="/irrigation", tags=["Smart Irrigation Advisory"])

@router.post("/advisory", response_model=IrrigationOut)
def generate_irrigation_advisory(
    input_data: IrrigationInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Evaluates current soil moisture, growth stage, soil type, and weather conditions.
    Generates intelligent irrigation advice: NEEDS IRRIGATION, MONITOR, or NO IMMEDIATE IRRIGATION.
    """
    return irrigation_service.generate_advisory(db, current_user.id, input_data)

@router.get("/history", response_model=List[IrrigationOut])
def get_irrigation_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve previous irrigation advisories for current user."""
    records = irrigation_service.get_history(db, current_user.id, limit)
    results = []
    for r in records:
        status_color = "red" if r.irrigation_status == "NEEDS IRRIGATION" else ("yellow" if r.irrigation_status == "MONITOR" else "green")
        results.append(IrrigationOut(
            id=r.id,
            crop=r.crop,
            growth_stage=r.growth_stage,
            irrigation_status=r.irrigation_status,
            status_color=status_color,
            recommended_action=r.recommended_action,
            water_estimate=r.water_estimate or "N/A",
            recommended_timing=r.recommended_timing or "Early morning",
            reason=r.reason or "",
            weather_consideration=r.weather_consideration or "",
            assumptions_note="Historical record.",
            created_at=r.created_at
        ))
    return results

@router.get("/{advisory_id}", response_model=IrrigationOut)
def get_advisory_detail(
    advisory_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    r = db.query(IrrigationAdvisory).filter(
        IrrigationAdvisory.id == advisory_id,
        IrrigationAdvisory.user_id == current_user.id
    ).first()
    if not r:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Advisory record not found.")

    status_color = "red" if r.irrigation_status == "NEEDS IRRIGATION" else ("yellow" if r.irrigation_status == "MONITOR" else "green")
    return IrrigationOut(
        id=r.id,
        crop=r.crop,
        growth_stage=r.growth_stage,
        irrigation_status=r.irrigation_status,
        status_color=status_color,
        recommended_action=r.recommended_action,
        water_estimate=r.water_estimate or "N/A",
        recommended_timing=r.recommended_timing or "Early morning",
        reason=r.reason or "",
        weather_consideration=r.weather_consideration or "",
        assumptions_note="Historical record.",
        created_at=r.created_at
    )
