import os
import datetime
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"
REQUEST_TIMEOUT_SECONDS = 7

def get_openweather_api_key() -> str:
    key = getattr(settings, 'OPENWEATHER_API_KEY', None) or os.getenv('OPENWEATHER_API_KEY')
    return key.strip() if key else ""

def get_current_weather(lat: float = None, lon: float = None, city_name: str = None) -> dict:
    """
    Fetches real-time weather from OpenWeatherMap using coordinates or city name.
    """
    key = get_openweather_api_key()
    if not key:
        return {"status": "unavailable", "message": "Weather data currently unavailable."}

    params = {
        "appid": key,
        "units": "metric",
    }
    if lat is not None and lon is not None:
        params["lat"] = float(lat)
        params["lon"] = float(lon)
    elif city_name:
        params["q"] = city_name.strip()
    else:
        return {"status": "unavailable", "error": "No coordinates or city name provided"}

    try:
        url = f"{OPENWEATHER_BASE_URL}/weather"
        resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
        if resp.status_code == 200:
            data = resp.json()
            main = data.get("main", {})
            weather_list = data.get("weather", [])
            primary_weather = weather_list[0] if weather_list else {}

            rain_data = data.get("rain", {})
            rain_1h = rain_data.get("1h", 0) if isinstance(rain_data, dict) else 0
            # Rough probability indicator from clouds / weather
            clouds = data.get("clouds", {}).get("all", 0)
            condition = primary_weather.get("main", "Clear")
            rain_prob = 80 if "rain" in condition.lower() else (40 if clouds > 70 else 10)

            return {
                "temperature": round(main.get("temp", 25)),
                "feels_like": round(main.get("feels_like", 25)),
                "temp_min": round(main.get("temp_min", 20)),
                "temp_max": round(main.get("temp_max", 30)),
                "humidity": main.get("humidity", 50),
                "condition": condition,
                "description": primary_weather.get("description", condition).capitalize(),
                "icon": primary_weather.get("icon", "01d"),
                "rain_probability": rain_prob,
                "city": data.get("name", city_name or ""),
                "source": "openweathermap",
                "status": "live"
            }
        else:
            logger.warning(f"OpenWeatherMap current weather returned HTTP {resp.status_code}: {resp.text[:100]}")
    except Exception as e:
        logger.error(f"Error calling OpenWeatherMap current weather: {e}")

    return {"status": "unavailable", "source": "openweathermap"}

def get_forecast(lat: float = None, lon: float = None, city_name: str = None, days: int = 3) -> list:
    """
    Fetches 5-day / 3-hour forecast and condenses into daily summary cards.
    """
    key = get_openweather_api_key()
    if not key:
        return []

    params = {
        "appid": key,
        "units": "metric",
    }
    if lat is not None and lon is not None:
        params["lat"] = float(lat)
        params["lon"] = float(lon)
    elif city_name:
        params["q"] = city_name.strip()
    else:
        return []

    try:
        url = f"{OPENWEATHER_BASE_URL}/forecast"
        resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
        if resp.status_code == 200:
            data = resp.json()
            items = data.get("list", [])
            daily_forecasts = []
            seen_dates = set()

            for item in items:
                dt_txt = item.get("dt_txt", "") # e.g. "2026-09-12 12:00:00"
                date_part = dt_txt.split(" ")[0] if " " in dt_txt else ""
                
                # Pick midday entries or first per date
                if date_part and date_part not in seen_dates:
                    seen_dates.add(date_part)
                    main = item.get("main", {})
                    w = item.get("weather", [{}])[0]
                    pop = int(item.get("pop", 0) * 100) # Probability of precipitation

                    try:
                        date_obj = datetime.date.fromisoformat(date_part)
                        weekday = date_obj.strftime("%a")
                    except Exception:
                        weekday = date_part

                    daily_forecasts.append({
                        "date": date_part,
                        "day": weekday,
                        "temp": round(main.get("temp", 25)),
                        "condition": w.get("main", "Clear"),
                        "description": w.get("description", "").capitalize(),
                        "icon": w.get("icon", "01d"),
                        "rain_chance": pop
                    })

                    if len(daily_forecasts) >= days:
                        break

            return daily_forecasts
    except Exception as e:
        logger.warning(f"Error fetching OpenWeatherMap forecast: {e}")

    return []

def get_destination_weather(lat: float = None, lon: float = None, city_name: str = None) -> dict:
    """
    Modular wrapper returning combined current weather and forecast.
    Ready to swap to Open-Meteo in future phases without altering orchestrator API.
    """
    current = get_current_weather(lat=lat, lon=lon, city_name=city_name)
    forecast = get_forecast(lat=lat, lon=lon, city_name=city_name, days=3)
    current["forecast"] = forecast
    return current
