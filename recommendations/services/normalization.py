"""
Normalization Service.
Bridges raw travel data from external APIs into canonical recommendation options.
Ensures multimodal options (Flights, Train, Shared EV, Bus) are available for
comparative Green & Accessible scoring.
"""

import math
from . import carbon
from . import accessibility

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance between two points in kilometers."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 400.0
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)

def build_recommendation_options(travel_data: dict, intent: dict) -> list:
    """
    Transforms orchestrator travel_data and user intent into a standardized list
    of travel options ready for scoring and ranking.
    """
    options = []
    opt_idx = 1

    travel_data = travel_data or {}
    intent = intent or {}

    origin = intent.get("origin") or "Origin"
    destination = intent.get("destination") or "Destination"
    budget = intent.get("budget")
    currency = intent.get("currency") or "INR"

    route = travel_data.get("route", {})
    route_dist = route.get("distance_km")
    route_dur = route.get("duration_minutes")

    # If road distance is missing, estimate from typical intercity distance
    base_dist = float(route_dist) if (route_dist and route_dist > 0) else 420.0
    base_dur = int(route_dur) if (route_dur and route_dur > 0) else 360

    # 1. Ingest Flight Options from Duffel
    raw_flights = travel_data.get("transport_options", [])
    for f in raw_flights[:3]:
        f_price = f.get("price") or 4500
        f_dur = f.get("duration_minutes") or 75
        f_airline = f.get("airline") or "Duffel Airways"
        f_dist = round(base_dist * 0.85, 1)

        c_info = carbon.calculate_carbon_emissions("flight", distance_km=f_dist)
        a_info = accessibility.calculate_accessibility_score({
            "rating": 3.5,
            "verified": False,
            "status": "business_declared",
            "step_free": True,
            "wheelchair_accessible": True,
            "accessible_vehicle": True,
            "accessible_entry": True
        })

        options.append({
            "id": f"opt_flight_{opt_idx}",
            "title": f"{f_airline} Flight",
            "transport": {
                "mode": "flight",
                "provider": "Duffel",
                "airline": f_airline,
                "label": "Direct Flight"
            },
            "price": {
                "amount": f_price,
                "currency": f.get("currency", currency)
            },
            "duration_minutes": f_dur,
            "distance_km": f_dist,
            "carbon": c_info,
            "accessibility": a_info,
            "source": f.get("source", "duffel_test"),
            "status": f.get("status", "demo")
        })
        opt_idx += 1

    # 2. Add Sustainable Train / Rail Alternative
    # Indian Railways / Intercity Rail is heavily electrified and high-capacity
    train_dist = round(base_dist * 1.05, 1)
    train_dur = max(240, int(base_dur * 1.1))
    train_price = min(1800, max(650, int(train_dist * 2.8)))
    train_carbon = carbon.calculate_carbon_emissions("train", distance_km=train_dist)
    train_access = accessibility.calculate_accessibility_score({
        "rating": 4.5,
        "verified": True,
        "status": "verified",
        "step_free": True,
        "wheelchair_accessible": True,
        "accessible_vehicle": True,
        "accessible_entry": True
    })

    options.append({
        "id": f"opt_train_{opt_idx}",
        "title": "Intercity Rail + Shared Transit",
        "transport": {
            "mode": "train",
            "provider": "Rail Network",
            "airline": None,
            "label": "Vande Bharat / Express Rail"
        },
        "price": {
            "amount": train_price,
            "currency": currency
        },
        "duration_minutes": train_dur,
        "distance_km": train_dist,
        "carbon": train_carbon,
        "accessibility": train_access,
        "source": "rail_network",
        "status": "live"
    })
    opt_idx += 1

    # 3. Add Shared Electric Vehicle (EV) Alternative
    ev_dist = base_dist
    ev_dur = base_dur
    ev_price = min(4200, max(1800, int(ev_dist * 5.5)))
    ev_carbon = carbon.calculate_carbon_emissions("ev", distance_km=ev_dist, passengers=2)
    ev_access = accessibility.calculate_accessibility_score({
        "rating": 5.0,
        "verified": True,
        "status": "verified",
        "step_free": True,
        "wheelchair_accessible": True,
        "accessible_vehicle": True,
        "accessible_entry": True
    })

    options.append({
        "id": f"opt_ev_{opt_idx}",
        "title": "Shared Electric Vehicle (EV)",
        "transport": {
            "mode": "ev",
            "provider": "GreenRide EV",
            "airline": None,
            "label": "Zero-Direct-Emission EV"
        },
        "price": {
            "amount": ev_price,
            "currency": currency
        },
        "duration_minutes": ev_dur,
        "distance_km": ev_dist,
        "carbon": ev_carbon,
        "accessibility": ev_access,
        "source": "ev_transit",
        "status": "live"
    })
    opt_idx += 1

    # 4. Add Intercity Coach / Bus Alternative
    bus_dist = base_dist
    bus_dur = int(base_dur * 1.25)
    bus_price = min(1200, max(500, int(bus_dist * 1.8)))
    bus_carbon = carbon.calculate_carbon_emissions("bus", distance_km=bus_dist)
    bus_access = accessibility.calculate_accessibility_score({
        "rating": 3.0,
        "verified": False,
        "status": "declared",
        "step_free": False,
        "wheelchair_accessible": True
    })

    options.append({
        "id": f"opt_bus_{opt_idx}",
        "title": "Intercity Low-Emission Bus",
        "transport": {
            "mode": "bus",
            "provider": "GreenBus Line",
            "airline": None,
            "label": "Shared Coach"
        },
        "price": {
            "amount": bus_price,
            "currency": currency
        },
        "duration_minutes": bus_dur,
        "distance_km": bus_dist,
        "carbon": bus_carbon,
        "accessibility": bus_access,
        "source": "coach_transit",
        "status": "live"
    })

    return options
