import os
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

OPENTRIPMAP_BASE_URL = "https://api.opentripmap.com/0.1/en/places"
REQUEST_TIMEOUT_SECONDS = 7

def get_opentripmap_api_key() -> str:
    key = getattr(settings, 'OPENTRIPMAP_API_KEY', None) or os.getenv('OPENTRIPMAP_API_KEY')
    return key.strip() if key else ""

def get_place_details(xid: str) -> dict:
    """
    Retrieves rich metadata (description, wiki extracts, preview image) for a place by xid.
    """
    key = get_opentripmap_api_key()
    if not key or not xid:
        return {}

    url = f"{OPENTRIPMAP_BASE_URL}/xid/{xid}"
    params = {"apikey": key}

    try:
        resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
        if resp.status_code == 200:
            return resp.json()
    except Exception as e:
        logger.warning(f"Error fetching OpenTripMap details for xid {xid}: {e}")

    return {}

def search_places(lat: float, lon: float, radius: int = 15000, limit: int = 6) -> list:
    """
    Searches for tourist attractions, cultural sites, and historic landmarks around coordinates.
    Enriches top places with descriptions and photos if available.
    
    Returns:
        list of normalized place dicts:
        [
            {
                "name": str,
                "latitude": float,
                "longitude": float,
                "category": str,
                "description": str,
                "image_url": str or None,
                "kinds": str,
                "source": "opentripmap",
                "status": "live"
            }
        ]
    """
    key = get_opentripmap_api_key()
    if not key:
        logger.error("OPENTRIPMAP_API_KEY is not configured.")
        return []

    if lat is None or lon is None:
        return []

    url = f"{OPENTRIPMAP_BASE_URL}/radius"
    params = {
        "radius": radius,
        "lon": float(lon),
        "lat": float(lat),
        "kinds": "interesting_places,cultural,historic,natural,tourist_facilities",
        "rate": 2, # Rate 2 or 3 ensures verified, noteworthy places
        "format": "json",
        "limit": limit * 2, # Fetch extra to filter unnamed places
        "apikey": key,
    }

    try:
        resp = requests.get(url, params=params, timeout=REQUEST_TIMEOUT_SECONDS)
        if resp.status_code != 200:
            logger.warning(f"OpenTripMap radius query returned HTTP {resp.status_code}: {resp.text[:120]}")
            return []

        raw_places = resp.json()
        if not isinstance(raw_places, list):
            return []

        normalized_places = []
        for p in raw_places:
            name = p.get("name")
            # Skip empty or untitled entries
            if not name or not name.strip():
                continue

            point = p.get("point", {})
            place_lat = point.get("lat")
            place_lon = point.get("lon")
            xid = p.get("xid")
            kinds = p.get("kinds", "attraction")

            # Simple category detection
            category = "Attraction"
            if "historic" in kinds or "heritage" in kinds:
                category = "Historic Site"
            elif "cultural" in kinds or "museums" in kinds:
                category = "Culture & Art"
            elif "natural" in kinds or "beaches" in kinds:
                category = "Nature & Scenic"
            elif "religion" in kinds:
                category = "Heritage & Sacred"

            description = ""
            image_url = None

            # Fetch details for top 4 places to keep response fast
            if len(normalized_places) < 4 and xid:
                details = get_place_details(xid)
                wiki_extract = details.get("wikipedia_extracts", {})
                description = wiki_extract.get("text", "")
                preview = details.get("preview", {})
                image_url = preview.get("source")

            if not description:
                description = f"Popular {category.lower()} situated in the destination region."

            # Truncate long descriptions cleanly
            if len(description) > 200:
                description = description[:197] + "..."

            normalized_places.append({
                "name": name.strip(),
                "latitude": place_lat,
                "longitude": place_lon,
                "category": category,
                "description": description,
                "image_url": image_url,
                "kinds": kinds,
                "source": "opentripmap",
                "status": "live"
            })

            if len(normalized_places) >= limit:
                break

        return normalized_places

    except Exception as e:
        logger.error(f"Error querying OpenTripMap: {e}")
        return []
