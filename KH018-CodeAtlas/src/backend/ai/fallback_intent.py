"""
Deterministic Rule & Regex Fallback Intent Extractor.
Ensures zero-crash travel intent extraction even if external AI APIs
(Gemini, Groq) are offline, rate-limited, or timing out during demo.
"""

import re
import logging

logger = logging.getLogger(__name__)

INDIAN_CITIES = [
    "pune", "goa", "mumbai", "bombay", "panaji", "bengaluru", "bangalore",
    "delhi", "new delhi", "hyderabad", "chennai", "kolkata", "jaipur",
    "ahmedabad", "kochi", "cochin", "agra", "varanasi", "mysuru", "mysore",
    "manali", "shimla", "rishikesh", "pondicherry", "udaipur"
]

def extract_fallback_intent(message: str) -> dict:
    """
    Parses common natural language travel queries using deterministic pattern matching.
    """
    if not message or not isinstance(message, str):
        return {
            "origin": None,
            "destination": None,
            "duration_days": 3,
            "budget": 10000,
            "currency": "INR",
            "eco_priority": "high",
            "accessibility_required": False,
            "wheelchair_required": False,
            "step_free_required": False,
            "travel_dates": None,
            "transport_preference": None,
        }

    text = message.strip()
    lower_text = text.lower()

    # 1. Extract Origin and Destination
    origin = None
    destination = None

    # Pattern: "from <Origin> to <Destination>" or "<Origin> to <Destination>"
    to_match = re.search(r'(?:from\s+)?([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+?)(?:\s+for|\s+under|\s+with|\s+in|\s+budget|\s*[,.]|$)', text, re.IGNORECASE)
    if to_match:
        cand_origin = to_match.group(1).strip().capitalize()
        cand_dest = to_match.group(2).strip().capitalize()
        # Clean words like "trip", "travel"
        cand_origin = re.sub(r'^(?:trip|travel|plan|book)\s+', '', cand_origin, flags=re.IGNORECASE)
        origin = cand_origin
        destination = cand_dest

    # Fallback city scan if regex didn't resolve cleanly
    if not destination or not origin:
        found_cities = []
        for city in INDIAN_CITIES:
            # Word boundary search
            if re.search(r'\b' + re.escape(city) + r'\b', lower_text):
                found_cities.append(city.capitalize())

        if len(found_cities) >= 2:
            if not origin:
                origin = found_cities[0]
            if not destination:
                destination = found_cities[1]
        elif len(found_cities) == 1:
            if not destination:
                destination = found_cities[0]

    # 2. Extract Duration (e.g. "3 days", "3-day", "a week", "weekend")
    duration_days = 3
    dur_match = re.search(r'(\d+)\s*(?:-|–|\s*)?(?:day|days|night|nights)', lower_text)
    if dur_match:
        try:
            duration_days = int(dur_match.group(1))
        except (ValueError, TypeError):
            duration_days = 3
    elif "weekend" in lower_text:
        duration_days = 2
    elif "week" in lower_text:
        duration_days = 7

    # 3. Extract Budget (e.g. "₹10,000", "under 10000", "budget 8000", "10k")
    budget = None
    currency = "INR"

    budget_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d+)\s*(?:k\b)?', lower_text)
    # Check specifically for budget keywords
    kw_budget_match = re.search(r'(?:under|budget|below|max|around|within)\s*(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d+)\s*(k)?', lower_text)
    if kw_budget_match:
        num_str = kw_budget_match.group(1).replace(',', '')
        val = int(num_str)
        if kw_budget_match.group(2) == 'k':
            val *= 1000
        budget = val
    elif budget_match:
        raw_val = budget_match.group(1).replace(',', '')
        val = int(raw_val)
        if val >= 500: # reasonable travel budget threshold
            budget = val

    if not budget:
        budget = 10000 # default sensible budget

    # 4. Extract Accessibility Needs
    acc_keywords = ["accessible", "wheelchair", "step-free", "step free", "ramp", "disability", "handicap", "reduced mobility"]
    accessibility_required = any(k in lower_text for k in acc_keywords)
    wheelchair_required = "wheelchair" in lower_text or accessibility_required
    step_free_required = "step-free" in lower_text or "step free" in lower_text or "ramp" in lower_text or accessibility_required

    # 5. Extract Eco Priority
    eco_priority = "high"
    if "maximum" in lower_text or "zero flight" in lower_text or "strictly train" in lower_text:
        eco_priority = "maximum"
    elif "balanced" in lower_text or "medium" in lower_text:
        eco_priority = "balanced"

    # 6. Transport Preference
    transport_pref = None
    if "train" in lower_text or "rail" in lower_text:
        transport_pref = "train"
    elif "ev" in lower_text or "electric car" in lower_text or "electric cab" in lower_text:
        transport_pref = "ev"
    elif "flight" in lower_text or "fly" in lower_text:
        transport_pref = "flight"
    elif "bus" in lower_text:
        transport_pref = "bus"

    logger.info(f"Fallback intent extracted: {origin} -> {destination}, {duration_days} days, budget={budget}")

    return {
        "origin": origin,
        "destination": destination,
        "duration_days": duration_days,
        "budget": budget,
        "currency": currency,
        "eco_priority": eco_priority,
        "accessibility_required": accessibility_required,
        "wheelchair_required": wheelchair_required,
        "step_free_required": step_free_required,
        "travel_dates": None,
        "transport_preference": transport_pref,
    }
