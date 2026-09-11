import os
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

# Official HeiGIT API host
ORS_BASE_URL = "https://api.heigit.org/openrouteservice"
REQUEST_TIMEOUT_SECONDS = 7

def get_ors_api_key() -> str:
    key = getattr(settings, 'ORS_API_KEY', None) or os.getenv('ORS_API_KEY')
    return key.strip() if key else ""

def geocode_location(query: str) -> dict:
    """
    Geocodes location using HeiGIT ORS geocode endpoint.
    Returns:
        {
            "name": query,
            "latitude": float or None,
            "longitude": float or None,
            "status": "live" | "unavailable"
        }
    """
    key = get_ors_api_key()
    if not key or not query:
        return {
            "name": query,
            "latitude": None,
            "longitude": None,
            "status": "unavailable",
            "error": "API key or query missing"
        }

    url = f"{ORS_BASE_URL}/geocode/search"
    headers = {
        "Authorization": key,
        "Accept": "application/json",
    }
    params = {
        "text": query,
        "size": 1
    }

    try:
        resp = requests.get(url, params=params, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS)
        if resp.status_code == 200:
            data = resp.json()
            features = data.get("features", [])
            if features:
                coords = features[0].get("geometry", {}).get("coordinates", [])
                if len(coords) >= 2:
                    return {
                        "name": query,
                        "longitude": float(coords[0]),
                        "latitude": float(coords[1]),
                        "status": "live"
                    }
        elif resp.status_code == 403:
            logger.warning(f"ORS geocoding returned 403 Forbidden for '{query}'. Account access disallowed.")
        else:
            logger.warning(f"ORS geocoding returned status {resp.status_code} for '{query}'")
    except Exception as e:
        logger.warning(f"ORS geocoding error for '{query}': {e}")

    return {
        "name": query,
        "latitude": None,
        "longitude": None,
        "status": "unavailable",
        "error": "ORS geocode unavailable"
    }

def get_route(start_coords: list, end_coords: list, profile: str = "driving-car") -> dict:
    """
    Queries OpenRouteService / HeiGIT API for road directions.
    start_coords: [lon, lat]
    end_coords: [lon, lat]
    profile: 'driving-car' (or 'cycling-regular', 'foot-walking')
    
    Returns normalized:
        {
            "distance_km": float,
            "duration_minutes": int,
            "route": list of [lon, lat],
            "status": "live" | "unavailable",
            "source": "openrouteservice"
        }
    """
    key = get_ors_api_key()
    if not key:
        return {
            "distance_km": None,
            "duration_minutes": None,
            "route": [],
            "status": "unavailable",
            "source": "openrouteservice",
            "error": "ORS_API_KEY is not configured"
        }

    if not start_coords or not end_coords or len(start_coords) < 2 or len(end_coords) < 2:
        return {
            "distance_km": None,
            "duration_minutes": None,
            "route": [],
            "status": "unavailable",
            "source": "openrouteservice",
            "error": "Invalid coordinates provided"
        }

    url = f"{ORS_BASE_URL}/v2/directions/{profile}"
    headers = {
        "Authorization": key,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    body = {
        "coordinates": [
            [float(start_coords[0]), float(start_coords[1])],
            [float(end_coords[0]), float(end_coords[1])],
        ]
    }

    try:
        resp = requests.post(url, json=body, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS)
        if resp.status_code == 200:
            data = resp.json()
            routes = data.get("routes", [])
            if routes:
                route_data = routes[0]
                summary = route_data.get("summary", {})
                distance_meters = summary.get("distance", 0)
                duration_secs = summary.get("duration", 0)

                distance_km = round(distance_meters / 1000.0, 1)
                duration_mins = round(duration_secs / 60.0)

                geometry = route_data.get("geometry", "")

                return {
                    "distance_km": distance_km,
                    "duration_minutes": duration_mins,
                    "route": geometry,
                    "status": "live",
                    "source": "openrouteservice"
                }
        elif resp.status_code == 403:
            logger.warning(f"ORS directions returned 403: {resp.text[:120]}")
            return {
                "distance_km": None,
                "duration_minutes": None,
                "route": [],
                "status": "unavailable",
                "source": "openrouteservice",
                "error": "Access to ORS API disallowed (403)"
            }
        else:
            logger.warning(f"ORS directions HTTP {resp.status_code}: {resp.text[:120]}")
            return {
                "distance_km": None,
                "duration_minutes": None,
                "route": [],
                "status": "unavailable",
                "source": "openrouteservice",
                "error": f"ORS returned HTTP {resp.status_code}"
            }
    except Exception as e:
        logger.error(f"Error calling HeiGIT ORS directions: {e}")
        return {
            "distance_km": None,
            "duration_minutes": None,
            "route": [],
            "status": "unavailable",
            "source": "openrouteservice",
            "error": str(e)
        }

def calculate_distance(start_coords: list, end_coords: list) -> dict:
    """
    Convenience wrapper returning distance and duration between two points.
    """
    return get_route(start_coords, end_coords, profile="driving-car")
