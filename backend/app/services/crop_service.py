from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.crop_recommendation import CropRecommendation
from app.schemas.crop import CropRecommendationInput, CropRecommendationOut
from app.ai.crop_model import crop_predictor
from app.services.notification_service import notification_service
from app.services.audit_service import audit_service

class CropService:
    def predict_and_store(
        self, db: Session, user_id: int, input_data: CropRecommendationInput
    ) -> CropRecommendationOut:
        # Run AI prediction
        pred = crop_predictor.predict(
            nitrogen=input_data.nitrogen,
            phosphorus=input_data.phosphorus,
            potassium=input_data.potassium,
            ph=input_data.ph,
            temperature=input_data.temperature,
            humidity=input_data.humidity,
            rainfall=input_data.rainfall,
            district=input_data.district,
            season=input_data.season,
            soil_type=input_data.soil_type
        )

        # Store in database
        rec_record = CropRecommendation(
            user_id=user_id,
            farm_id=input_data.farm_id,
            nitrogen=input_data.nitrogen,
            phosphorus=input_data.phosphorus,
            potassium=input_data.potassium,
            ph=input_data.ph,
            temperature=input_data.temperature,
            humidity=input_data.humidity,
            rainfall=input_data.rainfall,
            season=input_data.season,
            district=input_data.district,
            soil_type=input_data.soil_type,
            recommended_crop=pred["recommended_crop"],
            confidence=pred["confidence"],
            explanation=pred["reason"],
            model_type=pred["model_type"]
        )
        db.add(rec_record)
        db.commit()
        db.refresh(rec_record)

        # Generate notification for farmer
        notification_service.create_notification(
            db=db,
            user_id=user_id,
            title=f"New Crop Recommendation: {pred['recommended_crop']}",
            message=f"Based on your soil NPK ({input_data.nitrogen:.0f}:{input_data.phosphorus:.0f}:{input_data.potassium:.0f}) and climate data, {pred['recommended_crop']} has been recommended with {pred['confidence_display']} confidence.",
            notification_type="SYSTEM"
        )

        audit_service.log(
            db=db,
            action="CROP_RECOMMENDATION",
            entity="CropRecommendation",
            entity_id=rec_record.id,
            user_id=user_id,
            details=f"Recommended {pred['recommended_crop']} ({pred['confidence_display']})"
        )

        return CropRecommendationOut(
            id=rec_record.id,
            recommended_crop=pred["recommended_crop"],
            confidence=pred["confidence"],
            confidence_display=pred["confidence_display"],
            suitability=pred["suitability"],
            expected_growing_season=pred["expected_growing_season"],
            water_requirement=pred["water_requirement"],
            fertilizer_guidance=pred["fertilizer_guidance"],
            reason=pred["reason"],
            alternatives=pred["alternatives"],
            model_type=pred["model_type"],
            is_fallback=pred["is_fallback"],
            disclaimer=pred["disclaimer"],
            created_at=rec_record.created_at
        )

    def get_history(self, db: Session, user_id: int, limit: int = 50) -> List[CropRecommendation]:
        return db.query(CropRecommendation).filter(
            CropRecommendation.user_id == user_id
        ).order_by(CropRecommendation.created_at.desc()).limit(limit).all()

crop_service = CropService()
