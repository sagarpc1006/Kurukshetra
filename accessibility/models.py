from django.db import models


class AccessibilityProfile(models.Model):
    """
    User/Traveler accessibility profile.
    Stores explicit accessibility requirements and preferences without requiring
    unnecessary sensitive medical disclosures.
    """
    user = models.OneToOneField('myapp.UserProfile', on_delete=models.CASCADE, null=True, blank=True, related_name='accessibility_profile')
    client_id = models.CharField(max_length=120, unique=True, default="default_traveler", db_index=True)
    wheelchair_required = models.BooleanField(default=False, help_text="Wheelchair boarding and transit required")
    step_free_required = models.BooleanField(default=False, help_text="Step-free routes and ramps required")
    accessible_vehicle_required = models.BooleanField(default=False, help_text="Accessible low-floor / ramp vehicle required")
    accessible_venue_required = models.BooleanField(default=False, help_text="Accessible entrance and venue required")
    accessible_toilet_preferred = models.BooleanField(default=False, help_text="Accessible restroom preferred")
    elevator_preferred = models.BooleanField(default=False, help_text="Elevator / lift preferred over stairs")
    reduced_walking = models.BooleanField(default=False, help_text="Minimize walking distance between transfers")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        user_str = f" - User: {self.user.email}" if self.user else ""
        return f"AccessibilityProfile({self.client_id}{user_str})"

    def to_dict(self):
        return {
            "user_id": self.user_id if self.user_id else None,
            "client_id": self.client_id,
            "wheelchair_required": self.wheelchair_required,
            "step_free_required": self.step_free_required,
            "accessible_vehicle_required": self.accessible_vehicle_required,
            "accessible_venue_required": self.accessible_venue_required,
            "accessible_toilet_preferred": self.accessible_toilet_preferred,
            "elevator_preferred": self.elevator_preferred,
            "reduced_walking": self.reduced_walking,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class AccessibilityEvidence(models.Model):
    """
    Field-level transparent evidence record for an entity (transport mode, station, hotel, attraction).
    Maintains the 'Verified, Not Claimed' distinction across all sources.
    """
    SOURCE_CHOICES = [
        ("photo_verification", "Photo Verification"),
        ("business_declaration", "Business Declaration"),
        ("osm", "OpenStreetMap"),
        ("provider_data", "Provider Structured Data"),
        ("unknown", "Unknown"),
    ]

    STATUS_CHOICES = [
        ("verified", "Verified"),
        ("business_declared", "Business Declared"),
        ("osm_supported", "OSM Supported"),
        ("ai_supported", "AI Supported"),
        ("unknown", "Unknown"),
        ("conflicting", "Conflicting"),
    ]

    entity_id = models.CharField(max_length=200, db_index=True)
    field = models.CharField(max_length=100) # e.g. wheelchair_accessible, step_free, accessible_toilet
    value = models.BooleanField(null=True, blank=True)
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default="unknown")
    verification_status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="unknown")
    confidence = models.IntegerField(default=50, help_text="0-100 evidence confidence score")
    evidence_reference = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.entity_id} - {self.field}: {self.value} ({self.verification_status})"


class AccessibilityVerification(models.Model):
    """
    Visual evidence analysis record from uploaded accessibility photos
    (ramps, step-free entrances, elevators, accessible vehicles).
    """
    claim_type = models.CharField(max_length=100) # e.g. step_free_entrance, ramp, elevator, accessible_toilet
    image = models.ImageField(upload_to="accessibility_photos/%Y/%m/", null=True, blank=True)
    model_used = models.CharField(max_length=100, default="gemini-2.0-flash")
    detected = models.BooleanField(default=False)
    confidence = models.FloatField(default=0.0)
    status = models.CharField(max_length=50, default="unknown")
    evidence = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Verification({self.claim_type}: {self.status} - {self.confidence:.2f})"
