from typing import List
from sqlalchemy.orm import Session
from app.models.irrigation_advisory import IrrigationAdvisory
from app.schemas.irrigation import IrrigationInput, IrrigationOut
from app.ai.irrigation_engine import irrigation_engine
from app.services.notification_service import notification_service
from app.services.audit_service import audit_service

class IrrigationService:
    def generate_advisory(
        self, db: Session, user_id: int, input_data: IrrigationInput
    ) -> IrrigationOut:
        # Run irrigation evaluation
        res = irrigation_engine.evaluate(
            crop=input_data.crop,
            growth_stage=input_data.growth_stage,
            soil_type=input_data.soil_type or "Red Loam",
            soil_moisture=input_data.soil_moisture,
            temperature=input_data.temperature or 30.0,
            humidity=input_data.humidity or 65.0,
            rainfall=input_data.rainfall or 0.0,
            rain_probability=input_data.rain_probability or 10.0,
            land_area=input_data.land_area or 1.0,
            irrigation_type=input_data.irrigation_type or "Drip Irrigation"
        )

        # Store advisory record in DB
        record = IrrigationAdvisory(
            user_id=user_id,
            farm_id=input_data.farm_id,
            crop=input_data.crop,
            growth_stage=input_data.growth_stage,
            soil_type=input_data.soil_type,
            soil_moisture=input_data.soil_moisture,
            temperature=input_data.temperature,
            humidity=input_data.humidity,
            rainfall=input_data.rainfall,
            rain_probability=input_data.rain_probability,
            land_area=input_data.land_area,
            irrigation_type=input_data.irrigation_type,
            irrigation_status=res["irrigation_status"],
            recommended_action=res["recommended_action"],
            water_estimate=res["water_estimate"],
            recommended_timing=res["recommended_timing"],
            reason=res["reason"],
            weather_consideration=res["weather_consideration"]
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        # If irrigation is needed, notify farmer
        if res["irrigation_status"] == "NEEDS IRRIGATION":
            notification_service.create_notification(
                db=db,
                user_id=user_id,
                title=f"Irrigation Required: {input_data.crop}",
                message=f"Soil moisture is depleted ({input_data.soil_moisture:.1f}%). {res['recommended_action'][:120]}...",
                notification_type="IRRIGATION"
            )
        elif "Delay irrigation" in res["recommended_action"]:
            notification_service.create_notification(
                db=db,
                user_id=user_id,
                title=f"Rain Advisory: Delay Irrigation",
                message=f"Rain expected ({input_data.rain_probability:.0f}% chance). Save water and protect {input_data.crop}.",
                notification_type="WEATHER"
            )

        audit_service.log(
            db=db,
            action="IRRIGATION_ADVISORY",
            entity="IrrigationAdvisory",
            entity_id=record.id,
            user_id=user_id,
            details=f"Status: {res['irrigation_status']} for {input_data.crop}"
        )

        return IrrigationOut(
            id=record.id,
            crop=res["crop"],
            growth_stage=res["growth_stage"],
            irrigation_status=res["irrigation_status"],
            status_color=res["status_color"],
            recommended_action=res["recommended_action"],
            water_estimate=res["water_estimate"],
            recommended_timing=res["recommended_timing"],
            reason=res["reason"],
            weather_consideration=res["weather_consideration"],
            assumptions_note=res["assumptions_note"],
            created_at=record.created_at
        )

    def get_history(self, db: Session, user_id: int, limit: int = 50) -> List[IrrigationAdvisory]:
        return db.query(IrrigationAdvisory).filter(
            IrrigationAdvisory.user_id == user_id
        ).order_by(IrrigationAdvisory.created_at.desc()).limit(limit).all()

irrigation_service = IrrigationService()
