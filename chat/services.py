import os
import json
import logging
from django.conf import settings
from google import genai
from ai.gemini import extract_travel_intent
from travel.orchestrator import orchestrate_travel_plan
from recommendations.services.ranking import rank_travel_options
from recommendations.services.ecotwin import generate_eco_twin
from trips.services.itinerary import build_trip_itinerary
from .serializers import TravelIntentSerializer
from .official_links import resolve_official_links

logger = logging.getLogger(__name__)


def generate_realtime_chat_response(
    message: str,
    intent: dict,
    travel_data: dict,
    recommendations: dict,
    eco_twin: dict,
    official_links: list
) -> str:
    """
    Calls Gemini AI in real time to generate an intelligent, personalized conversational response
    specifically tailored to the user's prompt, highlighting low-emission choices and citing
    verified official government websites and direct booking portals.
    Falls back gracefully to a deterministic factual response if external AI is unavailable.
    """
    origin = intent.get("origin") or "your starting location"
    dest = intent.get("destination") or "your destination"
    budget = intent.get("budget")
    currency = intent.get("currency") or "INR"
    duration = intent.get("duration_days") or 3

    top_option = (recommendations.get("results") or [{}])[0]
    top_title = top_option.get("title", "Low-Emission Rail Transit")
    top_co2 = top_option.get("carbon", {}).get("kg_co2e", "minimal")
    top_score = top_option.get("green_accessible_score", 92)

    packages = [l for l in official_links if l.get('is_package')]
    packages_summary = "\n".join([
        f"- {p['name']} ({p['url']}): {p.get('description', '')}"
        for p in packages
    ])
    other_links = [l for l in official_links if not l.get('is_package')]
    links_summary = "\n".join([
        f"- {l['name']} ({l['url']}): {l.get('description', '')}"
        for l in other_links
    ])

    pkg_names_str = ", ".join([f"[{p['name']}]({p['url']})" for p in packages]) if packages else ""

    prompt = f"""
You are EcoTrail AI, a real-time, highly knowledgeable sustainable travel assistant.
The traveler just asked: "{message}"

Trip Context:
- Route: {origin} to {dest} ({duration} days)
- Budget: {f'{currency} {budget}' if budget else 'Flexible'}
- Top Recommended Option: {top_title} ({top_co2} kg CO2e, Eco Score: {top_score}/100)
- Eco-Twin Alternative: {eco_twin.get('comparison', {}).get('carbon_saved_percent', 0)}% lower emissions than baseline

AUTHENTIC OFFICIAL GOVERNMENT PACKAGES AVAILABLE FOR DIRECT ACCESS:
{packages_summary if packages_summary else "- IRCTC Official Tourism Packages (https://www.irctctourism.com): Direct national rail and holiday packages."}

VERIFIED OFFICIAL TRANSIT & TOURISM PORTALS:
{links_summary}

Instructions:
1. Provide a genuine, real-time, helpful conversational response to the traveler answering what they typed.
2. CRITICAL REQUIREMENT - DIRECT OFFICIAL PACKAGE CITATION:
   If official packages or pilgrimage darshan packages are available (listed above, e.g. {pkg_names_str or "IRCTC Tourism Packages"}), EXPLICITLY recommend that particular official package! State the exact package name, provide the clickable markdown link [Package Name](url), and explain what the official package covers (confirmed train travel, official state guest house/hotel stay, authorized local transfers, confirmed entry/darshan tokens with NO middleman markups).
3. Recommend low-emission transit options (such as electric rail / Vande Bharat, Konkan Railway, verified state electric buses, cycling, walking tours).
4. Explicitly cite the verified official websites provided above with markdown links [Name](url) (especially IRCTC at https://www.irctc.co.in and the official state package portals) so the traveler knows how to verify real schedules and book directly with zero intermediary markup.
5. If relevant, offer practical tips: verified green homestays, local culinary gems, zero-waste practices, or accessibility accommodations.
6. Format your response cleanly using concise paragraphs or bullet points in markdown. Do NOT wrap the entire response in json code blocks.
"""

    api_key = getattr(settings, 'GEMINI_API_KEY', None) or os.getenv('GEMINI_API_KEY')
    if api_key and api_key.strip():
        try:
            client = genai.Client(api_key=api_key.strip())
            candidate_models = ["gemini-3.5-flash-lite", "gemini-flash-latest"]
            for model_name in candidate_models:
                try:
                    resp = client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    text = resp.text
                    if text and len(text.strip()) > 40:
                        return text.strip()
                except Exception as ex:
                    logger.warning(f"Live chat response generation with {model_name} failed: {ex}")
                    continue
        except Exception as e:
            logger.warning(f"Gemini client setup error in chat response: {e}")

    # High-quality deterministic fallback
    pkg_section = ""
    if packages:
        top_pkg = packages[0]
        pkg_section = (
            f"**Official Tour Package Access:**\n"
            f"For genuine government-regulated rates, confirmed lodging, and authorized local transfers with zero agent commissions, "
            f"you can directly access the **[{top_pkg['name']}]({top_pkg['url']})**.\n\n"
        )

    portal_names = ", ".join([f"[{l['name']}]({l['url']})" for l in official_links[:3]])
    return (
        f"Here is your personalized real-time travel plan for **{dest}** from **{origin}**.\n\n"
        f"We recommend **{top_title}**, achieving an outstanding Green & Accessible Score of **{top_score}/100** "
        f"with only **{top_co2} kg CO₂e** in carbon emissions.\n\n"
        f"{pkg_section}"
        f"For verified ticket reservations at official government prices with zero hidden markups, "
        f"we have provided direct access links below: {portal_names}."
    )


def handle_general_travel_chat(message: str, user=None) -> dict:
    """
    Handles general travel inquiries, greetings, FAQs, or queries without a specific destination.
    Generates a live real-time response citing official national transit & tourism portals.
    """
    official_links = resolve_official_links(destination="", origin="", user_query=message)
    packages = [l for l in official_links if l.get('is_package')]
    packages_summary = "\n".join([
        f"- {p['name']} ({p['url']}): {p.get('description', '')}"
        for p in packages
    ])
    other_links = [l for l in official_links if not l.get('is_package')]
    links_summary = "\n".join([
        f"- {l['name']} ({l['url']}): {l.get('description', '')}"
        for l in other_links
    ])

    pkg_names_str = ", ".join([f"[{p['name']}]({p['url']})" for p in packages]) if packages else ""

    prompt = f"""
You are EcoTrail AI, a real-time sustainable travel assistant.
The traveler asked: "{message}"

AUTHENTIC OFFICIAL GOVERNMENT PACKAGES AVAILABLE FOR DIRECT ACCESS:
{packages_summary if packages_summary else "- IRCTC Official Tourism Packages (https://www.irctctourism.com): Direct national rail and holiday packages."}

VERIFIED OFFICIAL TRANSIT & TOURISM PORTALS:
{links_summary}

Instructions:
1. Provide a friendly, informative, genuine real-time response answering the traveler's inquiry.
2. CRITICAL REQUIREMENT - DIRECT OFFICIAL PACKAGE CITATION:
   If official packages or pilgrimage darshan packages are available (listed above, e.g. {pkg_names_str or "IRCTC Tourism"}), EXPLICITLY recommend that particular official package! State the exact package name, provide the clickable markdown link [Package Name](url), and explain what the official package covers (confirmed train travel, official state guest house/hotel stay, authorized local transfers, confirmed entry/darshan tokens with NO middleman markups).
3. Directly recommend low-emission travel principles (such as electric trains on IRCTC, state EV transit, UNESCO heritage ticketing via ASI, verified eco-homestays).
4. Explicitly cite the verified official websites above with direct markdown links [Name](url).
5. Encourage them to name any specific destination (e.g., 'Goa', 'Kerala', 'Manali', 'Jaipur', 'Varanasi', 'Tirupati') to get an instant multimodal route with green scores, itinerary, and state-specific portals!
6. Format in concise markdown paragraphs or bullets.
"""
    ai_response = None
    api_key = getattr(settings, 'GEMINI_API_KEY', None) or os.getenv('GEMINI_API_KEY')
    if api_key and api_key.strip():
        try:
            client = genai.Client(api_key=api_key.strip())
            for model_name in ["gemini-3.5-flash-lite", "gemini-flash-latest"]:
                try:
                    resp = client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    text = resp.text
                    if text and len(text.strip()) > 30:
                        ai_response = text.strip()
                        break
                except Exception as ex:
                    logger.warning(f"General chat Gemini {model_name} failed: {ex}")
                    continue
        except Exception as e:
            logger.warning(f"General chat Gemini setup failed: {e}")

    if not ai_response:
        pkg_mention = ""
        if packages:
            top_pkg = packages[0]
            pkg_mention = (
                f"\n\n**Official Package Access:**\n"
                f"You can directly access the verified government package at **[{top_pkg['name']}]({top_pkg['url']})** "
                f"for official rates, confirmed stays, and authorized itineraries without broker commission."
            )

        ai_response = (
            f"Welcome to **EcoTrail**! I am your real-time sustainable travel assistant. "
            f"I calculate real-time carbon footprints, accessible routes, and provide verified official government booking portals "
            f"and packages with zero intermediary markup.{pkg_mention}\n\n"
            f"You can explore electric train routes directly on the **[Official IRCTC Portal](https://www.irctc.co.in)**, "
            f"official vacation & rail packages on **[IRCTC Tourism](https://www.irctctourism.com)**, "
            f"check heritage monuments via the **[Archaeological Survey of India](https://asi.nic.in)**, "
            f"or explore national circuits on **[Incredible India](https://www.incredibleindia.org)**.\n\n"
            f"**Try asking:** *\"Find the greenest way to Goa with verified low-emission stays\"* or *\"3 days in Tirupati with official darshan package\"*!"
        )

    return {
        "success": True,
        "message": "EcoTrail Assistant is ready to help you travel greener.",
        "ai_response": ai_response,
        "official_links": official_links,
        "intent": {
            "origin": getattr(user, 'home_city', None) if user else None,
            "destination": None,
            "duration_days": 3,
            "budget": None,
            "currency": "INR",
            "eco_priority": "high",
            "accessibility_required": False,
            "wheelchair_required": False,
            "step_free_required": False,
        },
        "travel_data": None,
        "recommendations": {"results": [], "weights": {}},
        "eco_twin": {"available": False},
        "itinerary": None,
        "show_your_math": {},
    }


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
    8. Synthesizes real-time conversational response with verified official links.
    9. Formats composite response payload conforming strictly to EcoTrail response contract.
    """
    gemini_result = extract_travel_intent(message)

    if not gemini_result.get("success"):
        err = gemini_result.get("error", "")
        # If destination wasn't specified in general query, handle smoothly with real-time AI advice & official links
        if "destination" in err.lower() or "identify" in err.lower():
            return handle_general_travel_chat(message, user=user)
        return {
            "success": False,
            "message": err or "The AI service is temporarily unavailable. Please try again.",
        }

    raw_intent = gemini_result.get("intent", {})
    serializer = TravelIntentSerializer(data=raw_intent)

    if serializer.is_valid():
        validated_intent = serializer.validated_data
    else:
        logger.warning(f"Intent validation errors: {serializer.errors}. Using raw intent fallback.")
        validated_intent = raw_intent

    # If no destination was detected, handle as general travel inquiry with official links
    if not validated_intent.get("destination"):
        return handle_general_travel_chat(message, user=user)

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

    # 6. Resolve authoritative official government & booking websites
    official_links = resolve_official_links(
        destination=destination or "",
        origin=origin or "",
        user_query=message
    )

    # 7. Generate real-time live conversational advice with official citations
    ai_response = generate_realtime_chat_response(
        message=message,
        intent=validated_intent,
        travel_data=travel_data,
        recommendations=recommendations,
        eco_twin=eco_twin,
        official_links=official_links
    )

    return {
        "success": True,
        "message": confirm_msg,
        "ai_response": ai_response,
        "official_links": official_links,
        "intent": validated_intent,
        "travel_data": travel_data,
        "recommendations": recommendations,
        "eco_twin": eco_twin,
        "itinerary": itinerary,
        "show_your_math": top_show_your_math,
    }

