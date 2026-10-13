import io
from typing import Tuple
import numpy as np
from PIL import Image

def preprocess_crop_features(n: float, p: float, k: float, ph: float, temp: float, humidity: float, rainfall: float) -> np.ndarray:
    """Validate and package numeric features into 2D NumPy array for ML inference."""
    features = np.array([[n, p, k, temp, humidity, ph, rainfall]], dtype=np.float32)
    return features

def validate_and_load_image(image_bytes: bytes, max_size_mb: int = 10) -> Image.Image:
    """
    Validate file size and image integrity using Pillow.
    Returns RGB PIL Image.
    """
    if len(image_bytes) > max_size_mb * 1024 * 1024:
        raise ValueError(f"Image file size exceeds maximum permitted limit of {max_size_mb} MB.")
    
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()  # Verify image integrity
        # Re-open after verify() because verify() clears file pointers
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")
        return image
    except Exception as e:
        raise ValueError(f"Uploaded file is not a valid or readable image: {str(e)}")

def extract_image_features(image: Image.Image, target_size: Tuple[int, int] = (224, 224)) -> dict:
    """
    Extract visual color and texture features from plant leaf images
    used by the modular feature-based disease classifier.
    """
    img_resized = image.resize(target_size)
    arr = np.array(img_resized, dtype=np.float32) / 255.0

    # Channel means and standard deviations
    r_mean, g_mean, b_mean = np.mean(arr[:, :, 0]), np.mean(arr[:, :, 1]), np.mean(arr[:, :, 2])
    r_std, g_std, b_std = np.std(arr[:, :, 0]), np.std(arr[:, :, 1]), np.std(arr[:, :, 2])

    # Greenness ratio vs Brownness/Yellowing
    greenness = g_mean / (r_mean + b_mean + 1e-6)
    yellowing = (r_mean + g_mean) / (2.0 * b_mean + 1e-6)
    dark_spots = np.sum((arr[:, :, 0] < 0.3) & (arr[:, :, 1] < 0.3) & (arr[:, :, 2] < 0.3)) / (224 * 224)

    return {
        "r_mean": float(r_mean),
        "g_mean": float(g_mean),
        "b_mean": float(b_mean),
        "greenness": float(greenness),
        "yellowing": float(yellowing),
        "dark_spots": float(dark_spots),
        "arr": arr
    }
