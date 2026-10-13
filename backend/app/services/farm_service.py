from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.farm import Farm
from app.schemas.farm import FarmCreate, FarmUpdate
from app.services.audit_service import audit_service

class FarmService:
    def create_farm(self, db: Session, user_id: int, farm_in: FarmCreate) -> Farm:
        farm = Farm(
            user_id=user_id,
            **farm_in.model_dump()
        )
        db.add(farm)
        db.commit()
        db.refresh(farm)
        audit_service.log(db, "CREATE_FARM", "Farm", farm.id, user_id, f"Farm '{farm.farm_name}' in {farm.district}")
        return farm

    def get_user_farms(self, db: Session, user_id: int) -> List[Farm]:
        return db.query(Farm).filter(Farm.user_id == user_id).order_by(Farm.created_at.desc()).all()

    def get_farm_by_id(self, db: Session, farm_id: int, user_id: int) -> Optional[Farm]:
        return db.query(Farm).filter(Farm.id == farm_id, Farm.user_id == user_id).first()

    def update_farm(self, db: Session, farm_id: int, user_id: int, farm_in: FarmUpdate) -> Optional[Farm]:
        farm = self.get_farm_by_id(db, farm_id, user_id)
        if not farm:
            return None
        
        update_data = farm_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(farm, key, value)
            
        db.commit()
        db.refresh(farm)
        audit_service.log(db, "UPDATE_FARM", "Farm", farm.id, user_id, f"Updated farm '{farm.farm_name}'")
        return farm

    def delete_farm(self, db: Session, farm_id: int, user_id: int) -> bool:
        farm = self.get_farm_by_id(db, farm_id, user_id)
        if not farm:
            return False
        
        db.delete(farm)
        db.commit()
        audit_service.log(db, "DELETE_FARM", "Farm", farm_id, user_id, f"Deleted farm {farm_id}")
        return True

farm_service = FarmService()
