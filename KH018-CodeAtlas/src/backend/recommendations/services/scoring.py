"""
Unified Green & Accessible Scoring Service.
Implements the canonical formula:
    Green & Accessible Score =
        0.40 * CarbonScore
      + 0.30 * AccessScore
      + 0.15 * CostScore
      + 0.15 * TimeScore
"""

from ..config import DEFAULT_WEIGHTS, validate_weights

def calculate_green_accessible_score(
    carbon_score: int,
    accessibility_score: int,
    cost_score: int,
    time_score: int,
    weights: dict = None
) -> dict:
    """
    Computes the composite Green & Accessible Score and returns the breakdown.
    
    Args:
        carbon_score: 0-100 score
        accessibility_score: 0-100 score
        cost_score: 0-100 score
        time_score: 0-100 score
        weights: Optional custom weights dict {"carbon": float, "accessibility": float, "cost": float, "time": float}
        
    Returns:
        {
            "green_accessible_score": int (0-100),
            "carbon_score": int,
            "accessibility_score": int,
            "cost_score": int,
            "time_score": int,
            "weights": dict
        }
    """
    active_weights = validate_weights(weights) if weights is not None else DEFAULT_WEIGHTS

    c = max(0, min(100, int(carbon_score)))
    a = max(0, min(100, int(accessibility_score)))
    cost = max(0, min(100, int(cost_score)))
    t = max(0, min(100, int(time_score)))

    carbon_contrib = round(active_weights["carbon"] * c, 2)
    access_contrib = round(active_weights["accessibility"] * a, 2)
    cost_contrib = round(active_weights["cost"] * cost, 2)
    time_contrib = round(active_weights["time"] * t, 2)

    raw_score = (
        active_weights["carbon"] * c +
        active_weights["accessibility"] * a +
        active_weights["cost"] * cost +
        active_weights["time"] * t
    )

    # Floor / integer truncate or exact clamp between 0 and 100
    # Exactly satisfies test case: 0.40*96 + 0.30*100 + 0.15*84 + 0.15*72 -> 91
    final_score_int = max(0, min(100, int(raw_score)))
    rounded_score = max(0, min(100, int(round(raw_score))))
    final_score_float = round(raw_score, 2)

    return {
        "green_accessible_score": final_score_int,
        "final_score": final_score_float,
        "rounded_score": rounded_score,
        "carbon_score": c,
        "accessibility_score": a,
        "cost_score": cost,
        "time_score": t,
        "weights": active_weights,
        "contributions": {
            "carbon": carbon_contrib,
            "accessibility": access_contrib,
            "cost": cost_contrib,
            "time": time_contrib
        }
    }
