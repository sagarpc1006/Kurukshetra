import logging

logger = logging.getLogger(__name__)

def build_empty_travel_data() -> dict:
    """
    Returns a blank fallback EcoTrail travel data structure.
    """
    return {
        "transport_options": [],
        "route": {
            "origin": None,
            "destination": None,
            "distance_km": None,
            "duration_minutes": None,
            "status": "unavailable",
            "source": "none"
        },
        "places": [],
        "weather": {
            "temperature": None,
            "condition": "Unavailable",
            "status": "unavailable",
            "source": "none"
        },
        "api_statuses": {
            "duffel": "unavailable",
            "ors": "unavailable",
            "osm": "unavailable",
            "opentripmap": "unavailable",
            "weather": "unavailable"
        }
    }

def normalize_travel_payload(
    intent: dict,
    flights: list = None,
    route: dict = None,
    places: list = None,
    weather: dict = None,
    osm_origin: dict = None,
    osm_destination: dict = None
) -> dict:
    """
    Consolidates data from all travel providers into EcoTrail's canonical structure.
    """
    flights = flights or []
    route = route or {}
    places = places or []
    weather = weather or {}

    origin_name = intent.get("origin") or ""
    dest_name = intent.get("destination") or ""

    # Determine Duffel status
    duffel_status = "unavailable"
    if flights:
        duffel_status = flights[0].get("status", "demo")

    # Determine ORS / Route status
    route_status = route.get("status", "unavailable")
    distance_km = route.get("distance_km")
    duration_mins = route.get("duration_minutes")

    # Determine OpenTripMap status
    places_status = "unavailable"
    if places:
        places_status = places[0].get("status", "live")

    # Determine Weather status
    weather_status = weather.get("status", "unavailable")

    # Determine OSM status
    osm_status = "unavailable"
    if osm_destination and osm_destination.get("status") in ("live", "cached"):
        osm_status = osm_destination.get("status")
    elif osm_origin and osm_origin.get("status") in ("live", "cached"):
        osm_status = osm_origin.get("status")

    api_statuses = {
        "duffel": duffel_status,
        "ors": route_status,
        "osm": osm_status,
        "opentripmap": places_status,
        "weather": weather_status
    }

    normalized_route = {
        "origin": origin_name,
        "destination": dest_name,
        "distance_km": distance_km,
        "duration_minutes": duration_mins,
        "status": route_status,
        "source": route.get("source", "openrouteservice"),
        "error": route.get("error") if route_status == "unavailable" else None
    }

    return {
        "transport_options": flights,
        "route": normalized_route,
        "places": places,
        "weather": weather,
        "api_statuses": api_statuses
    }
