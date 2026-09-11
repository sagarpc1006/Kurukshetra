import re
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import UserProfile
from .firebase import verify_firebase_token

def index(request):
    return HttpResponse("Travel Recommendation System Backend API")

@api_view(['POST'])
@permission_classes([AllowAny])
def firebase_auth_sync(request):
    """
    POST /api/auth/firebase/
    Payload: {"id_token": "<FIREBASE_ID_TOKEN>"}

    1. Receives Firebase ID token.
    2. Verifies it using Firebase Admin SDK.
    3. Extracts uid, email, name, picture.
    4. Finds or creates corresponding UserProfile in PostgreSQL.
    5. Returns application user info.
    """
    id_token = request.data.get('id_token')
    if not id_token or not isinstance(id_token, str) or not id_token.strip():
        return Response(
            {"error": "id_token is required in request body."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        decoded_token = verify_firebase_token(id_token)
    except Exception as e:
        return Response(
            {"error": f"Invalid or expired Firebase ID token: {str(e)}"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    uid = decoded_token.get('uid') or decoded_token.get('user_id') or decoded_token.get('sub')
    if not uid:
        return Response(
            {"error": "Token payload missing UID."},
            status=status.HTTP_400_BAD_REQUEST
        )

    email = decoded_token.get('email', '')
    name = decoded_token.get('name', '') or decoded_token.get('display_name', '')
    picture = decoded_token.get('picture', '')

    # Find or create UserProfile in PostgreSQL
    user_profile, created = UserProfile.objects.get_or_create(
        firebase_uid=uid,
        defaults={
            'email': email,
            'name': name,
            'display_name': name,
            'photo_url': picture,
        }
    )

    # Sync fields if updated in Firebase
    updated_fields = []
    if email and user_profile.email != email:
        user_profile.email = email
        updated_fields.append('email')
    if name and (user_profile.name != name or user_profile.display_name != name):
        user_profile.name = name
        user_profile.display_name = name
        updated_fields.extend(['name', 'display_name'])
    if picture and not user_profile.photo_url:
        user_profile.photo_url = picture
        updated_fields.append('photo_url')

    if updated_fields:
        updated_fields.append('updated_at')
        user_profile.save(update_fields=list(set(updated_fields)))

    return Response(user_profile.to_dict(), status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_profile(request):
    """
    GET /api/auth/me/
    Returns the authenticated user's profile from PostgreSQL.
    """
    user_profile = request.user
    if not isinstance(user_profile, UserProfile):
        return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

    return Response(user_profile.to_dict())

@api_view(['GET', 'POST', 'PATCH', 'PUT'])
@permission_classes([IsAuthenticated])
def user_preferences_view(request):
    """
    GET /api/profile/
    Returns the authenticated user's travel preferences.

    POST / PATCH / PUT /api/profile/
    Updates the authenticated user's travel preferences in PostgreSQL.
    """
    user_profile = request.user
    if not isinstance(user_profile, UserProfile):
        return Response({"error": "User profile not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        return Response({
            "success": True,
            "profile": user_profile.to_dict()
        })

    # Update preferences
    data = request.data
    update_fields = []

    if 'display_name' in data:
        val = str(data['display_name']).strip()
        user_profile.display_name = val
        user_profile.name = val
        update_fields.extend(['display_name', 'name'])
    elif 'name' in data:
        val = str(data['name']).strip()
        user_profile.name = val
        user_profile.display_name = val
        update_fields.extend(['display_name', 'name'])

    if 'preferred_currency' in data:
        user_profile.preferred_currency = str(data['preferred_currency']).upper()
        update_fields.append('preferred_currency')

    if 'eco_priority' in data:
        user_profile.eco_priority = str(data['eco_priority'])
        update_fields.append('eco_priority')

    if 'preferred_transport' in data:
        user_profile.preferred_transport = str(data['preferred_transport'])
        update_fields.append('preferred_transport')

    if 'home_city' in data:
        user_profile.home_city = str(data['home_city']).strip()
        update_fields.append('home_city')

    if 'photo_url' in data:
        user_profile.photo_url = str(data['photo_url']).strip()
        update_fields.append('photo_url')

    if 'budget_preference' in data or 'budget' in data:
        raw_budget = data.get('budget_preference', data.get('budget'))
        if raw_budget is not None:
            if isinstance(raw_budget, (int, float)):
                user_profile.budget_preference = int(raw_budget)
                update_fields.append('budget_preference')
            elif isinstance(raw_budget, str):
                cleaned = re.sub(r'[^\d]', '', raw_budget)
                if cleaned:
                    user_profile.budget_preference = int(cleaned)
                    update_fields.append('budget_preference')

    if update_fields:
        update_fields.append('updated_at')
        user_profile.save(update_fields=list(set(update_fields)))

    return Response({
        "success": True,
        "message": "Preferences updated successfully.",
        "profile": user_profile.to_dict()
    }, status=status.HTTP_200_OK)
