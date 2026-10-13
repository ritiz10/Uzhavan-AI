from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.schemas.farm import FarmCreate, FarmUpdate, FarmOut
from app.services.farm_service import farm_service
from app.utils.tn_constants import TN_DISTRICTS, TN_DISTRICT_TALUKS, TN_SOIL_TYPES, TN_IRRIGATION_TYPES, TN_SEASONS, TN_MAJOR_CROPS

router = APIRouter(prefix="/farms", tags=["Farm Management"])

@router.get("", response_model=List[FarmOut])
def get_farms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all farms belonging to current farmer."""
    return farm_service.get_user_farms(db, current_user.id)

@router.post("", response_model=FarmOut, status_code=status.HTTP_201_CREATED)
def create_farm(
    farm_in: FarmCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new farm record."""
    return farm_service.create_farm(db, current_user.id, farm_in)

@router.get("/metadata/options")
def get_farm_metadata_options():
    """Provides dropdown choices for Tamil Nadu districts, taluks, soils, seasons and crops."""
    return {
        "districts": TN_DISTRICTS,
        "taluks_by_district": TN_DISTRICT_TALUKS,
        "soil_types": TN_SOIL_TYPES,
        "irrigation_types": TN_IRRIGATION_TYPES,
        "seasons": TN_SEASONS,
        "crops": TN_MAJOR_CROPS
    }

@router.get("/{farm_id}", response_model=FarmOut)
def get_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    farm = farm_service.get_farm_by_id(db, farm_id, current_user.id)
    if not farm:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found.")
    return farm

@router.put("/{farm_id}", response_model=FarmOut)
def update_farm(
    farm_id: int,
    farm_in: FarmUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    updated = farm_service.update_farm(db, farm_id, current_user.id, farm_in)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found.")
    return updated

@router.delete("/{farm_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_farm(
    farm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted = farm_service.delete_farm(db, farm_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farm not found.")
    return None
