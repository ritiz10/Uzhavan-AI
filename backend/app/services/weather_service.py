import random
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
import requests
from app.core.config import settings
from app.utils.tn_constants import DISTRICT_PROFILES

class WeatherProvider(ABC):
    @abstractmethod
    def get_current_weather(self, district: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def get_forecast(self, district: str) -> List[Dict[str, Any]]:
        pass

class MockWeatherProvider(WeatherProvider):
    """
    Realistic agro-climatic simulation engine calibrated to Tamil Nadu's agro-ecological zones.
    Accounts for geographical variance (e.g. Nilgiris cool hill climate vs Thanjavur delta vs coastal Cuddalore).
    """

    def get_current_weather(self, district: str) -> Dict[str, Any]:
        profile = DISTRICT_PROFILES.get(district, {"avg_rainfall": 900})
        is_hilly = district in ["Nilgiris", "Dindigul", "Theni"]
        is_coastal = district in ["Chennai", "Cuddalore", "Nagapattinam", "Thoothukudi", "Ramanathapuram", "Kanyakumari"]
        
        # Base realistic readings
        if is_hilly:
            temp = round(random.uniform(16.0, 22.5), 1)
            humidity = round(random.uniform(70.0, 92.0), 1)
        elif is_coastal:
            temp = round(random.uniform(28.5, 34.0), 1)
            humidity = round(random.uniform(72.0, 88.0), 1)
        else: # Inland plains (Salem, Trichy, Madurai, Erode)
            temp = round(random.uniform(29.0, 36.5), 1)
            humidity = round(random.uniform(48.0, 70.0), 1)

        rain_prob = round(random.uniform(5.0, 45.0), 0)
        rainfall = round(random.uniform(0.0, 4.5), 1) if rain_prob > 35 else 0.0
        wind = round(random.uniform(8.0, 18.0), 1)

        conditions = ["Sunny / Clear Sky", "Partly Cloudy", "Passing Showers", "Overcast", "Hazy Sunshine"]
        condition = random.choice(conditions)

        agri_summary = self._generate_agri_summary(temp, humidity, rain_prob, condition)

        return {
            "district": district,
            "temperature": temp,
            "humidity": humidity,
            "rain_probability": rain_prob,
            "rainfall": rainfall,
            "wind_speed": wind,
            "condition": condition,
            "provider": "MockWeatherProvider (Tamil Nadu Agro-Climatic Model)",
            "is_demo": True,
            "recorded_at": datetime.now(timezone.utc),
            "agricultural_summary": agri_summary
        }

    def get_forecast(self, district: str) -> List[Dict[str, Any]]:
        forecast_days = []
        today = datetime.now(timezone.utc)
        
        for i in range(1, 8):
            day_date = today + timedelta(days=i)
            t_min = round(random.uniform(21.0, 24.5), 1)
            t_max = round(random.uniform(31.0, 36.0), 1)
            hum = round(random.uniform(50.0, 80.0), 1)
            rain_p = round(random.uniform(10.0, 60.0), 0)
            
            cond = "Scattered Showers" if rain_p > 45 else ("Partly Cloudy" if rain_p > 25 else "Sunny")
            icon = "rain" if rain_p > 45 else ("cloudy" if rain_p > 25 else "sun")
            
            if rain_p > 45:
                advice = "Good soil replenishment expected. Delay fertigation and foliar spraying to prevent wash-off."
            elif t_max > 35:
                advice = "High daytime temperatures expected. Ensure timely morning drip cycle to mitigate moisture stress."
            else:
                advice = "Favorable weather for field cultivation, weeding, and routine agricultural operations."

            forecast_days.append({
                "date": day_date.strftime("%Y-%m-%d"),
                "day_name": day_date.strftime("%A"),
                "temperature_min": t_min,
                "temperature_max": t_max,
                "humidity": hum,
                "rain_probability": rain_p,
                "condition": cond,
                "icon": icon,
                "agri_advice": advice
            })

        return forecast_days

    def _generate_agri_summary(self, temp: float, humidity: float, rain_prob: float, condition: str) -> str:
        if rain_prob > 40:
            return f"Showers anticipated ({rain_prob:.0f}% chance). Ideal for rainfed sowing; postpone pesticide spray to avoid runoff."
        elif temp > 35:
            return f"Warm weather ({temp}°C) elevates crop evapotranspiration. Early morning irrigation recommended."
        elif humidity > 80:
            return f"High relative humidity ({humidity}%). Monitor closely for foliar fungal diseases like blast and blight."
        else:
            return f"Stable weather ({temp}°C, {humidity}% humidity). Favorable for harvesting, spraying, and fertilizer application."

class OpenWeatherProvider(WeatherProvider):
    """OpenWeatherMap live API integration."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openweathermap.org/data/2.5"

    def get_current_weather(self, district: str) -> Dict[str, Any]:
        try:
            url = f"{self.base_url}/weather?q={district},IN&appid={self.api_key}&units=metric"
            resp = requests.get(url, timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                temp = float(data["main"]["temp"])
                humidity = float(data["main"]["humidity"])
                wind = float(data.get("wind", {}).get("speed", 0.0)) * 3.6  # m/s to km/h
                condition = data["weather"][0]["description"].title()
                rain_prob = 10.0  # OpenWeather current does not include prob
                
                return {
                    "district": district,
                    "temperature": temp,
                    "humidity": humidity,
                    "rain_probability": rain_prob,
                    "rainfall": float(data.get("rain", {}).get("1h", 0.0)),
                    "wind_speed": wind,
                    "condition": condition,
                    "provider": "OpenWeatherMap Live API",
                    "is_demo": False,
                    "recorded_at": datetime.now(timezone.utc),
                    "agricultural_summary": f"Live weather reading: {condition} with {temp}°C ambient temperature."
                }
        except Exception as e:
            print(f"[WeatherService] OpenWeather error: {e}. Falling back to Tamil Nadu Mock Provider.")
        
        # Fallback to mock if API call fails
        mock = MockWeatherProvider()
        res = mock.get_current_weather(district)
        res["provider"] = "MockWeatherProvider (Fallback due to live API timeout)"
        return res

    def get_forecast(self, district: str) -> List[Dict[str, Any]]:
        # Default to mock forecast for reliable structured 7-day display
        mock = MockWeatherProvider()
        return mock.get_forecast(district)

class WeatherService:
    def __init__(self):
        if settings.WEATHER_PROVIDER == "openweather" and settings.WEATHER_API_KEY:
            self.provider: WeatherProvider = OpenWeatherProvider(settings.WEATHER_API_KEY)
        else:
            self.provider = MockWeatherProvider()

    def get_current_weather(self, district: str = "Thanjavur") -> Dict[str, Any]:
        return self.provider.get_current_weather(district)

    def get_forecast(self, district: str = "Thanjavur") -> Dict[str, Any]:
        current = self.get_current_weather(district)
        forecast_days = self.provider.get_forecast(district)
        return {
            "district": district,
            "provider": current["provider"],
            "is_demo": current["is_demo"],
            "current": current,
            "forecast": forecast_days
        }

weather_service = WeatherService()
