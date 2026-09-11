import os
import logging
import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from google.auth.credentials import AnonymousCredentials

logger = logging.getLogger(__name__)

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
    Initialize Firebase Admin SDK.
    1. Primary app ('[DEFAULT]'): uses service account certificate from file or env vars.
    2. Fallback client app ('client_app'): initialized with project 'ruralmed-6cf34' to verify
       tokens from existing frontend clients if different from primary project.
    """
    if not firebase_admin._apps:
        service_account_path = getattr(settings, 'FIREBASE_SERVICE_ACCOUNT_KEY', None)
        project_id = getattr(settings, 'FIREBASE_PROJECT_ID', 'ecotrial-8b5e1')
        client_email = getattr(settings, 'FIREBASE_CLIENT_EMAIL', '')
        private_key = getattr(settings, 'FIREBASE_PRIVATE_KEY', '')
        private_key_id = getattr(settings, 'FIREBASE_PRIVATE_KEY_ID', '')

        cred = None
        if service_account_path and os.path.exists(service_account_path):
            try:
                cred = credentials.Certificate(service_account_path)
            except Exception as e:
                logger.warning(f"Failed loading service account file: {e}")

        if not cred and client_email and private_key:
            try:
                formatted_key = private_key.replace('\\n', '\n')
                cert_dict = {
                    "type": "service_account",
                    "project_id": project_id,
                    "private_key_id": private_key_id,
                    "private_key": formatted_key,
                    "client_email": client_email,
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
                cred = credentials.Certificate(cert_dict)
            except Exception as e:
                logger.warning(f"Failed constructing service account certificate from env: {e}")

        if cred:
            firebase_admin.initialize_app(cred, {'projectId': project_id})
            logger.info(f"Firebase Admin initialized with certificate for project {project_id}")
        else:
            options = {'projectId': project_id} if project_id else {}
            firebase_admin.initialize_app(credential=PublicTokenCredential(), options=options)
            logger.info(f"Firebase Admin initialized with PublicTokenCredential for project {project_id}")

    if 'client_app' not in firebase_admin._apps:
        try:
            firebase_admin.initialize_app(credential=PublicTokenCredential(), options={'projectId': 'ruralmed-6cf34'}, name='client_app')
        except Exception as e:
            logger.debug(f"Secondary Firebase app init: {e}")

# Initialize on module load
initialize_firebase()

def verify_firebase_token(id_token: str) -> dict:
    """
    Verifies a Firebase ID token using Firebase Admin SDK.
    Validates signature, expiration, and project audience.
    Returns decoded token dictionary (uid, email, name, etc.).
    Raises ValueError on verification failure.
    """
    if not id_token or not isinstance(id_token, str) or not id_token.strip():
        raise ValueError("Firebase ID token is required.")

    token_str = id_token.strip()

    # Development/Testing mock token fallback when DEBUG is True
    if getattr(settings, 'DEBUG', False) and (token_str.startswith('mock_token_') or token_str.startswith('dev_token_') or token_str == 'demo_token'):
        parts = token_str.split('_', 2)
        dev_uid = parts[-1] if len(parts) > 1 else 'demo_traveler_123'
        return {
            'uid': dev_uid,
            'user_id': dev_uid,
            'email': f"{dev_uid}@ecotrail.test",
            'name': 'Demo Traveler',
            'display_name': 'Demo Traveler',
            'picture': '',
        }

    # Try default app first
    try:
        decoded_token = auth.verify_id_token(token_str)
        return decoded_token
    except auth.ExpiredIdTokenError:
        raise ValueError("Firebase ID token has expired.")
    except auth.RevokedIdTokenError:
        raise ValueError("Firebase ID token has been revoked.")
    except Exception as default_err:
        # If audience/project mismatch or other error, try secondary client app if available
        if 'client_app' in firebase_admin._apps:
            try:
                client_app = firebase_admin.get_app('client_app')
                decoded_token = auth.verify_id_token(token_str, app=client_app)
                return decoded_token
            except auth.ExpiredIdTokenError:
                raise ValueError("Firebase ID token has expired.")
            except auth.RevokedIdTokenError:
                raise ValueError("Firebase ID token has been revoked.")
            except Exception:
                pass
        raise ValueError(f"Invalid Firebase ID token: {str(default_err)}")
