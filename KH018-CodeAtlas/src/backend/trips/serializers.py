from rest_framework import serializers
from .models import SavedTrip

class SavedTripCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedTrip
        fields = [
            'title',
            'origin',
            'destination',
            'duration_days',
            'travel_dates',
            'transport_mode',
            'total_cost',
            'currency',
            'eco_score',
            'carbon_emissions',
            'carbon_saved',
            'accessibility_rating',
            'accessibility_verified',
            'status',
            'cover_image',
            'stays',
            'itinerary_data',
            'recommendation_data',
            'eco_twin_data',
            'show_your_math_data',
        ]

    def validate_origin(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Trip origin cannot be empty.")
        return str(value).strip()

    def validate_destination(self, value):
        if not value or not str(value).strip():
            raise serializers.ValidationError("Trip destination cannot be empty.")
        return str(value).strip()
