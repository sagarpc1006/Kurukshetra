import os
import json
import re
import logging
import requests
from django.conf import settings
from google import genai
from google.genai import types
from .prompts import SYSTEM_INTENT_EXTRACTION_PROMPT
from .fallback_intent import extract_fallback_intent

logger = logging.getLogger(__name__)

def clean_json_response(raw_text: str) -> str:
    """Removes markdown code fences and extraneous whitespace from AI model output."""
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()

def normalize_intent(intent: dict) -> dict:
    """Validates and sanitizes the extracted intent fields to conform strictly to schema."""
    origin = intent.get("origin")
    destination = intent.get("destination")
    duration_days = intent.get("duration_days")
    budget = intent.get("budget")
    currency = intent.get("currency") or "INR"
    eco_priority = intent.get("eco_priority")
    accessibility_required = intent.get("accessibility_required", False)
    travel_dates = intent.get("travel_dates")
    transport_preference = intent.get("transport_preference")

    if duration_days is not None:
        try:
            duration_days = int(duration_days)
        except (ValueError, TypeError):
            duration_days = None

    if budget is not None:
        try:
            if isinstance(budget, str):
                cleaned_budget = re.sub(r"[^\d.]", "", budget)
                budget = float(cleaned_budget) if cleaned_budget else None
            else:
                budget = float(budget)
            if budget is not None and budget.is_integer():
                budget = int(budget)
        except (ValueError, TypeError):
            budget = None

    if isinstance(accessibility_required, str):
        accessibility_required = accessibility_required.lower() in ("true", "yes", "1", "required")
    else:
        accessibility_required = bool(accessibility_required)

    wheelchair_required = bool(intent.get("wheelchair_required", False)) or accessibility_required
    step_free_required = bool(intent.get("step_free_required", False)) or accessibility_required

    if eco_priority and isinstance(eco_priority, str):
        eco_priority = eco_priority.strip().lower()

    return {
        "origin": origin if origin else None,
        "destination": destination if destination else None,
        "duration_days": duration_days,
        "budget": budget,
        "currency": str(currency).upper(),
        "eco_priority": eco_priority if eco_priority else None,
        "accessibility_required": accessibility_required,
        "wheelchair_required": wheelchair_required,
        "step_free_required": step_free_required,
        "travel_dates": travel_dates if travel_dates else None,
        "transport_preference": transport_preference if transport_preference else None,
    }

def try_groq_intent_extraction(message: str) -> dict:
    """Fallback extraction using Groq's high-speed API if configured."""
    groq_key = getattr(settings, 'GROQ_API_KEY', None) or os.getenv('GROQ_API_KEY')
    if not groq_key or not groq_key.strip():
        return None

    try:
        logger.info("Attempting Groq fallback intent extraction...")
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {groq_key.strip()}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": SYSTEM_INTENT_EXTRACTION_PROMPT},
                {"role": "user", "content": f"Extract travel intent from this query:\n\"{message}\""}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
            "max_tokens": 500
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            if "intent" in parsed and isinstance(parsed["intent"], dict):
                parsed = parsed["intent"]
            logger.info("Groq fallback intent extraction succeeded.")
            return normalize_intent(parsed)
    except Exception as e:
        logger.warning(f"Groq fallback intent extraction failed: {e}")
    return None

def extract_travel_intent(message: str) -> dict:
    """
    Sends natural language user request to Gemini API and extracts structured travel intent.
    Falls back gracefully to Groq and deterministic rule-based parsing if needed.
    """
    if not message or not str(message).strip():
        return {
            "success": False,
            "error": "Travel request message cannot be empty.",
        }

    api_key = getattr(settings, 'GEMINI_API_KEY', None) or os.getenv('GEMINI_API_KEY')
    user_prompt = f"{SYSTEM_INTENT_EXTRACTION_PROMPT}\n\nUSER QUERY:\n\"{message}\"\n\nJSON RESPONSE:"

    if api_key and api_key.strip():
        try:
            client = genai.Client(api_key=api_key.strip())
            candidate_models = [
                "gemini-3.5-flash-lite",
                "gemini-flash-latest",
                "gemini-3.6-flash",
            ]
            for model_name in candidate_models:
                try:
                    logger.info(f"Invoking Gemini model: {model_name}")
                    response = client.models.generate_content(
                        model=model_name,
                        contents=user_prompt,
                    )
                    raw_text = response.text or ""
                    cleaned_text = clean_json_response(raw_text)
                    parsed_json = json.loads(cleaned_text)

                    if "intent" in parsed_json and isinstance(parsed_json["intent"], dict):
                        parsed_json = parsed_json["intent"]

                    normalized = normalize_intent(parsed_json)
                    return {
                        "success": True,
                        "intent": normalized,
                    }
                except Exception as e:
                    logger.warning(f"Gemini call with {model_name} failed: {e}")
                    continue
        except Exception as e:
            logger.warning(f"Gemini client initialization failed: {e}")

    # 2. Try Groq fallback
    groq_intent = try_groq_intent_extraction(message)
    if groq_intent:
        return {
            "success": True,
            "intent": groq_intent,
        }

    # 3. Deterministic rule/pattern fallback
    logger.info("Using deterministic rule fallback intent extractor.")
    fallback_data = extract_fallback_intent(message)
    if fallback_data.get("destination"):
        return {
            "success": True,
            "intent": normalize_intent(fallback_data),
        }

    return {
        "success": False,
        "error": "Could not identify destination. Please specify where you would like to travel.",
    }


def generate_fact_based_explanation(facts: dict) -> str:
    """
    Produces a single factual natural-language explanation strictly derived
    from structured comparison facts. Never alters numbers or fabricates claims.
    Always falls back to deterministic sentence if AI models are offline.
    """
    c_red = facts.get("carbon_reduction_percent")
    c_diff = facts.get("cost_difference")
    t_diff = facts.get("time_difference_minutes")
    a_diff = facts.get("accessibility_difference")
    in_budget = facts.get("within_budget")

    parts = []
    if c_red and c_red > 0:
        parts.append(f"{c_red}% lower carbon emissions")
    if c_diff is not None:
        if c_diff < 0:
            parts.append(f"₹{int(abs(c_diff)):,} cheaper than baseline")
        elif c_diff > 0:
            parts.append(f"₹{int(c_diff):,} premium")
    if t_diff is not None:
        if t_diff < 0:
            parts.append(f"{abs(t_diff)} mins faster")
        elif t_diff > 0:
            parts.append(f"{t_diff} mins longer")
    if a_diff and a_diff > 0:
        parts.append(f"+{a_diff} higher accessibility rating")

    if not parts:
        return "Balanced sustainable travel alternative with lower environmental impact."

    return "Recommended for " + ", ".join(parts) + "."
