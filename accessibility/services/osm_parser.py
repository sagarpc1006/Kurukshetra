"""
OpenStreetMap / OSM Accessibility Tags Parser.
Extracts factual accessibility properties from OSM / Overpass raw node/way tags.
Enforces the 'Verified, Not Claimed' rule: OSM data produces 'osm_supported', NEVER 'verified'.
"""

from typing import Dict, Any

def parse_osm_accessibility_tags(tags: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parses OSM tags:
    - wheelchair (yes, no, limited, designated)
    - wheelchair:entrance
    - wheelchair:description
    - toilets:wheelchair
    - elevator
    - ramp
    - kerb (flush, lowered, raised)
    - surface, smoothness

    Returns structured accessibility dictionary with status 'osm_supported' or 'unknown'.
    """
    tags = tags or {}

    wheelchair_val = tags.get("wheelchair", "").strip().lower()
    wheelchair_entrance = tags.get("wheelchair:entrance", "").strip().lower()
    toilets_wheelchair = tags.get("toilets:wheelchair", "").strip().lower()
    elevator_val = tags.get("elevator", "").strip().lower()
    ramp_val = tags.get("ramp", "").strip().lower()
    kerb_val = tags.get("kerb", "").strip().lower()

    wheelchair_accessible = None
    step_free = None
    accessible_entry = None
    accessible_toilet = None
    elevator = None

    has_any_osm_tag = False

    # 1. Wheelchair general accessibility
    if wheelchair_val in ("yes", "designated"):
        wheelchair_accessible = True
        has_any_osm_tag = True
    elif wheelchair_val == "limited":
        wheelchair_accessible = True # with limitations
        has_any_osm_tag = True
    elif wheelchair_val == "no":
        wheelchair_accessible = False
        has_any_osm_tag = True

    # 2. Entrance accessibility
    if wheelchair_entrance in ("yes", "designated") or ramp_val in ("yes", "automatic"):
        accessible_entry = True
        step_free = True
        has_any_osm_tag = True
    elif wheelchair_entrance == "no":
        accessible_entry = False
        has_any_osm_tag = True

    # Kerb inspection
    if kerb_val in ("flush", "lowered"):
        step_free = True
        has_any_osm_tag = True
    elif kerb_val == "raised":
        if step_free is None:
            step_free = False
        has_any_osm_tag = True

    # 3. Accessible toilet
    if toilets_wheelchair in ("yes", "designated"):
        accessible_toilet = True
        has_any_osm_tag = True
    elif toilets_wheelchair == "no":
        accessible_toilet = False
        has_any_osm_tag = True

    # 4. Elevator / lift
    if elevator_val in ("yes", "designated"):
        elevator = True
        has_any_osm_tag = True
    elif elevator_val == "no":
        elevator = False
        has_any_osm_tag = True

    if not has_any_osm_tag:
        return {
            "wheelchair_accessible": None,
            "step_free": None,
            "accessible_entry": None,
            "accessible_toilet": None,
            "elevator": None,
            "source": "osm",
            "verification_status": "unknown",
            "confidence": 0,
            "label": "OSM: No accessibility tags found"
        }

    return {
        "wheelchair_accessible": wheelchair_accessible,
        "step_free": step_free,
        "accessible_entry": accessible_entry,
        "accessible_toilet": accessible_toilet,
        "elevator": elevator,
        "source": "osm",
        "verification_status": "osm_supported", # NEVER 'verified'
        "confidence": 60,
        "label": "Wheelchair: Yes — OSM data" if wheelchair_accessible else "OSM data"
    }
