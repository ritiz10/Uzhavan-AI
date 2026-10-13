"""
Seed Script for AI-Based Tamil Nadu Smart Farming Assistant.
Populates initial database with:
- Admin account: admin@example.com / Admin@123
- Farmer account: farmer@example.com / Farmer@123
- Multiple demo farms across Tamil Nadu agro-climatic zones
- Master crops and plant disease reference data
- Sample prediction histories and alerts
"""

import sys
import os
from datetime import datetime, timedelta, timezone

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, init_db
from app.core.security import get_password_hash
from app.models.user import User
from app.models.farm import Farm
from app.models.crop import Crop
from app.models.disease import Disease
from app.models.crop_recommendation import CropRecommendation
from app.models.disease_prediction import DiseasePrediction
from app.models.irrigation_advisory import IrrigationAdvisory
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.ai.disease_model import DISEASE_KNOWLEDGEBASE

def seed_database():
    print("[Seed] Initializing database tables...")
    init_db()
    db = SessionLocal()

    try:
        # 1. Check if already seeded
        existing_admin = db.query(User).filter(User.email == "admin@example.com").first()
        if existing_admin:
            print("[Seed] Database already seeded. Skipping initial seed.")
            return

        print("[Seed] Creating users...")
        # Admin
        admin_user = User(
            name="Tamil Nadu Agri Directorate Admin",
            email="admin@example.com",
            phone="9876543210",
            password_hash=get_password_hash("Admin@123"),
            role="admin",
            district="Chennai",
            village="Guindy Agri Directorate"
        )
        db.add(admin_user)

        # Primary Farmer
        farmer_user = User(
            name="Muthuvel Karuppasamy",
            email="farmer@example.com",
            phone="9443123456",
            password_hash=get_password_hash("Farmer@123"),
            role="farmer",
            district="Thanjavur",
            village="Papanasam Melur"
        )
        db.add(farmer_user)

        # Secondary Farmer
        farmer_2 = User(
            name="Selvam Subramanian",
            email="selvam@example.com",
            phone="9842198765",
            password_hash=get_password_hash("Farmer@123"),
            role="farmer",
            district="Coimbatore",
            village="Pollachi South"
        )
        db.add(farmer_2)

        db.commit()
        db.refresh(admin_user)
        db.refresh(farmer_user)
        db.refresh(farmer_2)

        print("[Seed] Creating master crops...")
        crops_data = [
            {"name": "Paddy", "scientific_name": "Oryza sativa", "season": "Kuruvai / Samba", "water_requirement": "Very High", "soil_types": "Alluvial, Clayey Loam", "description": "Tamil Nadu staple food crop grown extensively in Cauvery Delta."},
            {"name": "Sugarcane", "scientific_name": "Saccharum officinarum", "season": "Main Season", "water_requirement": "High", "soil_types": "Clayey Loam, Alluvial", "description": "Major commercial cash crop in Cuddalore, Villupuram and Erode."},
            {"name": "Cotton", "scientific_name": "Gossypium hirsutum", "season": "Winter / Summer Irrigated", "water_requirement": "Medium", "soil_types": "Black Cotton Soil", "description": "Grown in Western zone: Coimbatore, Tiruppur, Salem, Virudhunagar."},
            {"name": "Banana", "scientific_name": "Musa acuminata", "season": "Perennial", "water_requirement": "High", "soil_types": "Alluvial, Laterite", "description": "Widely cultivated along Cauvery river banks and Kanyakumari."},
            {"name": "Tomato", "scientific_name": "Solanum lycopersicum", "season": "Year Round", "water_requirement": "Medium", "soil_types": "Red Loam, Sandy Loam", "description": "Major vegetable crop in Dindigul, Krishnagiri, and Dharmapuri."},
            {"name": "Chilli", "scientific_name": "Capsicum annuum", "season": "Jul-Aug / Jan-Feb", "water_requirement": "Medium", "soil_types": "Black Cotton, Red Loam", "description": "Famous Ramanathapuram Mundu chilli and Thoothukudi varieties."},
            {"name": "Brinjal", "scientific_name": "Solanum melongena", "season": "Year Round", "water_requirement": "Medium", "soil_types": "Clay Loam, Red Loam", "description": "GI-tagged Bhavani and Mullu kathiri varieties."},
            {"name": "Groundnut", "scientific_name": "Arachis hypogaea", "season": "Kharif / Rabi", "water_requirement": "Low to Medium", "soil_types": "Red Sandy Loam", "description": "Major oilseed crop in Tiruvannamalai, Villupuram, and Vellore."}
        ]

        crop_objs = {}
        for c in crops_data:
            crop = Crop(**c)
            db.add(crop)
            db.flush()
            crop_objs[c["name"]] = crop

        print("[Seed] Creating master diseases...")
        for crop_name, diseases in DISEASE_KNOWLEDGEBASE.items():
            parent_crop = crop_objs.get(crop_name)
            crop_id = parent_crop.id if parent_crop else None
            for d_name, d_info in diseases.items():
                if "Healthy" not in d_name:
                    d_obj = Disease(
                        crop_id=crop_id,
                        name=d_name,
                        symptoms=d_info["symptoms"],
                        severity=d_info["severity"],
                        prevention=d_info["prevention"],
                        advisory=d_info["recommendation"]
                    )
                    db.add(d_obj)

        print("[Seed] Creating demo farms...")
        farm_1 = Farm(
            user_id=farmer_user.id,
            farm_name="Cauvery Delta Paddy Fields",
            district="Thanjavur",
            taluk="Papanasam",
            village="Papanasam Melur",
            area=3.5,
            area_unit="Acres",
            soil_type="Alluvial Soil",
            irrigation_type="Canal / River Irrigation",
            water_source="Cauvery River Canal & Borewell",
            current_crop="Paddy",
            previous_crop="Black Gram",
            season="Samba (Main Season: Aug - Jan)",
            latitude=10.9234,
            longitude=79.2789
        )
        db.add(farm_1)

        farm_2 = Farm(
            user_id=farmer_user.id,
            farm_name="Papanasam Vegetable Garden",
            district="Thanjavur",
            taluk="Papanasam",
            village="Thiruvaiyaru Road",
            area=1.5,
            area_unit="Acres",
            soil_type="Clayey Loam",
            irrigation_type="Drip Irrigation",
            water_source="Open Well",
            current_crop="Tomato",
            previous_crop="Chilli",
            season="Summer (Feb - May)",
            latitude=10.9150,
            longitude=79.2850
        )
        db.add(farm_2)

        farm_3 = Farm(
            user_id=farmer_2.id,
            farm_name="Kongu Cotton & Coconut Estate",
            district="Coimbatore",
            taluk="Pollachi",
            village="Anaimalai Road",
            area=5.0,
            area_unit="Acres",
            soil_type="Red Loam",
            irrigation_type="Drip Irrigation",
            water_source="Borewell / Tube Well",
            current_crop="Cotton",
            previous_crop="Maize",
            season="Kharif (Monsoon: July - Oct)",
            latitude=10.6582,
            longitude=76.9984
        )
        db.add(farm_3)

        db.commit()
        db.refresh(farm_1)
        db.refresh(farm_2)

        print("[Seed] Creating sample predictions and advisories...")
        now = datetime.now(timezone.utc)

        # 1. Crop recommendations
        cr1 = CropRecommendation(
            user_id=farmer_user.id,
            farm_id=farm_1.id,
            nitrogen=90.0, phosphorus=45.0, potassium=48.0, ph=6.8,
            temperature=31.5, humidity=82.0, rainfall=1150.0,
            season="Samba", district="Thanjavur", soil_type="Alluvial Soil",
            recommended_crop="Paddy",
            confidence=89.5,
            explanation="Seasonal rainfall (1150 mm) is optimal for Paddy's moisture requirement. Soil pH of 6.8 provides ideal nutrient absorption. Nitrogen (90), Phosphorus (45), Potassium (48) matches Kuruvai/Samba vegetative phase.",
            model_type="trained_model",
            created_at=now - timedelta(days=2)
        )
        db.add(cr1)

        cr2 = CropRecommendation(
            user_id=farmer_user.id,
            farm_id=farm_2.id,
            nitrogen=105.0, phosphorus=75.0, potassium=70.0, ph=6.4,
            temperature=27.0, humidity=62.0, rainfall=550.0,
            season="Summer", district="Thanjavur", soil_type="Clayey Loam",
            recommended_crop="Tomato",
            confidence=86.2,
            explanation="Soil pH of 6.4 is in the optimal range. Nitrogen, phosphorus, and potassium support strong flowering and fruit set with scheduled drip irrigation.",
            model_type="trained_model",
            created_at=now - timedelta(days=5)
        )
        db.add(cr2)

        # 2. Disease scans
        dp1 = DiseasePrediction(
            user_id=farmer_user.id,
            farm_id=farm_1.id,
            crop="Rice",
            image_path=None,
            predicted_disease="Blast (Pyricularia oryzae)",
            confidence=88.4,
            severity="High",
            symptoms="Spindle-shaped lesions with brown borders on leaf blades.",
            recommendation="Drain excess water. Avoid extra urea top-dressing. Spray certified bio-control Pseudomonas fluorescens (0.2%) as per TNAU package of practices.",
            prevention="Treat seeds with Trichoderma viride @ 4g/kg seed. Avoid excess nitrogen fertilization.",
            model_type="development_fallback",
            created_at=now - timedelta(days=3)
        )
        db.add(dp1)

        dp2 = DiseasePrediction(
            user_id=farmer_user.id,
            farm_id=farm_2.id,
            crop="Tomato",
            image_path=None,
            predicted_disease="Healthy Leaf",
            confidence=93.1,
            severity="None",
            symptoms="Clean green foliage with no chlorosis or necrosis.",
            recommendation="Maintain standard staking, fertigation, and routine scouting.",
            prevention="Weekly inspection during morning hours.",
            model_type="development_fallback",
            created_at=now - timedelta(days=1)
        )
        db.add(dp2)

        # 3. Irrigation advisories
        ir1 = IrrigationAdvisory(
            user_id=farmer_user.id,
            farm_id=farm_1.id,
            crop="Paddy",
            growth_stage="Tillering",
            soil_type="Alluvial Soil",
            soil_moisture=32.0,
            temperature=33.0,
            humidity=72.0,
            rainfall=0.0,
            rain_probability=15.0,
            land_area=3.5,
            irrigation_type="Canal / River Irrigation",
            irrigation_status="NEEDS IRRIGATION",
            recommended_action="Apply irrigation immediately. Soil moisture has dipped to 32.0% during critical tillering phase.",
            water_estimate="85,000 Litres across 3.5 acres",
            recommended_timing="Early morning (5:30 AM - 8:00 AM)",
            reason="At tillering stage, moisture stress severely restricts productive panicle development.",
            weather_consideration="Low rain chance (15%) and warm temperatures accelerate water loss.",
            created_at=now - timedelta(hours=14)
        )
        db.add(ir1)

        ir2 = IrrigationAdvisory(
            user_id=farmer_user.id,
            farm_id=farm_2.id,
            crop="Tomato",
            growth_stage="Flowering",
            soil_type="Clayey Loam",
            soil_moisture=62.0,
            temperature=30.0,
            humidity=65.0,
            rainfall=0.0,
            rain_probability=20.0,
            land_area=1.5,
            irrigation_type="Drip Irrigation",
            irrigation_status="NO IMMEDIATE IRRIGATION",
            recommended_action="No immediate irrigation required. Soil moisture reserve is ample (62.0%).",
            water_estimate="0 Litres",
            recommended_timing="Re-evaluate in 48 hours",
            reason="Moisture level exceeds threshold. Drip system maintains root zone equilibrium.",
            weather_consideration="Moderate ambient humidity and stable weather.",
            created_at=now - timedelta(days=2)
        )
        db.add(ir2)

        # 4. Notifications
        notif1 = Notification(
            user_id=farmer_user.id,
            title="Irrigation Alert: Paddy (Tillering Phase)",
            message="Soil moisture level at Cauvery Delta Paddy Fields is low (32%). Consider scheduling canal water or borewell irrigation.",
            type="IRRIGATION",
            is_read=False,
            created_at=now - timedelta(hours=12)
        )
        db.add(notif1)

        notif2 = Notification(
            user_id=farmer_user.id,
            title="Disease Alert: Leaf Blast Diagnostic",
            message="Scan from 3 days ago indicated High Severity Rice Blast. Verify if foliar bio-control has been applied.",
            type="DISEASE",
            is_read=False,
            created_at=now - timedelta(days=1)
        )
        db.add(notif2)

        notif3 = Notification(
            user_id=farmer_user.id,
            title="Weather Advisory: Thanjavur District",
            message="Favorable sunny conditions predicted for the next 48 hours. Ideal for fertilizer top-dressing and field weeding.",
            type="WEATHER",
            is_read=True,
            created_at=now - timedelta(days=3)
        )
        db.add(notif3)

        # 5. Audit logs
        db.add(AuditLog(user_id=farmer_user.id, action="SEED_INIT", entity="System", details="Sample demo data created"))

        db.commit()
        print("[Seed] Seed data successfully populated into database!")

    except Exception as e:
        db.rollback()
        print(f"[Seed Error] {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
