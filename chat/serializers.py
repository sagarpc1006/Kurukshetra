from rest_framework import serializers

class ChatRequestSerializer(serializers.Serializer):
    """Validates the incoming chat request from React."""
    message = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True,
        error_messages={
            "required": "The message field is required.",
            "blank": "Message cannot be empty.",
        }
    )

class TravelIntentSerializer(serializers.Serializer):
    """Validates the structured travel intent schema."""
    origin = serializers.CharField(allow_null=True, required=False)
    destination = serializers.CharField(allow_null=True, required=False)
    duration_days = serializers.IntegerField(allow_null=True, required=False)
    budget = serializers.FloatField(allow_null=True, required=False)
    currency = serializers.CharField(default="INR", allow_null=True, required=False, max_length=10)
    eco_priority = serializers.CharField(allow_null=True, required=False)
    accessibility_required = serializers.BooleanField(default=False)
    wheelchair_required = serializers.BooleanField(default=False)
    step_free_required = serializers.BooleanField(default=False)
    travel_dates = serializers.CharField(allow_null=True, required=False)
    transport_preference = serializers.CharField(allow_null=True, required=False)
