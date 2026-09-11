import logging
import concurrent.futures
from . import osm
from . import duffel
from . import ors
from . import opentripmap
from . import weather
from . import normalizer
from . import demo_data

logger = logging.getLogger(__name__)

def orchestrate_travel_plan(intent: dict) -> dict:
    """
    Coordinates external travel API integrations based on the extracted user intent.
    Decides which services to call, executes requests with strict timeouts and error handling,
    and returns a unified EcoTrail travel data payload.
    
    If external APIs are unavailable or fail, gracefully falls back to curated demo data
    (clearly marked with status='demo', source='demo_fallback') so the recommendation
    and Eco-Twin engines remain 100% reliable for demonstration.
    """
    if not intent or not isinstance(intent, dict):
        return normalizer.build_empty_travel_data()

    origin = intent.get("origin")
    destination = intent.get("destination")
    duration_days = intent.get("duration_days")
    budget = intent.get("budget")
    currency = intent.get("currency", "INR")
    travel_dates = intent.get("travel_dates")

    # 1. Geocode Origin & Destination via OpenStreetMap / Nominatim with demo fallback
    origin_geo = None
    dest_geo = None

    if origin:
        try:
            origin_geo = osm.geocode_location(origin)
        except Exception as e:
            logger.warning(f"OSM geocoding error for origin '{origin}': {e}")

        # Fallback to curated demo coordinates if OSM failed or returned unavailable
        if not origin_geo or origin_geo.get("status") == "unavailable" or origin_geo.get("latitude") is None:
            demo_o = demo_data.get_demo_city_geo(origin)
            if demo_o:
                logger.info(f"Using demo fallback coordinates for origin '{origin}'")
                origin_geo = demo_o
            elif not origin_geo:
                origin_geo = {"name": origin, "latitude": None, "longitude": None, "status": "unavailable"}

    if destination:
        try:
            dest_geo = osm.geocode_location(destination)
        except Exception as e:
            logger.warning(f"OSM geocoding error for destination '{destination}': {e}")

        # Fallback to curated demo coordinates if OSM failed
        if not dest_geo or dest_geo.get("status") == "unavailable" or dest_geo.get("latitude") is None:
            demo_d = demo_data.get_demo_city_geo(destination)
            if demo_d:
                logger.info(f"Using demo fallback coordinates for destination '{destination}'")
                dest_geo = demo_d
            elif not dest_geo:
                dest_geo = {"name": destination, "latitude": None, "longitude": None, "status": "unavailable"}

    dest_lat = dest_geo.get("latitude") if dest_geo else None
    dest_lon = dest_geo.get("longitude") if dest_geo else None

    # Retrieve curated corridor fallback if needed
    corridor = demo_data.get_demo_corridor(origin, destination) if (origin and destination) else None

    # 2. Parallel workers for external APIs
    def fetch_flights():
        if origin and destination:
            try:
                logger.info(f"Querying Duffel flight search for {origin} -> {destination}")
                res = duffel.search_flights(
                    origin=origin,
                    destination=destination,
                    departure_date=travel_dates,
                    passengers=1,
                    currency=currency
                )
                if res:
                    return res
            except Exception as e:
                logger.warning(f"Duffel flight search failed: {e}")

        # Fallback to curated flight baseline if Duffel is offline or empty
        if corridor and corridor.get("flight"):
            f_demo = corridor["flight"]
            logger.info(f"Using demo fallback flight for {origin} -> {destination}")
            return [{
                "type": "flight",
                "provider": "Duffel",
                "airline": f_demo.get("airline", "Duffel Airways"),
                "origin": origin,
                "destination": destination,
                "price": f_demo["price"],
                "currency": currency,
                "duration_minutes": f_demo["duration_minutes"],
                "source": "demo_fallback",
                "status": "demo",
                "is_fallback": True,
            }]
        return []

    def fetch_route():
        if (origin_geo and origin_geo.get("latitude") is not None and
            dest_geo and dest_geo.get("latitude") is not None):
            try:
                start_coords = [origin_geo["longitude"], origin_geo["latitude"]]
                end_coords = [dest_geo["longitude"], dest_geo["latitude"]]
                logger.info(f"Querying OpenRouteService directions: {origin} -> {destination}")
                route_res = ors.get_route(start_coords, end_coords, profile="driving-car")
                if route_res and route_res.get("distance_km"):
                    return route_res
            except Exception as e:
                logger.warning(f"OpenRouteService routing error: {e}")

        # Fallback to curated corridor distance
        if corridor:
            logger.info(f"Using demo fallback route distance for {origin} -> {destination}")
            return {
                "distance_km": corridor["distance_km"],
                "duration_minutes": corridor["driving_minutes"],
                "route": [],
                "status": "demo",
                "source": "demo_fallback",
                "is_fallback": True,
            }

        return {
            "distance_km": None,
            "duration_minutes": None,
            "route": [],
            "status": "unavailable",
            "source": "openrouteservice",
            "error": "Coordinates unavailable for origin or destination"
        }

    def fetch_places():
        if dest_lat is not None and dest_lon is not None:
            try:
                logger.info(f"Querying OpenTripMap near ({dest_lat}, {dest_lon})")
                places_res = opentripmap.search_places(lat=dest_lat, lon=dest_lon, radius=18000, limit=6)
                if places_res:
                    return places_res
            except Exception as e:
                logger.warning(f"OpenTripMap places error: {e}")

        # Fallback to curated attractions
        demo_pl = demo_data.get_demo_places(destination)
        if demo_pl:
            logger.info(f"Using demo fallback attractions for {destination}")
            return demo_pl
        return []

    def fetch_weather():
        if dest_lat is not None or destination:
            try:
                logger.info(f"Querying OpenWeatherMap for destination '{destination}'")
                w_res = weather.get_destination_weather(
                    lat=dest_lat,
                    lon=dest_lon,
                    city_name=destination
                )
                if w_res and w_res.get("status") == "live":
                    return w_res
            except Exception as e:
                logger.warning(f"OpenWeatherMap weather error: {e}")

        return {
            "temperature": None,
            "condition": "Weather data currently unavailable.",
            "status": "unavailable",
            "source": "openweathermap",
            "message": "Weather data currently unavailable.",
            "forecast": []
        }

    flights = []
    route = {}
    places = []
    weather_data = {}

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_flights = executor.submit(fetch_flights)
        future_route = executor.submit(fetch_route)
        future_places = executor.submit(fetch_places)
        future_weather = executor.submit(fetch_weather)

        try:
            flights = future_flights.result(timeout=10)
        except Exception as ex:
            logger.warning(f"Timeout awaiting flights: {ex}")
            flights = []

        try:
            route = future_route.result(timeout=10)
        except Exception as ex:
            logger.warning(f"Timeout awaiting route: {ex}")
            route = {"status": "unavailable", "source": "openrouteservice", "distance_km": None, "duration_minutes": None, "route": []}

        try:
            places = future_places.result(timeout=10)
        except Exception as ex:
            logger.warning(f"Timeout awaiting places: {ex}")
            places = []

        try:
            weather_data = future_weather.result(timeout=10)
        except Exception as ex:
            logger.warning(f"Timeout awaiting weather: {ex}")
            weather_data = {"status": "unavailable", "source": "openweathermap", "message": "Weather data currently unavailable."}

    # Normalize consolidated data
    normalized_data = normalizer.normalize_travel_payload(
        intent=intent,
        flights=flights,
        route=route,
        places=places,
        weather=weather_data,
        osm_origin=origin_geo,
        osm_destination=dest_geo
    )

    return normalized_data
