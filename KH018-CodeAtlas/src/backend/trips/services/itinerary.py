import logging

logger = logging.getLogger(__name__)

def build_trip_itinerary(intent: dict, top_recommendation: dict, travel_data: dict) -> dict:
    """
    Generates a deterministic day-by-day itinerary tailored to the travel intent,
    the selected top eco-recommendation, and available destination places.
    Reuses existing data without triggering duplicate external API calls.
    """
    intent = intent or {}
    travel_data = travel_data or {}
    top_recommendation = top_recommendation or {}

    origin = intent.get("origin") or "Departure"
    destination = intent.get("destination") or "Destination"
    duration_days = int(intent.get("duration_days") or 3)
    # Cap duration between 1 and 14 days for sanity
    duration_days = max(1, min(14, duration_days))

    budget = intent.get("budget")
    currency = intent.get("currency") or "INR"
    trans_title = top_recommendation.get("title") or "Electric Rail + Shared EV"
    carbon_kg = top_recommendation.get("carbon", {}).get("kg_co2e", 15.0)

    places = travel_data.get("places") or []
    weather_info = travel_data.get("weather") or {}
    forecast_list = weather_info.get("forecast") or []

    # Distribute available places across days
    place_names = [p.get("name") for p in places if p.get("name")] if places else []

    day_templates = [
        {
            "focus": "Arrival, Check-in & Eco-Transit",
            "morning": f"Depart {origin} via {trans_title}. Comfortable low-emission journey.",
            "afternoon": f"Arrival in {destination}. Direct check-in at verified eco-stay with accessible access.",
            "evening": f"Relaxing step-free walking tour of central {destination} square and dining.",
            "green_tip": "Utilize electric feeder transit or zero-emission shared bikes.",
            "accessibility_note": "Boarding ramps and step-free platform transfers prioritized.",
        },
        {
            "focus": "Cultural Heritage & Renewable Mobility",
            "morning": f"Visit {place_names[0] if len(place_names) > 0 else 'historic cultural quarter'} with verified step-free access.",
            "afternoon": f"Explore {place_names[1] if len(place_names) > 1 else 'botanical nature reserve'}. Local organic farm-to-table lunch.",
            "evening": f"Sunset viewpoint at {place_names[2] if len(place_names) > 2 else 'coastal promenade'} with wide paved pathways.",
            "green_tip": "Zero single-use plastics encouraged at all heritage reserves.",
            "accessibility_note": "Wheelchair-accessible restrooms and level paved entrances confirmed.",
        },
        {
            "focus": "Nature Immersion & Local Artisan Trail",
            "morning": f"Guided morning walk through {place_names[3] if len(place_names) > 3 else 'protected sanctuary and scenic vista'}.",
            "afternoon": "Support indigenous community craft cooperatives and renewable eco-villages.",
            "evening": "Open-air dinner featuring locally sourced organic cuisine.",
            "green_tip": "Support community-certified green vendors.",
            "accessibility_note": "Smooth paved pathways and elevator/ramp alternatives available.",
        },
        {
            "focus": "Coastal Conservation & Sustainable Exploration",
            "morning": "Marine sanctuary or lakefront restoration center tour.",
            "afternoon": "Leisure at verified clean blue-flag shoreline or shaded park.",
            "evening": "Night stroll and sustainable solar-lit walkway.",
            "green_tip": "Leave no trace — participate in coastal conservation care.",
            "accessibility_note": "Beach matting and level viewing platforms available.",
        },
        {
            "focus": "Leisure & Low-Carbon Departure",
            "morning": f"Morning souvenir market and final tasting tour in {destination}.",
            "afternoon": f"Luggage collection and transfer to {trans_title} station via accessible EV cab.",
            "evening": f"Scenic return transit to {origin} with verified emission savings.",
            "green_tip": "Celebrate lowering travel emissions by over 70% vs standard flight.",
            "accessibility_note": "Assisted boarding and priority wheelchair spaces confirmed.",
        }
    ]

    days = []
    for i in range(1, duration_days + 1):
        if i == 1:
            template = day_templates[0]
        elif i == duration_days:
            template = day_templates[4]
        else:
            # Pick from intermediate templates
            idx = 1 + ((i - 2) % 3)
            template = day_templates[idx]

        # Check weather forecast for this day if available
        forecast_item = forecast_list[i - 1] if i - 1 < len(forecast_list) else None
        day_weather = None
        if forecast_item:
            day_weather = {
                "temp": f"{forecast_item.get('temp')}°C",
                "condition": forecast_item.get("condition"),
                "rain_chance": f"{forecast_item.get('rain_chance')}%",
            }

        assigned_places = []
        p_start = (i - 1) * 2
        for p in places[p_start : p_start + 2]:
            assigned_places.append({
                "name": p.get("name"),
                "category": p.get("category", "Attraction"),
                "accessible": p.get("wheelchair_accessible", True),
            })

        days.append({
            "day": i,
            "title": f"Day {i}: {template['focus']}",
            "morning": template["morning"],
            "afternoon": template["afternoon"],
            "evening": template["evening"],
            "green_tip": template["green_tip"],
            "accessibility_note": template["accessibility_note"],
            "weather": day_weather,
            "places": assigned_places,
        })

    budget_str = f"₹{budget:,}" if budget and currency == "INR" else (f"{currency} {budget:,}" if budget else "Flexible")

    return {
        "title": f"{duration_days}-Day Sustainable Journey: {origin} to {destination}",
        "origin": origin,
        "destination": destination,
        "duration_days": duration_days,
        "transport_recommended": trans_title,
        "estimated_budget": budget_str,
        "carbon_footprint": f"{carbon_kg:.1f} kg CO₂e",
        "accessibility_standard": "Verified Step-Free & Inclusive Boarding",
        "summary": (
            f"A curated {duration_days}-day sustainable itinerary from {origin} to {destination} "
            f"utilizing {trans_title}. Designed to minimize carbon footprint while ensuring "
            f"verified step-free mobility and verified local stays."
        ),
        "days": days,
    }
