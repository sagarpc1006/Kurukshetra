import logging
from rest_framework import authentication, exceptions
from .firebase import verify_firebase_token
from .models import UserProfile

logger = logging.getLogger(__name__)

class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Custom DRF Authentication class for verifying Firebase ID tokens passed in
    the Authorization header (Bearer <FIREBASE_ID_TOKEN>).
    
    Returns:
        (user_profile, decoded_token) tuple if verified.
        Raises exceptions.AuthenticationFailed (HTTP 401) on invalid/expired/revoked token.
        Returns None if Authorization header is not present (allowing DRF permission checks to fail with 401).
    """

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) == 0:
            return None

        if parts[0].lower() != 'bearer':
            return None

        if len(parts) != 2 or not parts[1].strip():
            raise exceptions.AuthenticationFailed("Invalid Authorization header format. Expected 'Bearer <token>'.")

        id_token = parts[1].strip()

        try:
            decoded_token = verify_firebase_token(id_token)
        except Exception as e:
            logger.warning(f"Firebase token verification failed: {e}")
            raise exceptions.AuthenticationFailed(f"Invalid or expired Firebase token: {str(e)}")

        uid = decoded_token.get('uid') or decoded_token.get('user_id') or decoded_token.get('sub')
        if not uid:
            raise exceptions.AuthenticationFailed("Firebase token payload missing UID.")

        email = decoded_token.get('email', '')
        name = decoded_token.get('name', '') or decoded_token.get('display_name', '')
        picture = decoded_token.get('picture', '')

        # Get or create UserProfile in PostgreSQL
        user_profile, created = UserProfile.objects.get_or_create(
            firebase_uid=uid,
            defaults={
                'email': email,
                'name': name,
                'display_name': name,
                'photo_url': picture,
            }
        )

        # Update fields if modified in Firebase
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

        return (user_profile, decoded_token)

    def authenticate_header(self, request):
        """
        Causes DRF to return HTTP 401 Unauthorized instead of 403 Forbidden
        when authentication credentials are missing on protected views.
        """
        return 'Bearer realm="api"'
