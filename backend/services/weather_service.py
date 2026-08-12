import os
import requests
from services.ai_agent import IntentData

OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY", "")

def fetch_weather(intent_data: IntentData, user_id: str):
    """
    Fetches weather using OpenWeatherMap API.
    If no location is provided in the intent, falls back to the user's profile location.
    """
    location = intent_data.location
    if not location:
        # Fallback to a default or DB-fetched location (simulate for MVP)
        location = "Jamtara"
        
    if not OPENWEATHER_API_KEY:
        return {"error": "Weather API key missing", "is_demo_data": True, "weather": "Cloudy, 25°C"}
        
    url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={OPENWEATHER_API_KEY}&units=metric"
    try:
        resp = requests.get(url)
        data = resp.json()
        if resp.status_code == 200:
            return {
                "location": data.get("name"),
                "temperature": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "description": data["weather"][0]["description"],
                "wind_speed": data["wind"]["speed"]
            }
        else:
            return {"error": "Could not fetch weather", "details": data}
    except Exception as e:
        return {"error": str(e)}
