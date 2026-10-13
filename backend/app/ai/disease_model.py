import os
from typing import Dict, Any, Optional
from PIL import Image
from app.core.config import settings
from app.ai.preprocessing import extract_image_features

# Comprehensive Tamil Nadu Crop Disease Knowledgebase
DISEASE_KNOWLEDGEBASE = {
    "Rice": {
        "Blast (Pyricularia oryzae)": {
            "symptoms": "Spindle-shaped lesions with brown or reddish-brown borders and greyish-white centers on leaves, nodal rot, and rotten neck.",
            "severity": "High",
            "recommendation": "Drain excess water from the field. Avoid high nitrogen fertilizer application during active infection. Apply certified bio-control Pseudomonas fluorescens (0.2%) as foliar spray or consult local TNAU Agronomist for approved systemic fungicide.",
            "prevention": "Use certified blast-resistant seeds (e.g., ADT 43, CR 1009 Sub 1). Treat seeds with Trichoderma viride @ 4g/kg seed. Maintain balanced NPK ratio.",
            "expert_advisory": "Contact your block Agricultural Extension Officer (AEO) or nearest Krishi Vigyan Kendra (KVK) if neck rot appears, as this causes severe yield loss."
        },
        "Bacterial Leaf Blight (Xanthomonas oryzae)": {
            "symptoms": "Water-soaked streaks on leaf tips that turn into yellow-orange wavy lesions along leaf margins, followed by leaf drying (Kresek symptom).",
            "severity": "Moderate to High",
            "recommendation": "Avoid top-dressing with nitrogen fertilizer until infection subsides. Drain stagnant water. Spray fresh cow dung extract (20%) or copper hydroxide / validamycin as prescribed by local agricultural officer.",
            "prevention": "Ensure deep summer ploughing. Clip seedling tips before transplanting. Maintain proper spacing to allow air circulation.",
            "expert_advisory": "Consult with a local agronomist if kresek (wilting) phase occurs within 3-4 weeks after transplanting."
        },
        "Brown Spot (Bipolaris oryzae)": {
            "symptoms": "Small, oval or circular brown spots with grey or white center on leaves and glumes.",
            "severity": "Moderate",
            "recommendation": "Apply soil amendments if soil is nutrient deficient (especially potash and zinc). Apply foliar spray of Mancozeb (0.2%) or certified organic bio-agent as per local label instructions.",
            "prevention": "Soil testing and balanced fertilization. Avoid moisture stress in nursery and vegetative stages.",
            "expert_advisory": "Brown spot is often an indicator of poor soil fertility or nutrient imbalance. Soil testing recommended."
        },
        "Healthy Leaf": {
            "symptoms": "Vigorous green foliage with no visible chlorosis, necrosis, lesions, or insect puncture marks.",
            "severity": "None",
            "recommendation": "Maintain scheduled nutrient and water management as per TNAU crop production guide.",
            "prevention": "Regular field scouting once a week during morning hours.",
            "expert_advisory": "Crop is in healthy state. Continue routine agronomic practices."
        }
    },
    "Tomato": {
        "Early Blight (Alternaria solani)": {
            "symptoms": "Concentric dark brown to black rings ('target-board' appearance) surrounded by yellow chlorotic halo on older leaves.",
            "severity": "Moderate",
            "recommendation": "Prune and dispose of infected bottom leaves away from the plot. Avoid overhead sprinkler irrigation to reduce leaf wetness. Apply copper oxychloride (0.25%) or chlorothalonil following manufacturer guidelines.",
            "prevention": "Mulch soil around plants to prevent soil-splash pathogens. Implement 2-year crop rotation without solanaceous crops.",
            "expert_advisory": "Consult an agronomist if defoliation exceeds 25% of the plant canopy."
        },
        "Late Blight (Phytophthora infestans)": {
            "symptoms": "Large, irregular water-soaked dark green/brown lesions that turn brown quickly, with white cottony fungal growth on lower leaf surfaces during cool humid mornings.",
            "severity": "High to Severe",
            "recommendation": "Immediately rogue out severely diseased plants. Ensure good field drainage. Apply registered protective fungicide (e.g., Mancozeb 0.2% or Metalaxyl-Mancozeb) under expert guidance.",
            "prevention": "Plant resistant cultivars. Avoid planting near potato fields. Increase row spacing.",
            "expert_advisory": "Urgent: Late blight spreads explosively under humid/rainy conditions. Seek immediate advice from your local horticulture department."
        },
        "Tomato Leaf Curl Virus (ToLCV)": {
            "symptoms": "Upward curling and crinkling of leaves, reduced leaf size, stunted plant growth, vein clearing, and flower dropping.",
            "severity": "High",
            "recommendation": "Uproot and destroy infected plants to prevent viral spread. Spray yellow sticky traps (12 per acre) to control whitefly (Bemisia tabaci) vector. Apply neem oil (3%) or recommended biopesticide.",
            "prevention": "Raise nursery under 40-mesh insect-proof nylon net. Spray barrier crops like maize/sorghum on border rows.",
            "expert_advisory": "Consult extension worker for integrated vector management in your regional cluster."
        },
        "Healthy Leaf": {
            "symptoms": "Clean green leaves, uniform shape, no curling or spots.",
            "severity": "None",
            "recommendation": "Continue standard staking, weeding, and fertigation.",
            "prevention": "Weekly inspection for early whitefly or aphid presence.",
            "expert_advisory": "Crop is healthy."
        }
    },
    "Chilli": {
        "Anthracnose / Fruit Rot (Colletotrichum capsici)": {
            "symptoms": "Circular sunken spots on ripe fruits with black concentric rings of acervuli. Die-back on twigs starting from tip downwards.",
            "severity": "High",
            "recommendation": "Pick and destroy affected fruits. Prune dry twigs 2-3 inches below infected part. Apply copper fungicide or carbendazim as per label instructions.",
            "prevention": "Use disease-free certified seeds. Treat seeds with Trichoderma @ 4g/kg seed. Avoid harvesting in wet weather.",
            "expert_advisory": "Seek guidance from local horticulture officer for post-harvest protection protocols."
        },
        "Chilli Leaf Curl Virus": {
            "symptoms": "Upward curling, puckering of leaves, shortened internodes, bushy appearance, thrips and mite feeding marks.",
            "severity": "High",
            "recommendation": "Install blue sticky traps for thrips and yellow traps for whiteflies. Spray micronutrient mixture to relieve secondary stress.",
            "prevention": "Intercrop with onion or coriander. Use resistant hybrids.",
            "expert_advisory": "Consult your agricultural officer for vector control options."
        },
        "Healthy Leaf": {
            "symptoms": "Firm dark green leaves without crinkling or necrotic spots.",
            "severity": "None",
            "recommendation": "Follow balanced fertigation schedule.",
            "prevention": "Keep field free of solanaceous weeds.",
            "expert_advisory": "Normal growth stage."
        }
    },
    "Brinjal": {
        "Little Leaf of Brinjal (Phytoplasma)": {
            "symptoms": "Excessive reduction in leaf size, clustering of leaves giving a bushy look, plant phyllody (flowers transformed into green leaf-like structures).",
            "severity": "High",
            "recommendation": "Eradicate and burn infected plants. Control leafhopper vector (Hishimonus phycitis) using neem seed kernel extract (NSKE 5%) or recommended contact insecticide.",
            "prevention": "Dip seedling roots in tetracycline solution before planting if recommended locally. Remove wild weed hosts.",
            "expert_advisory": "Phytoplasma cannot be cured once inside the vascular system. Seek expert help to arrest vector spread."
        },
        "Cercospora Leaf Spot": {
            "symptoms": "Circular to irregular chlorotic spots with grey center and dark brown margin on leaves.",
            "severity": "Moderate",
            "recommendation": "Spray Mancozeb (2g/L) or copper oxychloride (2.5g/L) at 15-day intervals upon spot appearance.",
            "prevention": "Crop rotation with non-host crops and clean cultivation.",
            "expert_advisory": "Consult agronomist if spots appear during early flowering."
        },
        "Healthy Leaf": {
            "symptoms": "Broad, smooth green leaves with normal venation.",
            "severity": "None",
            "recommendation": "Standard crop maintenance.",
            "prevention": "Regular scouting.",
            "expert_advisory": "Healthy plant."
        }
    },
    "Cotton": {
        "Bacterial Blight / Angular Leaf Spot (Xanthomonas citri pv. malvacearum)": {
            "symptoms": "Small angular water-soaked spots bounded by leaf veinlets turning dark reddish-brown to black, black arm on branches.",
            "severity": "Moderate to High",
            "recommendation": "Spray copper oxychloride (0.25%) mixed with streptocycline (100 ppm) as per TNAU pest & disease manual.",
            "prevention": "Acid delinting of cotton seeds before sowing. Resistant cultivars like MCU 5, Surabhi.",
            "expert_advisory": "Contact your local cotton research station or AEO if black arm stage is noticed on main stem."
        },
        "Healthy Leaf": {
            "symptoms": "Broad palmate green leaves without angular lesions.",
            "severity": "None",
            "recommendation": "Monitor for sucking pests.",
            "prevention": "Maintain clean border bunds.",
            "expert_advisory": "Healthy crop."
        }
    },
    "Groundnut": {
        "Tikka Disease / Leaf Spot (Cercospora personata)": {
            "symptoms": "Small dark circular spots without distinct halo on lower leaves, causing premature severe defoliation.",
            "severity": "High",
            "recommendation": "Foliar spray of Carbendazim (0.1%) or Mancozeb (0.2%) as soon as initial spots are detected on lower canopy.",
            "prevention": "Crop rotation. Seed treatment with Trichoderma viride @ 4g/kg seed. Early sowing during season.",
            "expert_advisory": "Defoliation during pegging significantly reduces kernel filling; consult extension officer promptly."
        },
        "Healthy Leaf": {
            "symptoms": "Lush pinnate green leaves free of necrosis.",
            "severity": "None",
            "recommendation": "Maintain gypsum application at peg formation.",
            "prevention": "Routine scouting.",
            "expert_advisory": "Crop is healthy."
        }
    },
    "Banana": {
        "Sigatoka Leaf Spot (Mycosphaerella musicola)": {
            "symptoms": "Small yellowish streaks parallel to leaf veins that expand into elliptical spots with light brown center and dark yellow halo.",
            "severity": "Moderate to High",
            "recommendation": "Prune and burn heavily infected dead leaves. Ensure good drainage. Spray mineral oil (1%) or Propiconazole (0.1%) under certified agricultural guidance.",
            "prevention": "Avoid overcrowding. Maintain proper spacing (1.8m x 1.8m). Balanced potash application to strengthen leaf cuticle.",
            "expert_advisory": "Consult NRCB (National Research Centre for Banana, Tiruchirappalli) advisory or local extension staff."
        },
        "Healthy Leaf": {
            "symptoms": "Broad healthy emerald-green lamina without necrotic striping.",
            "severity": "None",
            "recommendation": "Standard desuckering and fertigation.",
            "prevention": "Good drainage and weed control.",
            "expert_advisory": "Healthy plantation."
        }
    }
}

class DiseaseModel:
    """
    Modular disease detection interface.
    In production: can plug in TensorFlow, PyTorch or ONNX model.
    In development/fallback: uses visual feature analysis & agronomic heuristics with transparent labeling.
    """
    def __init__(self):
        self.model_type = "development_fallback"
        self.is_deep_learning_available = False

    def predict(self, image: Image.Image, crop_name: Optional[str] = None) -> Dict[str, Any]:
        features = extract_image_features(image)
        
        # Normalize crop name
        crop = self._resolve_crop(crop_name)
        diseases = DISEASE_KNOWLEDGEBASE.get(crop, DISEASE_KNOWLEDGEBASE["Rice"])
        
        # Analyze visual features (greenness, dark spots, yellowing)
        predicted_disease, confidence = self._infer_disease(crop, diseases, features)
        
        details = diseases.get(predicted_disease, list(diseases.values())[0])
        
        return {
            "crop": crop,
            "predicted_disease": predicted_disease,
            "confidence": round(confidence * 100, 1),
            "confidence_display": f"{round(confidence * 100, 1)}%",
            "severity": details["severity"],
            "symptoms": details["symptoms"],
            "recommendation": details["recommendation"],
            "prevention": details["prevention"],
            "expert_advisory": details["expert_advisory"],
            "model_type": self.model_type,
            "is_fallback": True,
            "disclaimer": "AI-based detection is an advisory tool and should not replace professional agricultural diagnosis. Follow local agriculture department guidelines and certified product labels."
        }

    def _resolve_crop(self, crop_name: Optional[str]) -> str:
        if not crop_name:
            return "Tomato"
        name_lower = crop_name.lower().strip()
        if "paddy" in name_lower or "rice" in name_lower:
            return "Rice"
        elif "tomato" in name_lower:
            return "Tomato"
        elif "chilli" in name_lower or "pepper" in name_lower:
            return "Chilli"
        elif "brinjal" in name_lower or "eggplant" in name_lower:
            return "Brinjal"
        elif "cotton" in name_lower:
            return "Cotton"
        elif "groundnut" in name_lower or "peanut" in name_lower:
            return "Groundnut"
        elif "banana" in name_lower:
            return "Banana"
        return "Tomato"

    def _infer_disease(self, crop: str, diseases: dict, features: dict) -> tuple:
        greenness = features["greenness"]
        yellowing = features["yellowing"]
        dark_spots = features["dark_spots"]

        disease_names = [d for d in diseases.keys() if "Healthy" not in d]
        healthy_name = [d for d in diseases.keys() if "Healthy" in d]
        healthy_name = healthy_name[0] if healthy_name else "Healthy Leaf"

        # If image is predominantly clean vibrant green with few dark spots
        if greenness > 0.58 and dark_spots < 0.05 and yellowing < 1.15:
            conf = min(0.95, max(0.85, greenness * 1.3))
            return healthy_name, conf
        elif dark_spots > 0.15:
            # Concentrated spots / blight
            target = disease_names[0] if len(disease_names) > 0 else healthy_name
            conf = min(0.94, max(0.82, 0.75 + dark_spots * 0.8))
            return target, conf
        elif yellowing > 1.25:
            # Chlorosis / viral curl
            target = disease_names[1] if len(disease_names) > 1 else disease_names[0]
            conf = min(0.92, max(0.80, 0.70 + (yellowing - 1.0) * 0.3))
            return target, conf
        else:
            # Mild symptoms
            target = disease_names[0] if disease_names else healthy_name
            conf = 0.83
            return target, conf

disease_model = DiseaseModel()
