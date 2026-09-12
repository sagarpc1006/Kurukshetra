"""
Deterministic Cost Scoring Service.
Normalizes travel option costs onto a 0-100 scale (cheapest receiving highest score),
and validates affordability against user-defined trip budgets.
"""

def evaluate_budget_compliance(amount: float, budget: float = None) -> dict:
    """
    Checks if a travel option amount falls within the user's budget.
    """
    if budget is None or not isinstance(budget, (int, float)) or budget <= 0:
        return {
            "within_budget": True,
            "over_budget": False,
            "budget_delta": None
        }

    if amount is None or not isinstance(amount, (int, float)):
        return {
            "within_budget": None,
            "over_budget": None,
            "budget_delta": None
        }

    cost_val = float(amount)
    budget_val = float(budget)
    is_over = cost_val > budget_val
    delta = round(budget_val - cost_val, 2)

    return {
        "within_budget": not is_over,
        "over_budget": is_over,
        "budget_delta": delta
    }

def calculate_cost_score(amount: float, min_cost: float = None, max_cost: float = None, budget: float = None) -> int:
    """
    Computes a 0-100 cost score.
    Cheaper options receive higher scores.
    
    Rules:
    - If min_cost and max_cost are provided across an option set:
      The lowest-cost option receives top score (100).
      Higher-cost options are scaled down proportionally.
    - Missing or zero prices receive a conservative baseline score (50).
    - If over budget, the cost score is penalised by 25 points.
    """
    if amount is None or not isinstance(amount, (int, float)) or amount <= 0:
        return 50

    cost_val = float(amount)

    if min_cost is not None and max_cost is not None and max_cost > min_cost:
        ratio = (cost_val - min_cost) / (max_cost - min_cost)
        # Ratio 0 (cheapest) -> score 100; Ratio 1 (most expensive) -> score 40
        raw_score = 100.0 - (ratio * 60.0)
    else:
        # Fallback relative to budget or benchmark
        if budget is not None and budget > 0:
            ratio = min(2.0, cost_val / float(budget))
            raw_score = max(20.0, 100.0 - (ratio * 50.0))
        else:
            raw_score = 75.0

    # Apply penalty if strictly over user budget
    if budget is not None and budget > 0 and cost_val > budget:
        raw_score = max(10.0, raw_score - 25.0)

    return int(round(max(0.0, min(100.0, raw_score))))
