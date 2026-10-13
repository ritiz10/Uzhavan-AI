import os
from typing import Dict, Any
from app.core.config import settings
from app.ai.crop_model import crop_predictor
from app.ai.disease_model import disease_model
from app.ai.irrigation_engine import irrigation_engine

class ModelManager:
    """
    Central AI Model Orchestrator and Lifecycle Manager.
    Coordinates model loading, availability checks, fallback transparency, and startup training.
    """
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.crop_predictor = crop_predictor
        self.disease_model = disease_model
        self.irrigation_engine = irrigation_engine
        self._ensure_models_trained()

    def _ensure_models_trained(self):
        """If crop recommendation model is not trained yet, run training to generate it."""
        model_path = os.path.join(settings.MODEL_DIR, "crop_recommendation_model.joblib")
        if not os.path.exists(model_path):
            try:
                from app.ai.train_models import train_and_save_crop_model
                print("[ModelManager] Initializing default scikit-learn crop recommendation model...")
                train_and_save_crop_model()
                # Reload model into predictor
                self.crop_predictor._load_or_fallback()
            except Exception as e:
                print(f"[ModelManager Warning] Could not auto-train model: {e}. Using fallback logic.")

    def get_models_status(self) -> Dict[str, Any]:
        """Provides status and metadata of all AI components."""
        model_path = os.path.join(settings.MODEL_DIR, "crop_recommendation_model.joblib")
        crop_trained = os.path.exists(model_path) and self.crop_predictor.is_loaded

        return {
            "crop_recommendation": {
                "status": "active",
                "model_type": "trained_model" if crop_trained else "development_fallback",
                "framework": "scikit-learn (RandomForestClassifier)",
                "file_path": model_path if crop_trained else None
            },
            "disease_detection": {
                "status": "active",
                "model_type": self.disease_model.model_type,
                "framework": "Modular Vision & Feature Heuristics (Ready for PyTorch/TensorFlow)",
                "supported_crops": ["Rice", "Tomato", "Chilli", "Brinjal", "Cotton", "Groundnut", "Banana"]
            },
            "irrigation_advisory": {
                "status": "active",
                "model_type": "rule_ai_hybrid_engine",
                "framework": "TNAU Agronomic Water Budgeting Engine"
            }
        }

model_manager = ModelManager()
