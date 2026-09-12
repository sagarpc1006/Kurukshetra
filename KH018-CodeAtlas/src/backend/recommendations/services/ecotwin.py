"""
Deterministic Eco-Twin Service.
Finds, compares, and explains the greenest, most accessible alternative
to a baseline conventional travel option.
100% deterministic calculations without AI hallucination.
"""

from typing import List, Dict, Any, Optional
from ..config import DEFAULT_WEIGHTS

try:
    from accessibility.services.matching import match_accessibility_requirements
except ImportError:
    try:
        from Kurukshetra.accessibility.services.matching import match_accessibility_requirements
    except ImportError:
        match_accessibility_requirements = None


def extract_option_fields(option: Dict[str, Any]) -> Dict[str, Any]:
    """
    Standardizes field access across both ranked recommendation dicts
    and raw test fixture dicts.
    """
    if not option:
        return {}

    # ID
    opt_id = option.get("id") or "opt_unknown"

    # Title
    title = option.get("title") or option.get("name") or "Travel Option"

    # Transport description
    transport_raw = option.get("transport")
    if isinstance(transport_raw, dict):
        mode = transport_raw.get("mode", "transit")
        label = transport_raw.get("label") or transport_raw.get("airline") or mode
        transport_str = label
    elif isinstance(transport_raw, str):
        transport_str = transport_raw
        mode = transport_raw.lower()
    else:
        mode = "transit"
        transport_str = "Transit"

    # Price
    price_raw = option.get("price")
    if isinstance(price_raw, dict):
        cost = price_raw.get("amount")
        currency = price_raw.get("currency", "INR")
    elif isinstance(price_raw, (int, float)):
        cost = float(price_raw)
        currency = option.get("currency", "INR")
    else:
        cost = None
        currency = option.get("currency", "INR")

    # Duration
    duration = option.get("duration_minutes")
    if duration is None:
        duration = option.get("duration")

    # Carbon
    carbon_raw = option.get("carbon")
    if isinstance(carbon_raw, dict):
        carbon_kg = carbon_raw.get("kg_co2e")
        carbon_status = "calculated" if carbon_kg is not None else "unknown"
    elif isinstance(carbon_raw, (int, float)):
        carbon_kg = float(carbon_raw)
        carbon_status = "calculated"
    elif option.get("carbon_kg_co2e") is not None:
        carbon_kg = float(option["carbon_kg_co2e"])
        carbon_status = "calculated"
    else:
        carbon_kg = None
        carbon_status = "unknown"

    # Accessibility
    acc_raw = option.get("accessibility")
    conf = 50
    sources = []
    status_label = "Unknown"
    wheelchair_acc = None
    step_free_acc = None
    evidence_details = []

    if isinstance(acc_raw, dict):
        acc_rating = acc_raw.get("accessibility_rating")
        if acc_rating is None:
            acc_rating = acc_raw.get("rating")
        acc_verified = acc_raw.get("accessibility_verified")
        if acc_verified is None:
            acc_verified = acc_raw.get("verified", False)
        acc_status = acc_raw.get("accessibility_status") or acc_raw.get("status") or acc_raw.get("verification_status")
        if not acc_status:
            acc_status = "verified" if acc_verified else ("business_declared" if acc_rating is not None else "unknown")
        conf = acc_raw.get("confidence", 85 if acc_verified else (60 if acc_status != "unknown" else 0))
        sources = acc_raw.get("sources", [acc_status] if acc_status else [])
        status_label = acc_raw.get("status_label", "Verified" if acc_verified else (acc_status or "Unknown"))
        wheelchair_acc = acc_raw.get("wheelchair_accessible")
        step_free_acc = acc_raw.get("step_free")
        evidence_details = acc_raw.get("evidence_details", [])
    elif isinstance(acc_raw, (int, float)):
        acc_rating = float(acc_raw)
        acc_verified = bool(option.get("accessibility_verified", False))
        acc_status = "verified" if acc_verified else "business_declared"
        conf = 90 if acc_verified else 65
        sources = ["photo_verification" if acc_verified else "business_declaration"]
        status_label = "Verified" if acc_verified else "Business reported"
    elif option.get("accessibility_rating") is not None:
        acc_rating = float(option["accessibility_rating"])
        acc_verified = bool(option.get("accessibility_verified", False))
        acc_status = "verified" if acc_verified else "business_declared"
        conf = 90 if acc_verified else 65
        sources = ["photo_verification" if acc_verified else "business_declaration"]
        status_label = "Verified" if acc_verified else "Business reported"
    else:
        acc_rating = None
        acc_verified = False
        acc_status = "unknown"
        conf = 0
        sources = ["unknown"]
        status_label = "Unknown"

    if wheelchair_acc is None:
        wheelchair_acc = option.get("wheelchair_accessible")
        if wheelchair_acc is None:
            wheelchair_acc = option.get("wheelchair")
    if step_free_acc is None:
        step_free_acc = option.get("step_free")

    # Score
    score = option.get("green_accessible_score")
    if score is None:
        score = option.get("score")
    if score is None:
        # Fallback simple calculation if option is unranked
        score = 50

    return {
        "id": opt_id,
        "title": title,
        "transport": transport_str,
        "mode": mode,
        "price": {
            "amount": cost,
            "currency": currency,
        },
        "duration_minutes": duration,
        "carbon_kg_co2e": carbon_kg,
        "carbon_status": carbon_status,
        "accessibility_rating": acc_rating,
        "accessibility_status": acc_status,
        "accessibility_verified": bool(acc_verified),
        "confidence": conf,
        "sources": sources,
        "status_label": status_label,
        "wheelchair_accessible": wheelchair_acc,
        "step_free": step_free_acc,
        "evidence_details": evidence_details,
        "green_accessible_score": score,
        "raw": option,
    }


def identify_baseline_option(options: List[Dict[str, Any]], baseline_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Determines the baseline/conventional travel option from the candidate options.
    If baseline_id is given, returns that option.
    Otherwise picks the conventional option (flight or highest carbon option).
    """
    if not options:
        return None

    if baseline_id:
        for opt in options:
            if opt.get("id") == baseline_id:
                return opt

    # 1. Search for flight options (conventional baseline for intercity travel)
    for opt in options:
        trans = opt.get("transport", {})
        mode = trans.get("mode") if isinstance(trans, dict) else str(trans).lower()
        if "flight" in mode or "airline" in mode or "plane" in mode:
            return opt

    # 2. If no flight, pick the option with the highest carbon emissions
    highest_carbon_opt = None
    max_c = -1.0
    for opt in options:
        c_info = opt.get("carbon")
        c_val = None
        if isinstance(c_info, dict):
            c_val = c_info.get("kg_co2e")
        elif isinstance(c_info, (int, float)):
            c_val = float(c_info)
        elif opt.get("carbon_kg_co2e") is not None:
            c_val = float(opt["carbon_kg_co2e"])

        if c_val is not None and c_val > max_c:
            max_c = c_val
            highest_carbon_opt = opt

    if highest_carbon_opt:
        return highest_carbon_opt

    # 3. Fallback to the first option
    return options[0]


def select_eco_twin_candidate(
    options: List[Dict[str, Any]],
    baseline_option: Dict[str, Any],
    intent: Optional[Dict[str, Any]] = None,
    weights: Optional[Dict[str, float]] = None
) -> Optional[Dict[str, Any]]:
    """
    Finds and selects the best eco-friendly alternative among available options.
    Rules:
    - Must be different from baseline
    - Lower carbon than baseline
    - Satisfies hard constraints (budget, required accessibility)
    - Ranked by the authoritative Green & Accessible Score
    """
    if not options or not baseline_option:
        return None

    intent = intent or {}
    base_fields = extract_option_fields(baseline_option)
    base_carbon = base_fields["carbon_kg_co2e"]

    # If baseline has unknown carbon, we cannot reliably prove carbon reduction
    if base_carbon is None:
        return None

    budget = intent.get("budget")
    hard_budget = intent.get("hard_budget", False)
    accessibility_required = intent.get("accessibility_required", False)
    min_access_rating = intent.get("min_accessibility_rating", 4.0 if accessibility_required else 1.0)

    candidates = []

    for opt in options:
        fields = extract_option_fields(opt)

        # Disqualify the baseline itself
        if fields["id"] == base_fields["id"]:
            continue

        cand_carbon = fields["carbon_kg_co2e"]

        # Rule: Lower carbon than baseline
        if cand_carbon is None or cand_carbon >= base_carbon:
            continue

        cand_cost = fields["price"]["amount"]

        # Hard Constraint: Budget
        if hard_budget and budget is not None and cand_cost is not None:
            if cand_cost > budget:
                continue

        # Hard Constraint: Accessibility
        has_acc_constraint = bool(
            accessibility_required or
            intent.get("wheelchair_required") or
            intent.get("step_free_required") or
            intent.get("accessible_vehicle_required")
        )
        if has_acc_constraint:
            if match_accessibility_requirements is not None:
                match_res = match_accessibility_requirements(intent, fields)
                if not match_res["compatible"]:
                    continue
            cand_acc = fields["accessibility_rating"]
            if cand_acc is None or cand_acc < min_access_rating:
                continue

        candidates.append((opt, fields))

    if not candidates:
        return None

    # Sort candidates by:
    # 1. Green & Accessible Score (descending)
    # 2. Lowest carbon emissions (ascending)
    # 3. Highest accessibility rating (descending)
    # 4. Lowest price (ascending)
    def candidate_sort_key(item):
        opt, f = item
        score = f["green_accessible_score"]
        carbon_val = f["carbon_kg_co2e"] or 9999.0
        acc_val = f["accessibility_rating"] or 0.0
        cost_val = f["price"]["amount"] or 999999.0
        return (
            score,
            -carbon_val,
            acc_val,
            -cost_val
        )

    candidates.sort(key=candidate_sort_key, reverse=True)
    return candidates[0][0]


def compute_ecotwin_comparison(
    baseline_fields: Dict[str, Any],
    eco_twin_fields: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Computes exact, deterministic comparison metrics between baseline and Eco-Twin.
    Internal numbers are kept unrounded or high-precision float;
    display rounding is applied cleanly in the comparison payload.
    """
    base_carbon = baseline_fields.get("carbon_kg_co2e")
    twin_carbon = eco_twin_fields.get("carbon_kg_co2e")

    # A. Carbon reduction
    if base_carbon is not None and twin_carbon is not None and base_carbon > 0:
        carbon_reduction_kg = base_carbon - twin_carbon
        carbon_reduction_percent = (carbon_reduction_kg / base_carbon) * 100.0
    else:
        carbon_reduction_kg = 0.0
        carbon_reduction_percent = 0.0

    # B. Cost difference (negative = cheaper)
    base_cost = baseline_fields.get("price", {}).get("amount") or 0.0
    twin_cost = eco_twin_fields.get("price", {}).get("amount") or 0.0
    cost_difference = twin_cost - base_cost

    # C. Time difference (positive = longer)
    base_dur = baseline_fields.get("duration_minutes") or 0
    twin_dur = eco_twin_fields.get("duration_minutes") or 0
    time_difference_minutes = int(twin_dur - base_dur)

    # D. Accessibility difference
    base_acc = baseline_fields.get("accessibility_rating") or 0.0
    twin_acc = eco_twin_fields.get("accessibility_rating") or 0.0
    accessibility_difference = twin_acc - base_acc

    # E. Score difference
    base_score = baseline_fields.get("green_accessible_score") or 0
    twin_score = eco_twin_fields.get("green_accessible_score") or 0
    score_difference = twin_score - base_score

    return {
        "carbon_reduction_kg": round(carbon_reduction_kg, 2),
        "carbon_reduction_percent": round(carbon_reduction_percent, 2),
        "cost_difference": round(cost_difference, 2),
        "time_difference_minutes": time_difference_minutes,
        "accessibility_difference": round(accessibility_difference, 2),
        "score_difference": round(score_difference, 1),
    }


def generate_ecotwin_facts(
    baseline_fields: Dict[str, Any],
    eco_twin_fields: Dict[str, Any],
    comparison: Dict[str, Any],
    intent: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Generates non-hallucinated, mathematically accurate summary statements
    and 'Why Eco-Twin?' proof points.
    """
    intent = intent or {}
    budget = intent.get("budget")
    summary = []
    why_eco_twin = []

    c_pct = comparison.get("carbon_reduction_percent", 0.0)
    c_kg = comparison.get("carbon_reduction_kg", 0.0)
    cost_diff = comparison.get("cost_difference", 0.0)
    time_diff = comparison.get("time_difference_minutes", 0)
    acc_diff = comparison.get("accessibility_difference", 0.0)

    # 1. Carbon reduction summary & proof point
    if baseline_fields.get("carbon_status") == "unknown" or eco_twin_fields.get("carbon_status") == "unknown":
        c_claim = "Lower estimated carbon"
    elif c_pct > 0:
        c_claim = f"{int(round(c_pct))}% less carbon"
        why_eco_twin.append(f"Lower carbon emissions ({round(c_kg, 1)} kg CO₂e saved)")
    else:
        c_claim = "Comparable carbon footprint"
    summary.append(c_claim)

    # 2. Cost summary & proof point
    if cost_diff < 0:
        cost_claim = f"₹{int(abs(cost_diff)):,} cheaper"
        why_eco_twin.append(f"₹{int(abs(cost_diff)):,} cost savings over baseline")
    elif cost_diff > 0:
        cost_claim = f"₹{int(cost_diff):,} more"
        why_eco_twin.append(f"₹{int(cost_diff):,} premium for eco-transit")
    else:
        cost_claim = "Equal cost"
        why_eco_twin.append("Equal cost to baseline")
    summary.append(cost_claim)

    # 3. Time summary & proof point
    if time_diff > 0:
        time_claim = f"{time_diff} minutes longer"
        why_eco_twin.append(f"Only {time_diff} minutes longer travel time")
    elif time_diff < 0:
        time_claim = f"{abs(time_diff)} minutes faster"
        why_eco_twin.append(f"{abs(time_diff)} minutes faster journey")
    else:
        time_claim = "Same travel time"
        why_eco_twin.append("Same travel duration")
    summary.append(time_claim)

    # 4. Accessibility summary & proof point
    base_acc = baseline_fields.get("accessibility_rating")
    twin_acc = eco_twin_fields.get("accessibility_rating")
    twin_verified = eco_twin_fields.get("accessibility_verified", False)

    if base_acc is not None and twin_acc is not None:
        b_str = f"{int(base_acc) if float(base_acc).is_integer() else base_acc}/5"
        t_str = f"{int(twin_acc) if float(twin_acc).is_integer() else twin_acc}/5"
        if acc_diff > 0:
            summary.append(f"Accessibility improved from {b_str} to {t_str}")
        elif acc_diff == 0:
            summary.append(f"Accessibility maintained at {t_str}")
        else:
            summary.append(f"Accessibility: {t_str}")
    elif twin_acc is not None:
        summary.append(f"Accessibility: {twin_acc}/5")
    else:
        summary.append("Accessibility: unknown")

    if twin_verified:
        why_eco_twin.append("Step-free and verified accessible transit")
    elif acc_diff > 0:
        why_eco_twin.append(f"Better accessibility ({round(acc_diff, 1)} point improvement)")
    elif twin_acc and twin_acc >= 4.0:
        why_eco_twin.append(f"High accessibility rating ({twin_acc}/5)")

    # 5. Budget compliance proof point
    if budget is not None and budget > 0:
        twin_price = eco_twin_fields.get("price", {}).get("amount")
        if twin_price is not None:
            if twin_price <= budget:
                under = int(budget - twin_price)
                why_eco_twin.append(f"Within budget (₹{under:,} under limit)")
            else:
                over = int(twin_price - budget)
                why_eco_twin.append(f"Over budget by ₹{over:,}")

    # 6. Headline synthesis
    # Example: "45 minutes more, but ₹750 cheaper, 78% less carbon, and fully accessible."
    headline_parts = []
    if time_diff > 0:
        time_part = f"{time_diff} minutes more"
    elif time_diff < 0:
        time_part = f"{abs(time_diff)} minutes faster"
    else:
        time_part = "Same travel time"

    headline_parts.append(time_part)

    contrast_parts = []
    if cost_diff < 0:
        contrast_parts.append(f"₹{int(abs(cost_diff)):,} cheaper")
    elif cost_diff > 0:
        contrast_parts.append(f"₹{int(cost_diff):,} more")

    if c_pct > 0:
        contrast_parts.append(f"{int(round(c_pct))}% less carbon")

    if twin_verified and twin_acc == 5.0:
        contrast_parts.append("fully accessible")
    elif twin_acc and twin_acc >= 4.0:
        contrast_parts.append("highly accessible")

    if contrast_parts:
        headline = f"{time_part}, but {', '.join(contrast_parts)}."
    else:
        headline = f"Eco-friendly alternative: {c_claim}."

    return {
        "summary": summary,
        "headline": headline,
        "why_eco_twin": why_eco_twin,
    }


def generate_eco_twin(
    options: List[Dict[str, Any]],
    intent: Optional[Dict[str, Any]] = None,
    weights: Optional[Dict[str, float]] = None,
    baseline_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main entry point for Eco-Twin Generation.
    Takes ranked travel options and intent, deterministically finds the
    strongest sustainable alternative to the baseline, and returns
    the comprehensive Eco-Twin payload.
    """
    intent = intent or {}
    weights = weights or DEFAULT_WEIGHTS

    if not options:
        return {
            "available": False,
            "reason": "No travel options available to evaluate."
        }

    # 1. Identify baseline option
    baseline = identify_baseline_option(options, baseline_id=baseline_id)
    if not baseline:
        return {
            "available": False,
            "reason": "No baseline travel option could be determined."
        }

    # 2. Select best Eco-Twin candidate
    eco_twin_opt = select_eco_twin_candidate(
        options=options,
        baseline_option=baseline,
        intent=intent,
        weights=weights
    )

    if not eco_twin_opt:
        return {
            "available": False,
            "reason": "No suitable lower-carbon alternative found."
        }

    # 3. Standardize fields
    base_fields = extract_option_fields(baseline)
    twin_fields = extract_option_fields(eco_twin_opt)

    # 4. Compute deterministic comparison
    comparison = compute_ecotwin_comparison(base_fields, twin_fields)

    # 5. Generate factual explanations
    facts = generate_ecotwin_facts(base_fields, twin_fields, comparison, intent)

    # 6. Build transparent Show Your Math payload for Eco-Twin
    base_price_val = base_fields["price"].get("amount") if isinstance(base_fields.get("price"), dict) else None
    twin_price_val = twin_fields["price"].get("amount") if isinstance(twin_fields.get("price"), dict) else None
    currency_val = twin_fields["price"].get("currency", "INR") if isinstance(twin_fields.get("price"), dict) else "INR"

    show_your_math = {
        "carbon": {
            "baseline": base_fields["carbon_kg_co2e"],
            "eco_twin": twin_fields["carbon_kg_co2e"],
            "reduction_kg": comparison["carbon_reduction_kg"],
            "reduction_percent": comparison["carbon_reduction_percent"],
            "formula": "((baseline_carbon - eco_twin_carbon) / baseline_carbon) * 100"
        },
        "cost": {
            "baseline": base_price_val,
            "eco_twin": twin_price_val,
            "currency": currency_val,
            "difference": comparison["cost_difference"],
            "is_cheaper": comparison["cost_difference"] < 0,
            "formula": "eco_twin_cost - baseline_cost"
        },
        "time": {
            "baseline_minutes": base_fields["duration_minutes"],
            "eco_twin_minutes": twin_fields["duration_minutes"],
            "difference_minutes": comparison["time_difference_minutes"],
            "formula": "eco_twin_duration - baseline_duration"
        },
        "accessibility": {
            "baseline_rating": base_fields["accessibility_rating"],
            "eco_twin_rating": twin_fields["accessibility_rating"],
            "difference": comparison["accessibility_difference"],
            "baseline_status": base_fields.get("accessibility_status"),
            "eco_twin_status": twin_fields.get("accessibility_status"),
            "baseline_verified": base_fields.get("accessibility_verified"),
            "eco_twin_verified": twin_fields.get("accessibility_verified"),
            "formula": "eco_twin_accessibility - baseline_accessibility"
        },
        "score": {
            "baseline_score": base_fields.get("green_accessible_score"),
            "eco_twin_score": twin_fields.get("green_accessible_score"),
            "difference": comparison.get("score_difference")
        }
    }

    return {
        "available": True,
        "baseline_option_id": base_fields["id"],
        "eco_twin_option_id": twin_fields["id"],
        "weights": weights,
        "baseline": {
            "id": base_fields["id"],
            "title": base_fields["title"],
            "transport": base_fields["transport"],
            "mode": base_fields["mode"],
            "price": base_fields["price"],
            "duration_minutes": base_fields["duration_minutes"],
            "carbon_kg_co2e": base_fields["carbon_kg_co2e"],
            "carbon_status": base_fields["carbon_status"],
            "accessibility_rating": base_fields["accessibility_rating"],
            "accessibility_status": base_fields["accessibility_status"],
            "accessibility_verified": base_fields["accessibility_verified"],
            "confidence": base_fields.get("confidence", 0),
            "sources": base_fields.get("sources", []),
            "status_label": base_fields.get("status_label", "Unknown"),
            "wheelchair_accessible": base_fields.get("wheelchair_accessible"),
            "step_free": base_fields.get("step_free"),
            "evidence_details": base_fields.get("evidence_details", []),
            "green_accessible_score": base_fields["green_accessible_score"],
        },
        "eco_twin": {
            "id": twin_fields["id"],
            "title": twin_fields["title"],
            "transport": twin_fields["transport"],
            "mode": twin_fields["mode"],
            "price": twin_fields["price"],
            "duration_minutes": twin_fields["duration_minutes"],
            "carbon_kg_co2e": twin_fields["carbon_kg_co2e"],
            "carbon_status": twin_fields["carbon_status"],
            "accessibility_rating": twin_fields["accessibility_rating"],
            "accessibility_status": twin_fields["accessibility_status"],
            "accessibility_verified": twin_fields["accessibility_verified"],
            "confidence": twin_fields.get("confidence", 90),
            "sources": twin_fields.get("sources", []),
            "status_label": twin_fields.get("status_label", "Verified"),
            "wheelchair_accessible": twin_fields.get("wheelchair_accessible"),
            "step_free": twin_fields.get("step_free"),
            "evidence_details": twin_fields.get("evidence_details", []),
            "green_accessible_score": twin_fields["green_accessible_score"],
        },
        "comparison": comparison,
        "show_your_math": show_your_math,
        "summary": facts["summary"],
        "headline": facts["headline"],
        "why_eco_twin": facts["why_eco_twin"],
    }
