from rest_framework import serializers
from .models import AccessibilityProfile, AccessibilityEvidence, AccessibilityVerification
from .services.verification import validate_image_file


class AccessibilityProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True, source='user.id', default=None)

    class Meta:
        model = AccessibilityProfile
        fields = [
            "user_id",
            "client_id",
            "wheelchair_required",
            "step_free_required",
            "accessible_vehicle_required",
            "accessible_venue_required",
            "accessible_toilet_preferred",
            "elevator_preferred",
            "reduced_walking",
            "updated_at",
            "created_at",
        ]
        read_only_fields = ["user_id", "created_at", "updated_at"]


class AccessibilityEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AccessibilityEvidence
        fields = [
            "id",
            "entity_id",
            "field",
            "value",
            "source",
            "verification_status",
            "confidence",
            "evidence_reference",
            "created_at",
        ]


class PhotoVerificationUploadSerializer(serializers.Serializer):
    image = serializers.ImageField(required=True)
    claim_type = serializers.CharField(max_length=100, required=False, default="step_free_entrance")

    def validate_image(self, value):
        is_valid, err_msg = validate_image_file(value)
        if not is_valid:
            raise serializers.ValidationError(err_msg)
        return value
