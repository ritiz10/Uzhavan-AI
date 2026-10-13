import os
import uuid
from typing import List, Optional
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.disease_prediction import DiseasePrediction
from app.schemas.disease import DiseasePredictionOut
from app.ai.preprocessing import validate_and_load_image
from app.ai.disease_model import disease_model
from app.services.notification_service import notification_service
from app.services.audit_service import audit_service

class DiseaseService:
    async def process_and_diagnose(
        self, db: Session, user_id: int, file: UploadFile, crop_name: Optional[str] = None, farm_id: Optional[int] = None
    ) -> DiseasePredictionOut:
        # 1. Read bytes
        contents = await file.read()
        
        # 2. Validate and load image
        pil_image = validate_and_load_image(contents, max_size_mb=10)
        
        # 3. Save to uploads directory with unique name
        ext = os.path.splitext(file.filename)[1].lower() if file.filename else ".jpg"
        if ext not in [".jpg", ".jpeg", ".png", ".webp"]:
            ext = ".jpg"
        filename = f"{uuid.uuid4().hex}_{int(os.times().elapsed)}{ext}"
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as f:
            f.write(contents)

        # 4. Run AI vision diagnosis
        pred = disease_model.predict(pil_image, crop_name=crop_name)

        # 5. Persist to DB
        db_record = DiseasePrediction(
            user_id=user_id,
            farm_id=farm_id,
            crop=pred["crop"],
            image_path=filename,
            predicted_disease=pred["predicted_disease"],
            confidence=pred["confidence"],
            severity=pred["severity"],
            symptoms=pred["symptoms"],
            recommendation=pred["recommendation"],
            prevention=pred["prevention"],
            model_type=pred["model_type"]
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)

        # 6. If disease is moderate/high/severe, trigger agricultural notification
        if pred["severity"] != "None":
            notification_service.create_notification(
                db=db,
                user_id=user_id,
                title=f"Disease Detected: {pred['predicted_disease']} ({pred['crop']})",
                message=f"Plant scan detected {pred['predicted_disease']} with {pred['severity']} severity. Recommended action: {pred['recommendation'][:140]}...",
                notification_type="DISEASE"
            )

        audit_service.log(
            db=db,
            action="DISEASE_SCAN",
            entity="DiseasePrediction",
            entity_id=db_record.id,
            user_id=user_id,
            details=f"Diagnosed {pred['predicted_disease']} on {pred['crop']}"
        )

        return DiseasePredictionOut(
            id=db_record.id,
            crop=pred["crop"],
            predicted_disease=pred["predicted_disease"],
            confidence=pred["confidence"],
            confidence_display=pred["confidence_display"],
            severity=pred["severity"],
            symptoms=pred["symptoms"],
            recommendation=pred["recommendation"],
            prevention=pred["prevention"],
            expert_advisory=pred["expert_advisory"],
            model_type=pred["model_type"],
            is_fallback=pred["is_fallback"],
            disclaimer=pred["disclaimer"],
            image_url=f"/api/disease-detection/image/{filename}",
            created_at=db_record.created_at
        )

    def get_history(self, db: Session, user_id: int, limit: int = 50) -> List[DiseasePrediction]:
        return db.query(DiseasePrediction).filter(
            DiseasePrediction.user_id == user_id
        ).order_by(DiseasePrediction.created_at.desc()).limit(limit).all()

disease_service = DiseaseService()
