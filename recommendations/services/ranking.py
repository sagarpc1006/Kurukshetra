"""
Deterministic Ranking Service.
Scores, compares, and ranks travel options by Green & Accessible Score.
Generates non-hallucinated, mathematically accurate explanation facts.
"""

from ..config import DEFAULT_WEIGHTS, validate_weights
from . import carbon
from . import accessibility
from . import cost
from . import time
from . import scoring
from . import normalization
from accessibility.services.matching import match_accessibility_requirements

def generate_explanation_data(option: dict, baseline_option: dict, budget: float = None) -> dict:
    """
    Computes mathematical comparisons and generates factual why_recommended points.
    All facts are derived directly from calculations.
    """
    why_recommended = []
    comparison = {}

    opt_carbon = option.get("carbon", {}).get("kg_co2e", 0)
    opt_cost = option.get("price", {}).get("amount", 0)
    opt_time = option.get("duration_minutes", 0)
    opt_access = option.get("accessibility", {}).get("accessibility_rating", 0)
    opt_verified = option.get("accessibility", {}).get("accessibility_verified", False)

    if baseline_option and baseline_option != option:
        base_carbon = baseline_option.get("carbon", {}).get("kg_co2e", 0)
        base_cost = baseline_option.get("price", {}).get("amount", 0)
        base_time = baseline_option.get("duration_minutes", 0)
        base_access = baseline_option.get("accessibility", {}).get("accessibility_rating", 0)

        # Carbon reduction %
        if base_carbon > 0 and opt_carbon < base_carbon:
            reduction_pct = int(round(((base_carbon - opt_carbon) / base_carbon) * 100))
            comparison["carbon_reduction_percent"] = reduction_pct
            why_recommended.append(f"{reduction_pct}% lower carbon emissions than flight baseline")

        # Cost difference
        cost_diff = round(opt_cost - base_cost, 2)
        comparison["cost_difference"] = cost_diff
        if cost_diff < 0:
            why_recommended.append(f"₹{int(abs(cost_diff)):,} cheaper than baseline")
        elif cost_diff > 0:
            why_recommended.append(f"₹{int(cost_diff):,} premium for faster journey")

        # Time difference
        time_diff = int(opt_time - base_time)
        comparison["time_difference_minutes"] = time_diff
        if time_diff < 0:
            why_recommended.append(f"{abs(time_diff)} minutes faster")
        elif time_diff > 0:
            why_recommended.append(f"{time_diff} minutes travel duration difference")

        # Accessibility difference
        access_diff = round(opt_access - base_access, 1)
        comparison["accessibility_difference"] = access_diff
        if access_diff > 0:
            why_recommended.append(f"+{access_diff} higher accessibility rating")

    # Accessibility highlights
    if opt_verified:
        why_recommended.append("Verified step-free and accessible boarding")
    elif opt_access >= 4.0:
        why_recommended.append("High accessibility features provided")

    # Budget compliance highlights
    if budget is not None and budget > 0:
        if opt_cost <= budget:
            delta = int(budget - opt_cost)
            why_recommended.append(f"Within budget (₹{delta:,} under limit)")
        else:
            why_recommended.append(f"Exceeds target budget by ₹{int(opt_cost - budget):,}")

    if not why_recommended:
        why_recommended.append("Balanced green and accessible option")

    return {
        "why_recommended": why_recommended,
        "comparison": comparison
    }

def rank_travel_options(travel_data: dict, intent: dict, custom_weights: dict = None) -> dict:
    """
    Main entry point for Recommendation Engine.
    Takes normalized travel data and intent, scores all options deterministically,
    and returns ranked recommendations.
    
    Returns:
        {
            "weights": { "carbon": 0.40, "accessibility": 0.30, "cost": 0.15, "time": 0.15 },
            "results": [
                {
                    "rank": 1,
                    "id": "...",
                    "green_accessible_score": 91,
                    "scores": { "carbon": 96, "accessibility": 100, "cost": 84, "time": 72 },
                    "price": { "amount": 7650, "currency": "INR" },
                    "duration_minutes": 235,
                    "carbon": { "kg_co2e": 31.2, "method": "fallback_factor" },
                    "accessibility": { "rating": 5.0, "verified": true, "status": "verified" },
                    "within_budget": true,
                    "explanation": { "why_recommended": [...] }
                }, ...
            ]
        }
    """
    weights = validate_weights(custom_weights) if custom_weights else DEFAULT_WEIGHTS

    # Build canonical option representations
    options = normalization.build_recommendation_options(travel_data, intent)
    if not options:
        return {
            "weights": weights,
            "results": []
        }

    # Extract ranges for relative normalization across options
    carbons = [o["carbon"]["kg_co2e"] for o in options if o.get("carbon", {}).get("kg_co2e") is not None]
    costs = [o["price"]["amount"] for o in options if o.get("price", {}).get("amount") is not None]
    durations = [o["duration_minutes"] for o in options if o.get("duration_minutes") is not None]

    min_c, max_c = (min(carbons), max(carbons)) if carbons else (None, None)
    min_cost, max_cost = (min(costs), max(costs)) if costs else (None, None)
    min_dur, max_dur = (min(durations), max(durations)) if durations else (None, None)

    budget = intent.get("budget")

    # Baseline for comparisons (e.g. flight or highest carbon option)
    flight_options = [o for o in options if o.get("transport", {}).get("mode") == "flight"]
    baseline = flight_options[0] if flight_options else (options[0] if options else None)

    has_hard_acc = bool(
        intent.get("wheelchair_required") or
        intent.get("step_free_required") or
        intent.get("accessible_vehicle_required") or
        intent.get("accessible_venue_required")
    )
    # If general accessibility_required is True without specific flags, treat wheelchair & step-free as required
    if intent.get("accessibility_required") and not has_hard_acc:
        intent = dict(intent)
        intent["wheelchair_required"] = True
        intent["step_free_required"] = True
        has_hard_acc = True

    scored_options = []
    for opt in options:
        c_val = opt["carbon"]["kg_co2e"]
        cost_val = opt["price"]["amount"]
        dur_val = opt["duration_minutes"]
        acc_dict = opt["accessibility"]

        # Calculate component scores (0-100)
        c_score = carbon.calculate_carbon_score(c_val, min_carbon=min_c, max_carbon=max_c)
        acc_result = accessibility.calculate_accessibility_score(acc_dict)
        acc_match = match_accessibility_requirements(intent, acc_result)

        # Step 5 Principle: Hard accessibility requirements MUST be applied before ranking
        if has_hard_acc and not acc_match["compatible"]:
            continue

        a_score = acc_result["accessibility_score"]
        cost_score = cost.calculate_cost_score(cost_val, min_cost=min_cost, max_cost=max_cost, budget=budget)
        time_score = time.calculate_time_score(dur_val, min_duration=min_dur, max_duration=max_dur)

        # Composite Green & Accessible Score
        comp_res = scoring.calculate_green_accessible_score(
            carbon_score=c_score,
            accessibility_score=a_score,
            cost_score=cost_score,
            time_score=time_score,
            weights=weights
        )

        b_comp = cost.evaluate_budget_compliance(cost_val, budget=budget)
        explanation = generate_explanation_data(opt, baseline_option=baseline, budget=budget)

        # Show Your Math: Inputs
        inputs = {
            "carbon_kg_co2e": c_val,
            "accessibility_rating": acc_result.get("accessibility_rating"),
            "price": cost_val,
            "currency": opt["price"].get("currency", "INR"),
            "duration_minutes": dur_val
        }

        # Show Your Math: Contributions
        contributions = comp_res.get("contributions", {
            "carbon": round(weights["carbon"] * comp_res["carbon_score"], 2),
            "accessibility": round(weights["accessibility"] * comp_res["accessibility_score"], 2),
            "cost": round(weights["cost"] * comp_res["cost_score"], 2),
            "time": round(weights["time"] * comp_res["time_score"], 2)
        })

        # Show Your Math: Calculation details
        raw_final = comp_res.get("final_score", round(sum(contributions.values()), 2))
        calculation = {
            "carbon_contribution": contributions["carbon"],
            "accessibility_contribution": contributions["accessibility"],
            "cost_contribution": contributions["cost"],
            "time_contribution": contributions["time"],
            "final_score": raw_final,
            "formula": (
                f"({comp_res['carbon_score']} × {int(weights['carbon']*100)}%) + "
                f"({comp_res['accessibility_score']} × {int(weights['accessibility']*100)}%) + "
                f"({comp_res['cost_score']} × {int(weights['cost']*100)}%) + "
                f"({comp_res['time_score']} × {int(weights['time']*100)}%)"
            )
        }

        # Show Your Math: Provenance and data sources
        c_method = opt.get("carbon", {}).get("method", "fallback_factor")
        c_is_duffel = (c_method == "duffel")
        dur_h = dur_val // 60
        dur_m = dur_val % 60
        formatted_time = f"{dur_h}h {dur_m}m" if dur_h > 0 else f"{dur_m}m"

        math_sources = {
            "carbon": {
                "method": c_method,
                "source_name": "Duffel carrier data" if c_is_duffel else "EcoTrail configured emission factor",
                "label": "Provider verified" if c_is_duffel else "Transport emission factor",
                "description": (
                    "Emission data provided by carrier via Duffel."
                    if c_is_duffel
                    else "Calculated using EcoTrail's configured transport emission factors."
                ),
                "distance_km": opt.get("distance_km"),
                "transport_mode": opt.get("transport", {}).get("mode")
            },
            "accessibility": {
                "rating": acc_result.get("accessibility_rating"),
                "score": acc_result.get("accessibility_score"),
                "status": acc_result.get("accessibility_status", "unknown"),
                "status_label": acc_result.get("status_label", "Unknown"),
                "verified": acc_result.get("accessibility_verified", False),
                "confidence": acc_result.get("confidence", 0),
                "sources": acc_result.get("sources", []),
                "evidence_details": acc_result.get("evidence_details", [])
            },
            "cost": {
                "price": cost_val,
                "currency": opt["price"].get("currency", "INR"),
                "source": opt.get("source", "provider_data"),
                "budget": budget,
                "within_budget": b_comp["within_budget"],
                "over_budget": b_comp["over_budget"],
                "budget_difference": round(cost_val - budget, 2) if budget else None
            },
            "time": {
                "duration_minutes": dur_val,
                "formatted": formatted_time,
                "source": opt.get("source", "routing_schedule")
            }
        }

        show_your_math = {
            "weights": weights,
            "scores": {
                "carbon": comp_res["carbon_score"],
                "accessibility": comp_res["accessibility_score"],
                "cost": comp_res["cost_score"],
                "time": comp_res["time_score"]
            },
            "inputs": inputs,
            "contributions": contributions,
            "calculation": calculation,
            "final_score": raw_final,
            "rounded_score": comp_res.get("rounded_score", round(raw_final)),
            "sources": math_sources
        }

        scored_options.append({
            "id": opt["id"],
            "title": opt["title"],
            "transport": opt["transport"],
            "green_accessible_score": comp_res["green_accessible_score"],
            "scores": {
                "carbon": comp_res["carbon_score"],
                "accessibility": comp_res["accessibility_score"],
                "cost": comp_res["cost_score"],
                "time": comp_res["time_score"]
            },
            "weights": weights,
            "inputs": inputs,
            "contributions": contributions,
            "calculation": calculation,
            "show_your_math": show_your_math,
            "price": opt["price"],
            "duration_minutes": opt["duration_minutes"],
            "distance_km": opt.get("distance_km"),
            "carbon": opt["carbon"],
            "accessibility": acc_result,
            "accessibility_match": acc_match,
            "within_budget": b_comp["within_budget"],
            "over_budget": b_comp["over_budget"],
            "explanation": explanation,
            "source": opt.get("source"),
            "status": opt.get("status", "live")
        })

    # Sort descending by green_accessible_score (ties broken by lower carbon, then lower cost)
    scored_options.sort(
        key=lambda x: (
            x["green_accessible_score"],
            -x["carbon"]["kg_co2e"],
            -x["price"]["amount"]
        ),
        reverse=True
    )

    # Assign rank 1, 2, 3...
    for rank_idx, item in enumerate(scored_options, 1):
        item["rank"] = rank_idx

    return {
        "weights": weights,
        "results": scored_options
    }
