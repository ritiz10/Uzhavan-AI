from typing import Dict, Any, Optional

# Crop water requirement multiplier per growth stage
STAGE_WATER_FACTORS = {
    "Initial / Germination": 0.6,
    "Vegetative": 0.85,
    "Tillering": 0.9,
    "Flowering": 1.25,      # Critical moisture-sensitive stage
    "Fruiting / Grain Filling": 1.2, # Critical stage
    "Maturity / Ripening": 0.5
}

# Soil water holding properties
SOIL_WATER_RETENTION = {
    "Black Cotton Soil (Regur)": {"holding_capacity": "High", "drainage": "Slow", "evap_rate": "Low", "depletion_multiplier": 0.75},
    "Clayey Loam": {"holding_capacity": "High", "drainage": "Moderate", "evap_rate": "Moderate", "depletion_multiplier": 0.85},
    "Alluvial Soil": {"holding_capacity": "Medium-High", "drainage": "Good", "evap_rate": "Moderate", "depletion_multiplier": 1.0},
    "Red Loam": {"holding_capacity": "Moderate", "drainage": "Free", "evap_rate": "High", "depletion_multiplier": 1.15},
    "Laterite Soil": {"holding_capacity": "Low-Moderate", "drainage": "Rapid", "evap_rate": "High", "depletion_multiplier": 1.25},
    "Coastal Sandy Soil": {"holding_capacity": "Very Low", "drainage": "Excessive", "evap_rate": "Very High", "depletion_multiplier": 1.45}
}

# Base water requirement in Litres per acre per day for Tamil Nadu crops
CROP_BASE_LITRES_ACRE_DAY = {
    "Paddy": 28000,
    "Sugarcane": 22000,
    "Banana": 20000,
    "Cotton": 12000,
    "Maize": 11000,
    "Turmeric": 13000,
    "Tomato": 11500,
    "Chilli": 9500,
    "Brinjal": 10500,
    "Onion": 9000,
    "Groundnut": 8500,
    "Black Gram": 5000,
    "Millets": 4500,
    "Coconut": 10000
}

class IrrigationRuleEngine:
    """
    Hybrid agronomic rule and environmental decision engine for irrigation scheduling in Tamil Nadu.
    """

    def evaluate(
        self,
        crop: str,
        growth_stage: str,
        soil_type: str = "Red Loam",
        soil_moisture: float = 40.0,
        temperature: float = 32.0,
        humidity: float = 60.0,
        rainfall: float = 0.0,
        rain_probability: float = 15.0,
        land_area: float = 1.0,
        irrigation_type: str = "Drip Irrigation"
    ) -> Dict[str, Any]:
        # 1. Base agronomic factors
        base_water = CROP_BASE_LITRES_ACRE_DAY.get(crop, 10000)
        stage_factor = STAGE_WATER_FACTORS.get(growth_stage, 1.0)
        soil_info = SOIL_WATER_RETENTION.get(soil_type, SOIL_WATER_RETENTION["Red Loam"])
        
        # Irrigation system efficiency factor
        eff_factor = 1.0
        if "Drip" in irrigation_type:
            eff_factor = 0.65  # Drip is highly water efficient (90-95% application efficiency)
        elif "Sprinkler" in irrigation_type:
            eff_factor = 0.80
        elif "Canal" in irrigation_type or "Flood" in irrigation_type:
            eff_factor = 1.30  # High seepage and conveyance loss

        # Temperature evapotranspiration factor
        et_factor = 1.0 + max(0.0, (temperature - 28.0) * 0.03)

        calculated_litres = int(base_water * stage_factor * soil_info["depletion_multiplier"] * eff_factor * et_factor * land_area)

        # 2. Decision Logic
        is_critical_stage = "Flowering" in growth_stage or "Fruiting" in growth_stage or "Tillering" in growth_stage
        
        if rain_probability >= 65.0 or rainfall > 10.0:
            status = "NO IMMEDIATE IRRIGATION"
            status_color = "green"
            action = f"Delay irrigation for the next 24-48 hours. Rain probability is high ({rain_probability:.0f}%) with expected natural precipitation."
            water_est = "0 Litres (Rely on forecasted precipitation)"
            timing = "Post-rain evaluation"
            reason = f"Impending rain ({rain_probability:.0f}% chance) will provide adequate soil recharge. Irrigating now risks waterlogging and root zone hypoxia."
            weather_cons = f"Forecast indicates significant rain likelihood ({rain_probability:.0f}%). Ambient humidity is {humidity:.0f}%."

        elif soil_moisture < 35.0:
            status = "NEEDS IRRIGATION"
            status_color = "red"
            urgency = "immediate" if is_critical_stage else "scheduled"
            action = f"Apply irrigation ({calculated_litres:,} Litres across {land_area} {soil_type} area). Critical moisture depletion observed at {soil_moisture:.1f}%."
            water_est = f"{calculated_litres:,} Litres ({calculated_litres // max(1, int(land_area)):,} L/acre)"
            timing = "Early morning (5:30 AM - 8:00 AM) or Late evening (5:30 PM - 7:00 PM)"
            reason = (
                f"Soil moisture ({soil_moisture:.1f}%) is below the allowable depletion threshold. "
                + (f"Crop is at the critical '{growth_stage}' stage; water stress will cause flower abortion and yield decline." if is_critical_stage else "Plant is undergoing moisture stress.")
            )
            weather_cons = f"Low rain probability ({rain_probability:.0f}%) and ambient temperature of {temperature:.1f}°C accelerate transpiration."

        elif 35.0 <= soil_moisture <= 55.0:
            if is_critical_stage and rain_probability < 30.0:
                status = "NEEDS IRRIGATION"
                status_color = "red"
                reduced_water = int(calculated_litres * 0.75)
                action = f"Provide light supplementary irrigation ({reduced_water:,} Litres). Soil moisture is borderline ({soil_moisture:.1f}%) during critical {growth_stage} phase."
                water_est = f"{reduced_water:,} Litres"
                timing = "Early morning (6:00 AM - 8:30 AM)"
                reason = f"At {growth_stage} stage, plants are extremely vulnerable to moisture dips even before visible wilting occurs."
                weather_cons = f"Dry conditions expected (Rain chance: {rain_probability:.0f}%)."
            else:
                status = "MONITOR"
                status_color = "yellow"
                action = f"Hold irrigation for 24 hours. Re-inspect soil moisture tomorrow morning. Current reading is {soil_moisture:.1f}%."
                water_est = f"Standby (~{calculated_litres:,} Litres if moisture drops below 35%)"
                timing = "Review in 24 hours"
                reason = f"Soil moisture ({soil_moisture:.1f}%) is currently within the acceptable zone for {soil_type}."
                weather_cons = f"Forecast rain probability is {rain_probability:.0f}%. Evaporative demand is moderate."

        else: # soil_moisture > 55.0%
            status = "NO IMMEDIATE IRRIGATION"
            status_color = "green"
            action = f"No irrigation required. Root zone soil moisture is plentiful ({soil_moisture:.1f}%)."
            water_est = "0 Litres (Adequate soil reserve)"
            timing = "Check in 48-72 hours"
            reason = f"Soil moisture ({soil_moisture:.1f}%) is well above field capacity requirement. Avoid over-irrigation."
            weather_cons = f"Relative humidity is {humidity:.0f}%. Soil moisture retention is adequate."

        return {
            "crop": crop,
            "growth_stage": growth_stage,
            "irrigation_status": status,
            "status_color": status_color,
            "recommended_action": action,
            "water_estimate": water_est,
            "recommended_timing": timing,
            "reason": reason,
            "weather_consideration": weather_cons,
            "assumptions_note": f"Estimated based on {soil_type}, {growth_stage} stage, {irrigation_type} efficiency, and {temperature:.1f}°C temperature on {land_area} acres. Farmer may adjust based on localized emitter flow rates."
        }

irrigation_engine = IrrigationRuleEngine()
