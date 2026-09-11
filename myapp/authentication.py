from rest_framework import authentication, exceptions
from .firebase import verify_firebase_token
from .models import UserProfile

class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Custom DRF Authentication class for verifying Firebase ID tokens passed in
    the Authorization header (Bearer <FIREBASE_ID_TOKEN>).
    """

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return None

        id_token = parts[1]

        try:
            decoded_token = verify_firebase_token(id_token)
        except Exception as e:
            raise exceptions.AuthenticationFailed(f"Invalid or expired Firebase token: {str(e)}")

        uid = decoded_token.get('uid')
        if not uid:
            raise exceptions.AuthenticationFailed("Firebase token missing UID.")

        email = decoded_token.get('email', '')
        name = decoded_token.get('name', '')

        # Get or create UserProfile in PostgreSQL
        user_profile, created = UserProfile.objects.get_or_create(
            firebase_uid=uid,
            defaults={
                'email': email,
                'name': name,
            }
        )

        # Update name or email if they changed in Firebase
        updated = False
        if email and user_profile.email != email:
            user_profile.email = email
            updated = True
        if name and user_profile.name != name:
            user_profile.name = name
            updated = True
        if updated:
            user_profile.save(update_fields=['email', 'name', 'updated_at'])

        return (user_profile, decoded_token)
