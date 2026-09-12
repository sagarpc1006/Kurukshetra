from django.urls import path
from .views import AccessibilityProfileView, PhotoVerificationView, AccessibilityEntityDetailView

urlpatterns = [
    path("profile/", AccessibilityProfileView.as_view(), name="accessibility_profile"),
    path("verify-photo/", PhotoVerificationView.as_view(), name="accessibility_verify_photo"),
    path("<str:entity_id>/", AccessibilityEntityDetailView.as_view(), name="accessibility_entity_detail"),
]
