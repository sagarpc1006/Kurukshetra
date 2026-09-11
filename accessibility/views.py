from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import AccessibilityProfile, AccessibilityEvidence, AccessibilityVerification
from .serializers import (
    AccessibilityProfileSerializer,
    PhotoVerificationUploadSerializer,
    AccessibilityEvidenceSerializer
)
from .services.verification import analyze_accessibility_photo


class AccessibilityProfileView(APIView):
    """
    GET: Retrieve the user's accessibility requirements & preferences.
    POST / PATCH: Create or update accessibility profile.
    """
    permission_classes = [AllowAny]

    def _get_profile(self, request):
        user = getattr(request, 'user', None)
        if user and getattr(user, 'is_authenticated', False) and hasattr(user, 'firebase_uid'):
            profile = AccessibilityProfile.objects.filter(user=user).first()
            if not profile:
                profile, _ = AccessibilityProfile.objects.get_or_create(
                    user=user,
                    defaults={'client_id': f"user_{user.firebase_uid}"}
                )
            return profile

        client_id = (
            request.headers.get("X-Client-ID") or
            request.query_params.get("client_id") or
            (request.data.get("client_id") if hasattr(request, 'data') and isinstance(request.data, dict) else None) or
            "default_traveler"
        )
        profile, _ = AccessibilityProfile.objects.get_or_create(client_id=client_id)
        return profile

    def get(self, request):
        profile = self._get_profile(request)
        serializer = AccessibilityProfileSerializer(profile)
        return Response({"success": True, "profile": serializer.data})

    def post(self, request):
        return self._save_profile(request)

    def patch(self, request):
        return self._save_profile(request)

    def _save_profile(self, request):
        profile = self._get_profile(request)
        serializer = AccessibilityProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"success": True, "profile": serializer.data})
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class PhotoVerificationView(APIView):
    """
    POST /api/accessibility/verify-photo/
    Analyzes uploaded photograph of an accessibility feature (ramp, step-free entrance, elevator, etc.).
    Returns verified evidence with confidence score without fabricating invisible claims.
    """
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = PhotoVerificationUploadSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        image_file = serializer.validated_data["image"]
        claim_type = serializer.validated_data.get("claim_type", "step_free_entrance")

        # Read image bytes
        image_bytes = image_file.read()
        mime_type = getattr(image_file, "content_type", "image/jpeg")

        # Run vision analysis pipeline
        analysis_result = analyze_accessibility_photo(
            image_bytes=image_bytes,
            mime_type=mime_type,
            claim_type=claim_type
        )

        # Save verification record
        record = AccessibilityVerification.objects.create(
            claim_type=claim_type,
            image=image_file,
            model_used=analysis_result.get("model_used", "gemini-2.5-flash"),
            detected=analysis_result.get("detected", False),
            confidence=analysis_result.get("confidence", 0.0),
            status=analysis_result.get("status", "unknown"),
            evidence=analysis_result.get("evidence", ""),
        )

        return Response({
            "success": True,
            "verification": {
                "id": record.id,
                "claim_type": record.claim_type,
                "detected": record.detected,
                "confidence": record.confidence,
                "status": record.status,
                "evidence": record.evidence,
                "limitations": analysis_result.get("limitations", "Single photo verification limits apply"),
            }
        }, status=status.HTTP_200_OK)


class AccessibilityEntityDetailView(APIView):
    """
    GET /api/accessibility/<entity_id>/
    Returns transparent field-level evidence records for an entity.
    """
    permission_classes = [AllowAny]
    def get(self, request, entity_id):
        evidence_qs = AccessibilityEvidence.objects.filter(entity_id=entity_id)
        serializer = AccessibilityEvidenceSerializer(evidence_qs, many=True)
        return Response({
            "success": True,
            "entity_id": entity_id,
            "evidence": serializer.data
        })
