import logging
from ai.gemini import extract_travel_intent
from travel.orchestrator import orchestrate_travel_plan
from recommendations.services.ranking import rank_travel_options
from recommendations.services.ecotwin import generate_eco_twin
from trips.services.itinerary import build_trip_itinerary
from .serializers import TravelIntentSerializer

logger = logging.getLogger(__name__)

def process_chat_message(message: str, user=None) -> dict:
    """
    Coordinates chat message processing:
    1. Extracts structured intent via Gemini AI layer (with Groq and deterministic fallbacks).
    2. Validates and normalizes structured travel intent.
    3. Merges authenticated traveler's preferences & AccessibilityProfile from PostgreSQL.
    4. Invokes Travel Orchestrator to query real external APIs (Duffel, ORS, OSM, OpenTripMap, OpenWeatherMap) with demo fallback.
    5. Invokes Recommendation Engine to calculate Green & Accessible Scores and rank options.
    6. Invokes Eco-Twin Comparison Engine to identify the best sustainable alternative.
    7. Generates structured day-by-day Itinerary reusing aggregated data.
    8. Formats composite response payload conforming strictly to EcoTrail response contract.
    """
    gemini_result = extract_travel_intent(message)

    if not gemini_result.get("success"):
        return {
            "success": False,
            "message": gemini_result.get("error", "The AI service is temporarily unavailable. Please try again."),
        }

    raw_intent = gemini_result.get("intent", {})
    serializer = TravelIntentSerializer(data=raw_intent)

    if serializer.is_valid():
        validated_intent = serializer.validated_data
    else:
        logger.warning(f"Intent validation errors: {serializer.errors}. Using raw intent fallback.")
        validated_intent = raw_intent

    # Step 7: Merge authenticated traveler's UserProfile travel preferences
    if user and getattr(user, 'is_authenticated', False):
        if hasattr(user, 'home_city') and user.home_city and not validated_intent.get('origin'):
            validated_intent['origin'] = user.home_city
        if hasattr(user, 'preferred_currency') and user.preferred_currency and not validated_intent.get('currency'):
            validated_intent['currency'] = user.preferred_currency
        if hasattr(user, 'budget_preference') and user.budget_preference and not validated_intent.get('budget'):
            validated_intent['budget'] = user.budget_preference
        if hasattr(user, 'preferred_transport') and user.preferred_transport and not validated_intent.get('transport_preference'):
            validated_intent['transport_preference'] = user.preferred_transport

    # Step 5 & 7: Merge traveler's AccessibilityProfile preferences from PostgreSQL
    try:
        from accessibility.models import AccessibilityProfile
        user_prof = None
        if user and getattr(user, 'is_authenticated', False) and hasattr(user, 'firebase_uid'):
            user_prof = AccessibilityProfile.objects.filter(user=user).first()
        if not user_prof:
            user_prof = AccessibilityProfile.objects.filter(client_id="default_traveler").first()

        if user_prof:
            if user_prof.wheelchair_required:
                validated_intent["wheelchair_required"] = True
                validated_intent["accessibility_required"] = True
            if user_prof.step_free_required:
                validated_intent["step_free_required"] = True
                validated_intent["accessibility_required"] = True
            if user_prof.accessible_vehicle_required:
                validated_intent["accessible_vehicle_required"] = True
            if user_prof.accessible_venue_required:
                validated_intent["accessible_venue_required"] = True
            if user_prof.accessible_toilet_preferred:
                validated_intent["accessible_toilet_preferred"] = True
            if user_prof.elevator_preferred:
                validated_intent["elevator_preferred"] = True
            if user_prof.reduced_walking:
                validated_intent["reduced_walking"] = True
    except Exception as e:
        logger.debug(f"AccessibilityProfile load skipped: {e}")

    # 1. Query external travel APIs via orchestrator (with demo fallbacks)
    travel_data = orchestrate_travel_plan(validated_intent)

    # 2. Run deterministic Recommendation Engine (Scoring & Ranking)
    recommendations = rank_travel_options(travel_data, validated_intent)
    results_list = recommendations.get("results", [])
    weights = recommendations.get("weights")

    # 3. Run deterministic Eco-Twin Alternative Comparison Engine
    eco_twin = generate_eco_twin(results_list, validated_intent, weights)

    # 4. Generate deterministic day-by-day Itinerary
    top_option = results_list[0] if results_list else {}
    itinerary = build_trip_itinerary(validated_intent, top_option, travel_data)

    # 5. Extract top option's Show Your Math breakdown
    top_show_your_math = top_option.get("show_your_math", {})

    origin = validated_intent.get("origin")
    destination = validated_intent.get("destination")
    if origin and destination:
        confirm_msg = f"Found travel options from {origin} to {destination}."
    elif destination:
        confirm_msg = f"Found travel options for {destination}."
    else:
        confirm_msg = "I understood your travel request."

    return {
        "success": True,
        "message": confirm_msg,
        "intent": validated_intent,
        "travel_data": travel_data,
        "recommendations": recommendations,
        "eco_twin": eco_twin,
        "itinerary": itinerary,
        "show_your_math": top_show_your_math,
    }
