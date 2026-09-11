"""
Deterministic Accessibility Scoring Service (Step 5 - 'Verified, Not Claimed').
Transforms accessibility ratings, features, and multi-source evidence into standardized
0-100 scores and assigns truthful verification statuses without fabricating accessibility claims.
"""

from typing import Dict, Any, Optional, List
from accessibility.services.confidence import calculate_accessibility_confidence


def calculate_accessibility_score(access_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Computes deterministic accessibility score, confidence, and verification status.

    Formula:
        AccessScore = accessibility_rating * 20  (for rating in 0..5)

    Handles:
    - Rating (0..5)
    - Specific boolean tags (step_free, wheelchair_accessible, accessible_vehicle, accessible_entry, accessible_toilet, elevator)
    - Source tracking ('photo_verification', 'business_declaration', 'osm', 'provider_data', 'unknown')
    - Verification status ('verified', 'business_declared', 'osm_supported', 'ai_supported', 'unknown', 'conflicting')
    - Deterministic confidence score (0..100)
    - Missing / null data -> conservative default (rating=2.5, score=50, status="unknown", confidence=0)

    Returns:
        {
            "accessibility_rating": float,
            "accessibility_score": int,
            "accessibility_verified": bool,
            "accessibility_status": str,
            "confidence": int,
            "wheelchair_accessible": bool or None,
            "step_free": bool or None,
            "accessible_vehicle": bool or None,
            "accessible_entry": bool or None,
            "accessible_toilet": bool or None,
            "elevator": bool or None,
            "reduced_walking": bool or None,
            "sources": list,
            "evidence_details": list,
            "status_label": str
        }
    """
    if not access_data or not isinstance(access_data, dict):
        return {
            "accessibility_rating": 2.5,
            "accessibility_score": 50,
            "accessibility_verified": False,
            "accessibility_status": "unknown",
            "confidence": 0,
            "wheelchair_accessible": None,
            "step_free": None,
            "accessible_vehicle": None,
            "accessible_entry": None,
            "accessible_toilet": None,
            "elevator": None,
            "reduced_walking": None,
            "sources": ["unknown"],
            "evidence_details": [],
            "status_label": "Accessibility unconfirmed"
        }

    # Features extraction
    wheelchair = access_data.get("wheelchair_accessible")
    if wheelchair is None and "wheelchair" in access_data:
        wheelchair = access_data.get("wheelchair")

    step_free = access_data.get("step_free")
    accessible_vehicle = access_data.get("accessible_vehicle")
    accessible_entry = access_data.get("accessible_entry")
    accessible_toilet = access_data.get("accessible_toilet")
    elevator = access_data.get("elevator")
    reduced_walking = access_data.get("reduced_walking")

    # Sources
    raw_sources = access_data.get("sources")
    if isinstance(raw_sources, list):
        sources = list(raw_sources)
    elif access_data.get("source"):
        sources = [access_data.get("source")]
    else:
        sources = []

    verified = bool(access_data.get("verified", False) or access_data.get("accessibility_verified", False))
    raw_status = access_data.get("status") or access_data.get("accessibility_status") or access_data.get("verification_status")

    # Determine status if not explicitly given
    if raw_status:
        status = raw_status
    elif verified or "photo_verification" in sources:
        status = "verified"
    elif "osm" in sources or access_data.get("source") == "osm":
        status = "osm_supported"
    elif "business_declaration" in sources or access_data.get("source") == "business_declaration":
        status = "business_declared"
    elif any(x is not None for x in (wheelchair, step_free, accessible_vehicle, accessible_entry)):
        status = "declared"
    else:
        status = "unknown"

    # Normalize status names to project standard
    if status == "declared":
        status = "business_declared"
    elif status == "osm_data":
        status = "osm_supported"

    if status not in ("verified", "business_declared", "osm_supported", "ai_supported", "unknown", "conflicting"):
        status = "unknown"

    # Only mark verified if actual verification exists
    actual_verified = (status == "verified")

    # Confidence calculation
    conf = access_data.get("confidence")
    if conf is None or not isinstance(conf, (int, float)):
        conf = calculate_accessibility_confidence(
            sources=sources if sources else ([status] if status != "unknown" else []),
            verification_status=status,
            has_visual_evidence=("photo_verification" in sources or status == "verified")
        )
    else:
        conf = int(conf)

    # Rating calculation
    raw_rating = access_data.get("rating")
    if raw_rating is None:
        raw_rating = access_data.get("accessibility_rating")

    if raw_rating is not None and isinstance(raw_rating, (int, float)):
        clamped_rating = max(0.0, min(5.0, float(raw_rating)))
        score = int(round(clamped_rating * 20.0))
        final_rating = round(clamped_rating, 1)
    else:
        # Compute rating from features
        if step_free is True and wheelchair is True:
            final_rating = 5.0 if actual_verified else 4.5
        elif step_free is True or wheelchair is True:
            final_rating = 4.0
        elif step_free is False or wheelchair is False:
            final_rating = 1.5
        else:
            final_rating = 2.5 # conservative unknown
        score = int(round(final_rating * 20.0))

    # Evidence details
    evidence_details = access_data.get("evidence_details") or []
    if not evidence_details:
        if wheelchair is not None:
            evidence_details.append({
                "field": "wheelchair_accessible",
                "value": wheelchair,
                "source": sources[0] if sources else "declaration",
                "status": status,
                "verified": actual_verified
            })
        if step_free is not None:
            evidence_details.append({
                "field": "step_free",
                "value": step_free,
                "source": sources[0] if sources else "declaration",
                "status": status,
                "verified": actual_verified
            })

    # Friendly status label
    if status == "verified":
        status_label = "Verified"
    elif status == "osm_supported":
        status_label = "OSM data"
    elif status == "business_declared":
        status_label = "Business reported"
    elif status == "ai_supported":
        status_label = "AI detected"
    elif status == "conflicting":
        status_label = "Conflicting reports"
    else:
        status_label = "Unknown"

    return {
        "accessibility_rating": final_rating,
        "accessibility_score": score,
        "accessibility_verified": actual_verified,
        "accessibility_status": status,
        "confidence": conf,
        "wheelchair_accessible": wheelchair,
        "step_free": step_free,
        "accessible_vehicle": accessible_vehicle,
        "accessible_entry": accessible_entry,
        "accessible_toilet": accessible_toilet,
        "elevator": elevator,
        "reduced_walking": reduced_walking,
        "sources": sources if sources else [status],
        "evidence_details": evidence_details,
        "status_label": status_label,
        # backward compatibility
        "features": {
            "step_free": step_free,
            "wheelchair_accessible": wheelchair
        }
    }
