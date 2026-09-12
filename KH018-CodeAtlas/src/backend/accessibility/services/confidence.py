"""
Deterministic Accessibility Confidence Score Service.
Calculates transparent, mathematical confidence in accessibility information
based on the quality and consensus of supporting evidence sources.
"""

from typing import List, Dict, Any, Optional

def calculate_accessibility_confidence(
    sources: Optional[List[str]] = None,
    verification_status: str = "unknown",
    has_visual_evidence: bool = False,
    is_conflicting: bool = False
) -> int:
    """
    Computes a deterministic confidence score (0 to 100) reflecting evidence quality:
    - Photo / accepted verification: 90 - 95
    - Multiple consistent independent sources: 75 - 85
    - Business declaration alone: 60 - 70
    - OSM data alone: 50 - 65
    - Conflicting sources: 20 - 30
    - Missing / unknown data: 0
    """
    sources = sources or []

    if is_conflicting or verification_status == "conflicting":
        return 25

    if not sources or verification_status == "unknown":
        return 0

    # Highest confidence: Verified visual proof or certified audit
    if "photo_verification" in sources or verification_status == "verified":
        return 92 if has_visual_evidence else 90

    # Multi-source consensus (e.g. OSM + Business or Provider)
    distinct_sources = set(sources)
    if len(distinct_sources) >= 2:
        return 80

    # Single source evaluation
    if "business_declaration" in sources or verification_status == "business_declared":
        return 65

    if "osm" in sources or verification_status == "osm_supported":
        return 55

    if "provider_data" in sources:
        return 60

    if verification_status == "ai_supported":
        return 75

    return 40
