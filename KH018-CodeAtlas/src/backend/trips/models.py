from django.db import models

class SavedTrip(models.Model):
    """
    Persisted travel itinerary and booking plan saved by authenticated users.
    Stores multimodal options, verified eco-twin alternatives, and day-by-day itineraries.
    Strictly bound to myapp.UserProfile via foreign key cascade.
    """
    user = models.ForeignKey(
        'myapp.UserProfile',
        on_delete=models.CASCADE,
        related_name='saved_trips',
        db_index=True
    )
    title = models.CharField(max_length=255)
    origin = models.CharField(max_length=150)
    destination = models.CharField(max_length=150)
    duration_days = models.IntegerField(default=1)
    travel_dates = models.CharField(max_length=100, blank=True, default='')
    transport_mode = models.CharField(max_length=100, blank=True, default='')
    total_cost = models.IntegerField(default=0)
    currency = models.CharField(max_length=10, default='INR')
    eco_score = models.IntegerField(default=0)
    carbon_emissions = models.FloatField(default=0.0, help_text="Total journey carbon emissions in kg CO2e")
    carbon_saved = models.CharField(max_length=100, blank=True, default='')
    accessibility_rating = models.FloatField(default=0.0)
    accessibility_verified = models.BooleanField(default=False)
    status = models.CharField(max_length=50, default='Saved') # 'Saved', 'Planned', 'Completed'
    cover_image = models.URLField(max_length=1024, blank=True, default='')
    stays = models.CharField(max_length=255, blank=True, default='Verified Eco Homestay')

    # Detailed structured payloads from pipeline
    itinerary_data = models.JSONField(default=dict, blank=True)
    recommendation_data = models.JSONField(default=dict, blank=True)
    eco_twin_data = models.JSONField(default=dict, blank=True)
    show_your_math_data = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Trip {self.id}: {self.origin} -> {self.destination} ({self.user.email})"

    def to_dict(self):
        default_cover = "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80"
        cost_formatted = f"₹{self.total_cost:,}" if self.currency == "INR" else f"{self.currency} {self.total_cost:,}"
        dur_str = f"{self.duration_days} Days" if self.duration_days > 1 else f"{self.duration_days} Day"

        return {
            "id": self.id,
            "title": self.title or f"{self.origin} to {self.destination}",
            "origin": self.origin,
            "destination": self.destination,
            "duration": dur_str,
            "duration_days": self.duration_days,
            "travelDates": self.travel_dates or "Upcoming Journey",
            "transport": self.transport_mode or "Eco Transit",
            "totalCost": cost_formatted,
            "raw_cost": self.total_cost,
            "currency": self.currency,
            "carbonEmissions": f"{self.carbon_emissions:.1f} kg CO₂e",
            "raw_carbon": self.carbon_emissions,
            "carbonSaved": self.carbon_saved or "Low carbon route",
            "ecoScore": self.eco_score,
            "status": self.status,
            "coverImage": self.cover_image or default_cover,
            "stays": self.stays,
            "accessibility": {
                "rating": self.accessibility_rating,
                "verified": self.accessibility_verified,
            },
            "itinerary": self.itinerary_data,
            "recommendation": self.recommendation_data,
            "eco_twin": self.eco_twin_data,
            "show_your_math": self.show_your_math_data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
