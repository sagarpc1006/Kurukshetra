import logging
import math
import time
import requests

logger = logging.getLogger(__name__)

NOMINATIM_SEARCH_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "EcoTrail-TravelApp/1.0 (contact@ecotrail.org)"
REQUEST_TIMEOUT_SECONDS = 7

# In-memory geocode cache to avoid repeated calls to Nominatim
_GEOCODE_CACHE = {}

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two points in kilometers.
    """
    R = 6371.0 # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def geocode_location(location_name: str) -> dict:
    """
    Geocodes a location name using OpenStreetMap Nominatim.
    Returns:
        {
            "name": str,
            "display_name": str,
            "latitude": float,
            "longitude": float,
            "source": "osm_nominatim",
            "status": "live" | "cached" | "unavailable"
        }
    """
    if not location_name or not isinstance(location_name, str):
        return {
            "name": "",
            "display_name": "",
            "latitude": None,
            "longitude": None,
            "source": "osm_nominatim",
            "status": "unavailable"
        }

    clean_name = location_name.strip()
    cache_key = clean_name.lower()

    # Check cache first
    if cache_key in _GEOCODE_CACHE:
        cached_val = _GEOCODE_CACHE[cache_key].copy()
        cached_val["status"] = "cached"
        return cached_val

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
    }
    params = {
        "q": clean_name,
        "format": "json",
        "limit": 1,
        "addressdetails": 1,
    }

    retries = 1
    last_error = None

    for attempt in range(retries + 1):
        try:
            response = requests.get(
                NOMINATIM_SEARCH_URL,
                params=params,
                headers=headers,
                timeout=REQUEST_TIMEOUT_SECONDS
            )

            if response.status_code == 200:
                results = response.json()
                if results and len(results) > 0:
                    first = results[0]
                    lat = float(first.get("lat"))
                    lon = float(first.get("lon"))
                    display_name = first.get("display_name", clean_name)

                    normalized = {
                        "name": clean_name,
                        "display_name": display_name,
                        "latitude": lat,
                        "longitude": lon,
                        "source": "osm_nominatim",
                        "status": "live"
                    }
                    _GEOCODE_CACHE[cache_key] = normalized.copy()
                    return normalized
                else:
                    logger.warning(f"OSM Nominatim returned no results for: {clean_name}")
                    return {
                        "name": clean_name,
                        "display_name": clean_name,
                        "latitude": None,
                        "longitude": None,
                        "source": "osm_nominatim",
                        "status": "unavailable"
                    }
            else:
                logger.warning(f"OSM Nominatim returned HTTP {response.status_code} for {clean_name}")
        except Exception as e:
            last_error = e
            logger.warning(f"OSM Nominatim attempt {attempt + 1} failed: {e}")
            if attempt < retries:
                time.sleep(0.5)

    logger.error(f"OSM Nominatim failed after retries for {clean_name}: {last_error}")
    return {
        "name": clean_name,
        "display_name": clean_name,
        "latitude": None,
        "longitude": None,
        "source": "osm_nominatim",
        "status": "unavailable"
    }
