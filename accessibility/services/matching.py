"""
Deterministic Accessibility Matching Engine.
Compares a traveler's explicit accessibility profile requirements against
an option's/venue's/transport's accessibility properties.
Hard requirements (wheelchair, step-free) strictly disqualify incompatible or unknown options.
"""

from typing import Dict, Any, List, Optional

def match_accessibility_requirements(
    user_profile: Optional[Dict[str, Any]],
    entity_accessibility: Optional[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Evaluates compatibility between traveler requirements and entity features.
    
    Rules:
    - If a hard requirement is False -> INCOMPATIBLE
    - If a hard requirement is UNKNOWN -> INCOMPATIBLE (never assume accessibility)
    - If a preference is missing -> COMPATIBLE, but match_score reduced with warning.
    
    Returns:
        {
            "compatible": bool,
            "match_score": int (0-100),
            "matched_requirements": list,
            "missing_requirements": list,
            "unknown_requirements": list,
            "warnings": list
        }
    """
    user_profile = user_profile or {}
    entity = entity_accessibility or {}

    # Extract user requirements
    wheelchair_req = bool(user_profile.get("wheelchair_required", False))
    step_free_req = bool(user_profile.get("step_free_required", False))
    accessible_vehicle_req = bool(user_profile.get("accessible_vehicle_required", False))
    accessible_venue_req = bool(user_profile.get("accessible_venue_required", False))

    # Preferences
    toilet_pref = bool(user_profile.get("accessible_toilet_preferred", False))
    elevator_pref = bool(user_profile.get("elevator_preferred", False))
    reduced_walking = bool(user_profile.get("reduced_walking", False))

    # Normalize entity features
    # Support both flat and nested 'features' structure
    feats = entity.get("features") if isinstance(entity.get("features"), dict) else entity

    w_access = feats.get("wheelchair_accessible")
    if w_access is None and "wheelchair" in feats:
        w_access = feats.get("wheelchair")

    sf_access = feats.get("step_free")
    v_access = feats.get("accessible_vehicle")
    if v_access is None and w_access is True:
        v_access = True
    entry_access = feats.get("accessible_entry")
    if entry_access is None and (w_access is True or sf_access is True):
        entry_access = True
    toilet_access = feats.get("accessible_toilet")
    elev_access = feats.get("elevator")
    rw_access = feats.get("reduced_walking")

    matched = []
    missing = []
    unknown = []
    warnings = []
    compatible = True

    # 1. Evaluate Hard Requirements
    hard_checks = [
        ("wheelchair", wheelchair_req, w_access, "Wheelchair accessibility"),
        ("step_free", step_free_req, sf_access, "Step-free routes / ramps"),
        ("accessible_vehicle", accessible_vehicle_req, v_access, "Accessible vehicle"),
        ("accessible_venue", accessible_venue_req, entry_access, "Accessible venue entrance"),
    ]

    for req_key, is_required, entity_val, req_label in hard_checks:
        if is_required:
            if entity_val is True:
                matched.append(req_key)
            elif entity_val is False:
                compatible = False
                missing.append(req_key)
                warnings.append(f"{req_label} is not available")
            else: # None / unknown
                compatible = False
                unknown.append(req_key)
                warnings.append(f"{req_label} information is unknown / unconfirmed")

    # 2. Evaluate Soft Preferences
    pref_checks = [
        ("accessible_toilet", toilet_pref, toilet_access, "Accessible toilet"),
        ("elevator", elevator_pref, elev_access, "Elevator / lift"),
        ("reduced_walking", reduced_walking, rw_access, "Reduced walking transfers"),
    ]

    pref_count = 0
    pref_matched = 0

    for pref_key, is_preferred, entity_val, pref_label in pref_checks:
        if is_preferred:
            pref_count += 1
            if entity_val is True:
                matched.append(pref_key)
                pref_matched += 1
            elif entity_val is False:
                missing.append(pref_key)
                warnings.append(f"Preferred {pref_label.lower()} may not be available")
            else:
                unknown.append(pref_key)
                warnings.append(f"{pref_label} availability is unconfirmed")

    # Calculate match score (0-100)
    if not compatible:
        match_score = 0
    else:
        if pref_count > 0:
            match_score = int(70 + (30 * (pref_matched / pref_count)))
        else:
            match_score = 100

    return {
        "compatible": compatible,
        "match_score": match_score,
        "matched_requirements": matched,
        "missing_requirements": missing,
        "unknown_requirements": unknown,
        "warnings": warnings,
    }
