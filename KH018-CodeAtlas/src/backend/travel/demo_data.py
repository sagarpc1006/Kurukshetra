"""
EcoTrail Curated Demo & Fallback Travel Dataset.
Provides reliable, deterministic fallback data for hackathon demonstrations
covering Pune, Mumbai, Goa, and Bengaluru corridors.

IMPORTANT PRINCIPLE:
All items in this dataset are clearly marked internally with:
    source="demo_fallback", status="demo", is_fallback=True.
Real API data from Duffel, ORS, OSM, OpenTripMap, and OpenWeatherMap
is always preferred whenever available.
"""

import math

DEMO_CITY_COORDINATES = {
    "pune": {"latitude": 18.5204, "longitude": 73.8567, "name": "Pune", "state": "Maharashtra"},
    "mumbai": {"latitude": 19.0760, "longitude": 72.8777, "name": "Mumbai", "state": "Maharashtra"},
    "bombay": {"latitude": 19.0760, "longitude": 72.8777, "name": "Mumbai", "state": "Maharashtra"},
    "goa": {"latitude": 15.2993, "longitude": 74.1240, "name": "Goa", "state": "Goa"},
    "panaji": {"latitude": 15.4909, "longitude": 73.8278, "name": "Goa", "state": "Goa"},
    "bengaluru": {"latitude": 12.9716, "longitude": 77.5946, "name": "Bengaluru", "state": "Karnataka"},
    "bangalore": {"latitude": 12.9716, "longitude": 77.5946, "name": "Bengaluru", "state": "Karnataka"},
}

DEMO_ATTRACTIONS = {
    "goa": [
        {
            "name": "Fort Aguada & Coastal Promontory",
            "category": "Historic Fortress & Coastal Vista",
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_entry": True,
            "evidence": "Paved level ramp leading from parking to lower fortress and lighthouse plaza.",
            "source": "demo_fallback",
            "status": "demo"
        },
        {
            "name": "Basilica of Bom Jesus (UNESCO Heritage)",
            "category": "World Heritage Architecture",
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_entry": True,
            "evidence": "Dedicated step-free ramp at north entrance, wide stone aisles.",
            "source": "demo_fallback",
            "status": "demo"
        },
        {
            "name": "Miramar Beach Accessible Boardwalk",
            "category": "Eco-Preserved Coastline",
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_entry": True,
            "evidence": "All-ability wooden boardwalk extending towards high-tide line.",
            "source": "demo_fallback",
            "status": "demo"
        },
        {
            "name": "Salim Ali Bird Sanctuary & Mangrove Trail",
            "category": "Nature Reserve & Wetland Boardwalk",
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_entry": True,
            "evidence": "Elevated wooden boardwalk through estuarine mangrove ecosystem.",
            "source": "demo_fallback",
            "status": "demo"
        }
    ],
    "pune": [
        {
            "name": "Aga Khan Palace & Memorial Grounds",
            "category": "National Monument & Serene Gardens",
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_entry": True,
            "evidence": "Step-free ramp entry to museum museum halls and expansive paved garden pathways.",
            "source": "demo_fallback",
            "status": "demo"
        },
        {
            "name": "Osho Teerth Eco Botanical Garden",
            "category": "Ecological Restoration Park",
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_entry": True,
            "evidence": "Level paved walking trails amidst treated wetland stream and bamboo groves.",
            "source": "demo_fallback",
            "status": "demo"
        },
        {
            "name": "Shaniwar Wada Heritage Precinct",
            "category": "Historic Maratha Fortification",
            "wheelchair_accessible": False,
            "step_free": False,
            "accessible_entry": False,
            "evidence": "Cobbled threshold with ancient stone risers, step-free access limited to outer perimeter.",
            "source": "demo_fallback",
            "status": "demo"
        }
    ],
    "mumbai": [
        {
            "name": "Gateway of India & Paved Harbor Plaza",
            "category": "Historic Waterfront Landmark",
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_entry": True,
            "evidence": "Continuous level paved promenade with wide entrance gates and curb cuts.",
            "source": "demo_fallback",
            "status": "demo"
        },
        {
            "name": "Marine Drive Sustainable Promenade",
            "category": "Urban Waterfront Paved Walkway",
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_entry": True,
            "evidence": "3.6 km continuous wide paved sidewalk with gentle access ramps at intervals.",
            "source": "demo_fallback",
            "status": "demo"
        },
        {
            "name": "Hanging Gardens & Kamala Nehru Park",
            "category": "Terraced Botanical Viewpoint",
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_entry": True,
            "evidence": "Main pathways paved with mild inclines, accessible public restrooms.",
            "source": "demo_fallback",
            "status": "demo"
        }
    ],
    "bengaluru": [
        {
            "name": "Lalbagh Botanical Garden & Glass House",
            "category": "Historic Botanical Flora Sanctuary",
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_entry": True,
            "evidence": "Electric buggy shuttle service and wide paved walkways throughout the gardens.",
            "source": "demo_fallback",
            "status": "demo"
        },
        {
            "name": "Cubbon Park Sustainable Green Corridor",
            "category": "Urban Green Belt & Heritage Forest",
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_entry": True,
            "evidence": "Car-free pedestrian zones on weekends with level tar pathways and benches.",
            "source": "demo_fallback",
            "status": "demo"
        },
        {
            "name": "Visvesvaraya Science & Innovation Museum",
            "category": "Interactive Science Centre",
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_entry": True,
            "evidence": "Elevators to all floors, step-free tactile pathways, and accessible parking.",
            "source": "demo_fallback",
            "status": "demo"
        }
    ]
}

DEMO_STAYS = {
    "goa": "Wildernest Certified Eco-Cottages (Solar Powered, Step-free)",
    "pune": "The Fern Residency Eco-Certified Hotel (LEED Gold)",
    "mumbai": "ITC Maratha Eco-Responsible Hotel (LEED Platinum)",
    "bengaluru": "The Paul Bengaluru Green Globe Certified Suites",
}

DEMO_CORRIDORS = {
    ("pune", "goa"): {
        "distance_km": 448.0,
        "driving_minutes": 420,
        "flight": {"price": 4500, "duration_minutes": 75, "carbon_kg": 64.3, "airline": "Duffel Airways"},
        "train": {"price": 850, "duration_minutes": 480, "carbon_kg": 14.2, "name": "Vande Bharat Express (Electric)"},
        "shared_ev": {"price": 2310, "duration_minutes": 420, "carbon_kg": 9.4, "name": "Eco-Ride Shared EV Cab"},
        "bus": {"price": 1100, "duration_minutes": 510, "carbon_kg": 28.5, "name": "GreenLine Intercity Electric Bus"},
    },
    ("mumbai", "goa"): {
        "distance_km": 585.0,
        "driving_minutes": 540,
        "flight": {"price": 4800, "duration_minutes": 70, "carbon_kg": 78.5, "airline": "Duffel Airways"},
        "train": {"price": 1050, "duration_minutes": 490, "carbon_kg": 18.6, "name": "Tejas Express (Electric Rail)"},
        "shared_ev": {"price": 2850, "duration_minutes": 540, "carbon_kg": 12.3, "name": "Eco-Fleet Long-Range EV"},
        "bus": {"price": 1350, "duration_minutes": 600, "carbon_kg": 36.2, "name": "Intercity Bio-CNG Sleeper"},
    },
    ("pune", "mumbai"): {
        "distance_km": 150.0,
        "driving_minutes": 180,
        "flight": {"price": 3200, "duration_minutes": 45, "carbon_kg": 28.0, "airline": "Duffel Shuttle"},
        "train": {"price": 260, "duration_minutes": 185, "carbon_kg": 4.8, "name": "Deccan Queen (100% Electric Rail)"},
        "shared_ev": {"price": 850, "duration_minutes": 180, "carbon_kg": 3.1, "name": "Expressway Shared EV Shuttle"},
        "bus": {"price": 380, "duration_minutes": 210, "carbon_kg": 8.5, "name": "MSRTC Shivneri Electric AC Bus"},
    },
    ("bengaluru", "goa"): {
        "distance_km": 560.0,
        "driving_minutes": 570,
        "flight": {"price": 4600, "duration_minutes": 75, "carbon_kg": 75.2, "airline": "Duffel Airways"},
        "train": {"price": 980, "duration_minutes": 660, "carbon_kg": 17.8, "name": "Goa Express Intercity Rail"},
        "shared_ev": {"price": 2700, "duration_minutes": 570, "carbon_kg": 11.8, "name": "Eco-Ride Regional Shared EV"},
        "bus": {"price": 1250, "duration_minutes": 630, "carbon_kg": 34.0, "name": "KSRTC Airavat Multi-Axle EV"},
    }
}

def get_demo_city_geo(city_name: str) -> dict:
    """Returns demo geocoding coordinates for supported cities, or None."""
    if not city_name:
        return None
    key = str(city_name).strip().lower()
    geo = DEMO_CITY_COORDINATES.get(key)
    if geo:
        return {
            "name": geo["name"],
            "latitude": geo["latitude"],
            "longitude": geo["longitude"],
            "state": geo["state"],
            "status": "demo",
            "source": "demo_fallback",
            "is_fallback": True,
        }
    return None

def get_demo_corridor(origin: str, destination: str) -> dict:
    """Finds curated corridor info or computes realistic mathematical distance."""
    o_key = str(origin).strip().lower() if origin else ""
    d_key = str(destination).strip().lower() if destination else ""

    # Check forward and reverse corridors
    corridor = DEMO_CORRIDORS.get((o_key, d_key)) or DEMO_CORRIDORS.get((d_key, o_key))
    if corridor:
        return corridor

    # Compute rough distance from coords if available
    o_geo = DEMO_CITY_COORDINATES.get(o_key)
    d_geo = DEMO_CITY_COORDINATES.get(d_key)
    dist = 420.0
    if o_geo and d_geo:
        R = 6371.0
        dlat = math.radians(d_geo["latitude"] - o_geo["latitude"])
        dlon = math.radians(d_geo["longitude"] - o_geo["longitude"])
        a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(o_geo["latitude"])) * math.cos(math.radians(d_geo["latitude"])) * math.sin(dlon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        dist = round(R * c * 1.25, 1)

    dur = int(dist * 0.95)
    return {
        "distance_km": dist,
        "driving_minutes": max(120, dur),
        "flight": {"price": 4200, "duration_minutes": 75, "carbon_kg": round(dist * 0.14, 1), "airline": "Duffel Airways"},
        "train": {"price": max(450, int(dist * 2.1)), "duration_minutes": int(dur * 1.1), "carbon_kg": round(dist * 0.035, 1), "name": "Intercity Superfast Rail (Electric)"},
        "shared_ev": {"price": max(850, int(dist * 5.2)), "duration_minutes": dur, "carbon_kg": round(dist * 0.021, 1), "name": "Eco-Ride Shared EV Fleet"},
        "bus": {"price": max(350, int(dist * 2.5)), "duration_minutes": int(dur * 1.25), "carbon_kg": round(dist * 0.065, 1), "name": "Eco-Express Intercity Bus"},
    }

def get_demo_places(destination: str) -> list:
    """Returns curated attractions for the destination or default inclusive sights."""
    d_key = str(destination).strip().lower() if destination else ""
    return DEMO_ATTRACTIONS.get(d_key, DEMO_ATTRACTIONS.get("goa"))

def get_demo_stay(destination: str) -> str:
    """Returns curated eco-certified stay for the destination."""
    d_key = str(destination).strip().lower() if destination else ""
    return DEMO_STAYS.get(d_key, "Verified Eco-Certified Homestay & Solar Lodging")
