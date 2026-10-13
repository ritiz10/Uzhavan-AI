from typing import Optional
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

class AuditService:
    def log(
        self, db: Session, action: str, entity: str, entity_id: Optional[int] = None,
        user_id: Optional[int] = None, details: Optional[str] = None
    ) -> AuditLog:
        log_entry = AuditLog(
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            details=details
        )
        db.add(log_entry)
        try:
            db.commit()
            db.refresh(log_entry)
        except Exception:
            db.rollback()
        return log_entry

audit_service = AuditService()
