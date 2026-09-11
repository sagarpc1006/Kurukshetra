import os
import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings

def initialize_firebase():
    """
    Initialize Firebase Admin SDK if not already initialized.
    Supports either explicit service account certificate file or project ID fallback.
    """
    if not firebase_admin._apps:
        service_account_path = getattr(settings, 'FIREBASE_SERVICE_ACCOUNT_KEY', None)
        project_id = getattr(settings, 'FIREBASE_PROJECT_ID', 'ruralmed-6cf34')

        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        else:
            # Initialize with default options/project_id
            options = {'projectId': project_id} if project_id else {}
            firebase_admin.initialize_app(options=options)

# Initialize on module load
initialize_firebase()

def verify_firebase_token(id_token):
    """
    Verifies a Firebase ID token using Firebase Admin SDK.
    Returns the decoded token payload dictionary containing uid, email, name, etc.
    Raises exceptions on verification failure.
    """
    if not id_token:
        raise ValueError("Firebase ID token is required.")

    # verify_id_token will validate cryptographic signature, expiration, and project audience
    decoded_token = auth.verify_id_token(id_token)
    return decoded_token
