from django.http import HttpResponse, JsonResponse
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
    Payload: {"id_token": "<FIREBASE_ID_TOKEN>"} or Authorization: Bearer <ID_TOKEN>

    1. Checks if request.user is already authenticated by FirebaseAuthentication.
    2. Otherwise receives and verifies Firebase ID token using public Google certs.
    3. Finds or creates corresponding UserProfile.
    4. Returns application user info.
    """
    # If already authenticated by FirebaseAuthentication via Bearer token in header
    if hasattr(request, 'user') and isinstance(request.user, UserProfile) and request.user.is_authenticated:
        return Response({
            "id": request.user.id,
            "firebase_uid": request.user.firebase_uid,
            "name": request.user.name,
            "email": request.user.email,
            "created_at": request.user.created_at,
            "updated_at": request.user.updated_at,
        }, status=status.HTTP_200_OK)

    id_token = request.data.get('id_token')
    if not id_token:
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        parts = auth_header.split()
        if len(parts) == 2 and parts[0].lower() == 'bearer':
            id_token = parts[1]

    if not id_token:
        return Response(
            {"error": "id_token is required in request body or Authorization header."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        decoded_token = verify_firebase_token(id_token)
    except Exception as e:
        return Response(
            {"error": f"Invalid or expired Firebase ID token: {str(e)}"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    uid = decoded_token.get('uid')
    if not uid:
        return Response(
            {"error": "Token payload missing UID."},
            status=status.HTTP_400_BAD_REQUEST
        )

    email = decoded_token.get('email', '')
    name = decoded_token.get('name', '')

    # Find or create UserProfile in PostgreSQL
    user_profile, created = UserProfile.objects.get_or_create(
        firebase_uid=uid,
        defaults={
            'email': email,
            'name': name,
        }
    )

    # If already exists but fields updated in Firebase (e.g. displayName updated after create)
    updated = False
    if email and user_profile.email != email:
        user_profile.email = email
        updated = True
    if name and user_profile.name != name:
        user_profile.name = name
        updated = True
    if updated:
        user_profile.save(update_fields=['email', 'name', 'updated_at'])

    return Response({
        "id": user_profile.id,
        "firebase_uid": user_profile.firebase_uid,
        "name": user_profile.name,
        "email": user_profile.email,
        "created_at": user_profile.created_at,
        "updated_at": user_profile.updated_at,
    }, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)

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

    return Response({
        "id": user_profile.id,
        "firebase_uid": user_profile.firebase_uid,
        "name": user_profile.name,
        "email": user_profile.email,
        "created_at": user_profile.created_at,
        "updated_at": user_profile.updated_at,
    })
