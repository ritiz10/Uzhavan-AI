"""
Offline / Startup Training Script for Crop Recommendation Model.
Generates an agronomic feature dataset mapped to Tamil Nadu agricultural profiles,
trains a scikit-learn RandomForestClassifier, and serializes to joblib.
"""

import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

from app.core.config import settings
from app.ai.crop_model import CROP_AGRONOMIC_PROFILES

def generate_crop_dataset(samples_per_crop: int = 150, random_state: int = 42):
    np.random.seed(random_state)
    X = []
    y = []

    for crop, prof in CROP_AGRONOMIC_PROFILES.items():
        n_low, n_high = prof["n_range"]
        p_low, p_high = prof["p_range"]
        k_low, k_high = prof["k_range"]
        ph_low, ph_high = prof["ph_range"]
        t_low, t_high = prof["temp_range"]
        h_low, h_high = prof["humidity_range"]
        r_low, r_high = prof["rainfall_range"]

        for _ in range(samples_per_crop):
            # Normal distribution centered in optimal range with slight variance
            n = np.clip(np.random.normal((n_low + n_high) / 2, (n_high - n_low) / 4), 5, 250)
            p = np.clip(np.random.normal((p_low + p_high) / 2, (p_high - p_low) / 4), 5, 150)
            k = np.clip(np.random.normal((k_low + k_high) / 2, (k_high - k_low) / 4), 5, 200)
            ph = np.clip(np.random.normal((ph_low + ph_high) / 2, (ph_high - ph_low) / 4), 4.5, 9.0)
            t = np.clip(np.random.normal((t_low + t_high) / 2, (t_high - t_low) / 4), 15, 45)
            h = np.clip(np.random.normal((h_low + h_high) / 2, (h_high - h_low) / 4), 30, 99)
            r = np.clip(np.random.normal((r_low + r_high) / 2, (r_high - r_low) / 4), 200, 2800)

            X.append([n, p, k, t, h, ph, r])
            y.append(crop)

    return np.array(X, dtype=np.float32), np.array(y)

def train_and_save_crop_model():
    print("Generating agronomic crop training dataset...")
    X, y = generate_crop_dataset(samples_per_crop=200)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"Training RandomForestClassifier on {len(X_train)} samples...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
    clf.fit(X_train, y_train)
    
    preds = clf.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"Model validation accuracy: {acc * 100:.2f}%")

    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    out_file = os.path.join(settings.MODEL_DIR, "crop_recommendation_model.joblib")
    
    bundle = {
        "model": clf,
        "feature_names": ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"],
        "classes": clf.classes_.tolist(),
        "model_version": "1.0.0",
        "description": "Trained RandomForestClassifier for Tamil Nadu crop recommendation"
    }
    
    joblib.dump(bundle, out_file)
    print(f"Model successfully serialized and saved to: {out_file}")
    return out_file

if __name__ == "__main__":
    train_and_save_crop_model()
