"""
Deterministic Carbon Scoring Service.
Computes emissions based on provider data or fallback emission factors,
and normalizes carbon scores on a 0-100 scale (higher = cleaner/lower emissions).
"""

from ..config import FALLBACK_EMISSION_FACTORS

def calculate_carbon_emissions(mode: str, distance_km: float = None, passengers: int = 1, provider_carbon: float = None) -> dict:
    """
    Computes total kg CO2e emissions for a given journey option.
    Uses provider carbon if provided; otherwise applies centralized emission factors.
    
    Returns:
        {
            "kg_co2e": float,
            "method": "provider" | "fallback_factor" | "estimated_baseline"
        }
    """
    if provider_carbon is not None and isinstance(provider_carbon, (int, float)) and provider_carbon >= 0:
        return {
            "kg_co2e": round(float(provider_carbon), 1),
            "method": "provider"
        }

    clean_mode = (mode or "car").strip().lower()
    factor = FALLBACK_EMISSION_FACTORS.get(clean_mode, FALLBACK_EMISSION_FACTORS["car"])

    if distance_km is not None and isinstance(distance_km, (int, float)) and distance_km > 0:
        effective_passengers = max(1, passengers)
        emissions = (distance_km * factor) / effective_passengers
        return {
            "kg_co2e": round(float(emissions), 1),
            "method": "fallback_factor"
        }

    # Missing distance fallback: estimate based on travel mode baseline
    baseline_distances = {
        "flight": 450.0,
        "train": 400.0,
        "bus": 380.0,
        "car": 350.0,
        "ev": 350.0
    }
    est_dist = baseline_distances.get(clean_mode, 350.0)
    emissions = est_dist * factor
    return {
        "kg_co2e": round(float(emissions), 1),
        "method": "estimated_baseline"
    }

def calculate_carbon_score(carbon_kg: float, min_carbon: float = None, max_carbon: float = None) -> int:
    """
    Normalizes carbon emissions into a 0-100 score.
    Higher score represents lower emissions (more sustainable).
    
    Rules:
    - If min and max carbon are given and max > min:
      The cleanest option (min_carbon) receives 100 or near 100.
      The highest-emission option receives a proportionally lower score.
    - If single option or max == min:
      Evaluated against standard benchmark thresholds.
    """
    if carbon_kg is None or not isinstance(carbon_kg, (int, float)) or carbon_kg < 0:
        return 50 # Conservative neutral default for missing/invalid data

    carbon_val = float(carbon_kg)

    if min_carbon is not None and max_carbon is not None and max_carbon > min_carbon:
        # Scale between 40 and 100 across the comparative set
        ratio = (carbon_val - min_carbon) / (max_carbon - min_carbon)
        score = 100.0 - (ratio * 60.0)
        return int(round(max(0.0, min(100.0, score))))

    # Absolute benchmark curve:
    # 0 kg -> 100
    # 15 kg (train) -> 95-96
    # 30 kg (EV / coach) -> 88
    # 60 kg (solo petrol car) -> 70
    # 100 kg (flight) -> 50
    # 200+ kg -> 15-20
    if carbon_val <= 5.0:
        return 100
    elif carbon_val <= 18.0:
        # e.g. 15 kg -> 96
        return int(round(100 - ((carbon_val - 5.0) / 13.0) * 6))
    elif carbon_val <= 40.0:
        return int(round(94 - ((carbon_val - 18.0) / 22.0) * 10))
    elif carbon_val <= 90.0:
        return int(round(84 - ((carbon_val - 40.0) / 50.0) * 24))
    else:
        # High emissions
        score = 60.0 - ((carbon_val - 90.0) / 150.0) * 40.0
        return int(round(max(10.0, min(60.0, score))))
