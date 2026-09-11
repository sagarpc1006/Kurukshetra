import os
import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings

from google.auth.credentials import AnonymousCredentials

class PublicTokenCredential(credentials.Base):
    """
    Credential provider that returns AnonymousCredentials.
    Prevents google.auth.default() from hanging on local/non-GCP environments
    by pinging the unreachable GCP metadata service (169.254.169.254) for 12 seconds.
    Firebase ID token verification only requires public Google x509 certs,
    not server-side private credentials.
    """
    def get_credential(self):
        return AnonymousCredentials()

def initialize_firebase():
    """
    Initialize Firebase Admin SDK if not already initialized.
    Supports either explicit service account certificate file or project ID fallback.
    """
    if not firebase_admin._apps:
        service_account_path = getattr(settings, 'FIREBASE_SERVICE_ACCOUNT_KEY', None)
        project_id = getattr(settings, 'FIREBASE_PROJECT_ID', 'ecotrail-5a76a')

        if service_account_path and os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        else:
            # Initialize with PublicTokenCredential to avoid the 12-second metadata ping
            options = {'projectId': project_id} if project_id else {}
            firebase_admin.initialize_app(credential=PublicTokenCredential(), options=options)

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
