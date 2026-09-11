"""
Centralized configuration for EcoTrail Recommendation Engine.
Contains fallback emission factors, default scoring weights, and scoring thresholds.
"""

# Fallback emission factors in kg CO2e per passenger-kilometer
# Based on DEFRA / IPCC benchmark methodologies
FALLBACK_EMISSION_FACTORS = {
    "flight": 0.180,       # Domestic / short-haul flight
    "car": 0.140,          # Average petrol/diesel passenger car
    "car_petrol": 0.140,
    "car_diesel": 0.135,
    "car_ev": 0.045,       # Electric vehicle with average grid mix
    "ev": 0.045,
    "bus": 0.080,          # Intercity transit / coach bus
    "train": 0.035,        # Electric/diesel intercity rail
    "rail": 0.035,
    "ferry": 0.110,
}

# Standard default weights specified by EcoTrail formula:
# Green & Accessible Score = 0.40 * CarbonScore + 0.30 * AccessScore + 0.15 * CostScore + 0.15 * TimeScore
DEFAULT_WEIGHTS = {
    "carbon": 0.40,
    "accessibility": 0.30,
    "cost": 0.15,
    "time": 0.15,
}

def validate_weights(weights: dict) -> dict:
    """
    Validates that weights is a dictionary with non-negative numbers
    and that their sum equals 1.0 (within float tolerance).
    Returns normalized weights or raises ValueError.
    """
    if not isinstance(weights, dict):
        raise ValueError("Weights must be a dictionary.")

    required_keys = {"carbon", "accessibility", "cost", "time"}
    if not required_keys.issubset(weights.keys()):
        missing = required_keys - set(weights.keys())
        raise ValueError(f"Missing weight keys: {missing}")

    validated = {}
    total = 0.0

    for k in required_keys:
        val = weights[k]
        if not isinstance(val, (int, float)):
            raise ValueError(f"Weight for '{k}' must be a numeric value, got {type(val)}.")
        if val < 0:
            raise ValueError(f"Weight for '{k}' cannot be negative: {val}")
        validated[k] = float(val)
        total += float(val)

    if round(total, 4) != 1.0:
        raise ValueError(f"Weights must sum to 1.0, current sum is {round(total, 4)}.")

    return validated
