import os
import re
import datetime
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

DUFFEL_API_URL = "https://api.duffel.com"
DUFFEL_VERSION = "v2"
REQUEST_TIMEOUT_SECONDS = 9

# Common airport IATA mapping for reliable lookups
COMMON_IATA_MAP = {
    "pune": "PNQ",
    "goa": "GOI",
    "panaji": "GOI",
    "mumbai": "BOM",
    "bombay": "BOM",
    "delhi": "DEL",
    "new delhi": "DEL",
    "bangalore": "BLR",
    "bengaluru": "BLR",
    "hyderabad": "HYD",
    "chennai": "MAA",
    "madras": "MAA",
    "kolkata": "CCU",
    "calcutta": "CCU",
    "jaipur": "JAI",
    "ahmedabad": "AMD",
    "kochi": "COK",
    "cochin": "COK",
    "london": "LHR",
    "dubai": "DXB",
    "singapore": "SIN",
    "new york": "JFK",
    "paris": "CDG",
}

def parse_iso8601_duration(duration_str: str) -> int:
    """
    Parses ISO 8601 duration string like 'PT1H15M' or 'PT75M' into total minutes.
    """
    if not duration_str or not isinstance(duration_str, str):
        return 0
    pattern = re.compile(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?')
    match = pattern.match(duration_str)
    if not match:
        return 0
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    return hours * 60 + minutes

def resolve_iata_code(city_or_airport: str, token: str) -> str:
    """
    Resolves a city name to an IATA code using dictionary lookup or Duffel places suggestion API.
    """
    if not city_or_airport:
        return None

    clean = city_or_airport.strip().lower()
    if clean in COMMON_IATA_MAP:
        return COMMON_IATA_MAP[clean]

    # If it's already a 3-letter uppercase IATA code
    if len(city_or_airport.strip()) == 3 and city_or_airport.strip().isalpha():
        return city_or_airport.strip().upper()

    # Query Duffel suggestions
    headers = {
        "Authorization": f"Bearer {token}",
        "Duffel-Version": DUFFEL_VERSION,
        "Accept": "application/json",
    }
    try:
        url = f"{DUFFEL_API_URL}/places/suggestions"
        resp = requests.get(url, params={"query": clean}, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json().get("data", [])
            if data:
                # Prefer Indian or matching country airport if available
                for place in data:
                    iata = place.get("iata_code")
                    if iata:
                        return iata
    except Exception as e:
        logger.warning(f"Error resolving IATA code for '{city_or_airport}': {e}")

    return None

def search_flights(origin: str, destination: str, departure_date: str = None, passengers: int = 1, currency: str = "INR") -> list:
    """
    Searches for flight offers via the Duffel Test API.
    Normalizes the response into EcoTrail's internal flight format.
    
    Returns:
        list of normalized flight dicts:
        [
            {
                "type": "flight",
                "provider": "Duffel",
                "airline": "Duffel Airways",
                "origin": "Pune",
                "destination": "Goa",
                "origin_iata": "PNQ",
                "destination_iata": "GOI",
                "price": 4500,
                "currency": "INR",
                "duration_minutes": 75,
                "source": "duffel_test",
                "status": "demo",
                "slices": [...]
            }
        ]
    """
    token = getattr(settings, 'DUFFEL_API_TOKEN', None) or os.getenv('DUFFEL_API_TOKEN')
    if not token or not token.strip():
        logger.error("DUFFEL_API_TOKEN is not configured in Django environment.")
        return []

    token = token.strip()
    origin_iata = resolve_iata_code(origin, token)
    dest_iata = resolve_iata_code(destination, token)

    if not origin_iata or not dest_iata:
        logger.warning(f"Could not resolve IATA codes for {origin} -> {destination}")
        return []

    if origin_iata == dest_iata:
        logger.info(f"Origin and destination IATA codes are identical ({origin_iata}). Skipping flight search.")
        return []

    # If no departure date provided or in past, use date 14 days ahead
    if not departure_date:
        flight_date = (datetime.date.today() + datetime.timedelta(days=14)).isoformat()
    else:
        # Validate or normalize date string
        try:
            datetime.date.fromisoformat(departure_date)
            flight_date = departure_date
        except ValueError:
            flight_date = (datetime.date.today() + datetime.timedelta(days=14)).isoformat()

    payload = {
        "data": {
            "slices": [
                {
                    "origin": origin_iata,
                    "destination": dest_iata,
                    "departure_date": flight_date
                }
            ],
            "passengers": [{"type": "adult"} for _ in range(max(1, min(passengers, 4)))],
            "cabin_class": "economy"
        }
    }

    headers = {
        "Authorization": f"Bearer {token}",
        "Duffel-Version": DUFFEL_VERSION,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    retries = 1
    offers_raw = []

    for attempt in range(retries + 1):
        try:
            url = f"{DUFFEL_API_URL}/air/offer_requests?return_offers=true"
            resp = requests.post(url, json=payload, headers=headers, timeout=REQUEST_TIMEOUT_SECONDS)
            if resp.status_code in (200, 201):
                data = resp.json()
                offers_raw = data.get("data", {}).get("offers", [])
                break
            else:
                logger.warning(f"Duffel API returned HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            logger.warning(f"Duffel API attempt {attempt + 1} failed: {e}")
            if attempt < retries:
                datetime.time.sleep(0.5) if hasattr(datetime.time, 'sleep') else None

    if not offers_raw:
        logger.warning(f"No Duffel flight offers retrieved for {origin_iata} -> {dest_iata}")
        return []

    normalized_flights = []
    for offer in offers_raw[:5]: # Take top 5 options
        try:
            raw_amount = float(offer.get("total_amount", 0))
            raw_curr = offer.get("total_currency", "EUR")
            owner_name = offer.get("owner", {}).get("name", "Duffel Test Airline")

            slices = offer.get("slices", [])
            duration_mins = 0
            if slices:
                first_slice = slices[0]
                iso_dur = first_slice.get("duration", "")
                duration_mins = parse_iso8601_duration(iso_dur)

            # Approximate conversion if Duffel test returns EUR or USD to INR
            # (Rough conversion for test display consistency with user budget)
            display_price = raw_amount
            display_currency = raw_curr
            if currency.upper() == "INR" and raw_curr.upper() in ("EUR", "USD", "GBP"):
                rate = 92.0 if raw_curr.upper() == "EUR" else 85.0
                display_price = round(raw_amount * rate)
                display_currency = "INR"

            normalized_flights.append({
                "type": "flight",
                "provider": "Duffel",
                "airline": owner_name,
                "origin": origin,
                "destination": destination,
                "origin_iata": origin_iata,
                "destination_iata": dest_iata,
                "price": display_price,
                "currency": display_currency,
                "duration_minutes": duration_mins if duration_mins > 0 else 75,
                "source": "duffel_test",
                "status": "demo",
            })
        except Exception as ex:
            logger.warning(f"Error normalizing single Duffel offer: {ex}")
            continue

    return normalized_flights
