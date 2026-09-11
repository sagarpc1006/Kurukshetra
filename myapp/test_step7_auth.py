import json
from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from myapp.models import UserProfile
from accessibility.models import AccessibilityProfile

class Step7FirebaseAuthIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.mock_uid = "firebase_test_uid_12345"
        self.mock_email = "testuser@example.com"
        self.mock_name = "Alex Traveler"
        self.mock_token_payload = {
            "uid": self.mock_uid,
            "email": self.mock_email,
            "name": self.mock_name,
            "picture": "https://example.com/alex.jpg",
        }

    # 1. Unauthenticated request to /api/auth/me/ returns HTTP 401
    def test_01_unauthenticated_auth_me(self):
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 2. Unauthenticated request to /api/profile/ returns HTTP 401
    def test_02_unauthenticated_profile(self):
        response = self.client.get('/api/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 3. Unauthenticated request to /api/chat/ returns HTTP 401
    def test_03_unauthenticated_chat(self):
        response = self.client.post('/api/chat/', {"message": "Pune to Goa"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 4. Request with malformed Authorization header returns HTTP 401
    def test_04_malformed_auth_header(self):
        self.client.credentials(HTTP_AUTHORIZATION='Bearer')
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.client.credentials(HTTP_AUTHORIZATION='Bearer   ')
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 5. Request with invalid/expired token returns HTTP 401
    @patch('myapp.authentication.verify_firebase_token')
    def test_05_invalid_expired_token(self, mock_verify):
        mock_verify.side_effect = ValueError("Firebase ID token has expired.")
        self.client.credentials(HTTP_AUTHORIZATION='Bearer expired_token_xyz')
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("expired", response.data.get('detail', '').lower())

    # 6. Valid token authentication on /api/auth/me/ creates UserProfile in PostgreSQL
    @patch('myapp.authentication.verify_firebase_token')
    def test_06_valid_token_creates_user_profile(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')
        
        # Verify no profile exists yet
        self.assertEqual(UserProfile.objects.filter(firebase_uid=self.mock_uid).count(), 0)

        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['firebase_uid'], self.mock_uid)
        self.assertEqual(response.data['email'], self.mock_email)
        self.assertEqual(response.data['display_name'], self.mock_name)

        # Verify profile is now in DB
        db_user = UserProfile.objects.get(firebase_uid=self.mock_uid)
        self.assertEqual(db_user.email, self.mock_email)
        self.assertEqual(db_user.name, self.mock_name)

    # 7. Subsequent request with same UID returns existing UserProfile (idempotent, no duplicates)
    @patch('myapp.authentication.verify_firebase_token')
    def test_07_subsequent_request_idempotent(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        res1 = self.client.get('/api/auth/me/')
        res2 = self.client.get('/api/auth/me/')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertEqual(UserProfile.objects.filter(firebase_uid=self.mock_uid).count(), 1)

    # 8. UserProfile updates name/email if changed in Firebase token claims
    @patch('myapp.authentication.verify_firebase_token')
    def test_08_profile_syncs_updated_claims(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')
        self.client.get('/api/auth/me/')

        # User changes display name and email in Firebase
        updated_payload = {
            "uid": self.mock_uid,
            "email": "alex.new@example.com",
            "name": "Alex Updated",
        }
        mock_verify.return_value = updated_payload
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], "alex.new@example.com")
        self.assertEqual(response.data['display_name'], "Alex Updated")

        db_user = UserProfile.objects.get(firebase_uid=self.mock_uid)
        self.assertEqual(db_user.email, "alex.new@example.com")
        self.assertEqual(db_user.display_name, "Alex Updated")

    # 9. GET /api/profile/ returns user preferences from PostgreSQL
    @patch('myapp.authentication.verify_firebase_token')
    def test_09_get_user_preferences(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        response = self.client.get('/api/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['profile']['eco_priority'], 'high')
        self.assertEqual(response.data['profile']['budget_preference'], 10000)

    # 10. PATCH /api/profile/ updates preferences in PostgreSQL
    @patch('myapp.authentication.verify_firebase_token')
    def test_10_patch_user_preferences(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        update_data = {
            "eco_priority": "maximum",
            "budget_preference": "₹15,000",
            "preferred_transport": "Electric Rail Priority",
            "home_city": "Mumbai",
        }
        response = self.client.patch('/api/profile/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['profile']['eco_priority'], "maximum")
        self.assertEqual(response.data['profile']['budget_preference'], 15000)
        self.assertEqual(response.data['profile']['home_city'], "Mumbai")

        db_user = UserProfile.objects.get(firebase_uid=self.mock_uid)
        self.assertEqual(db_user.eco_priority, "maximum")
        self.assertEqual(db_user.budget_preference, 15000)
        self.assertEqual(db_user.home_city, "Mumbai")

    # 11. POST /api/auth/firebase/ syncs token and returns profile data
    @patch('myapp.views.verify_firebase_token')
    def test_11_firebase_auth_sync_view(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        response = self.client.post('/api/auth/firebase/', {"id_token": "valid_token"}, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        self.assertEqual(response.data['firebase_uid'], self.mock_uid)

    # 12. POST /api/auth/firebase/ with missing token returns 400
    def test_12_firebase_auth_sync_missing_token(self):
        response = self.client.post('/api/auth/firebase/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # 13. GET /api/accessibility/profile/ with authenticated user returns linked profile
    @patch('myapp.authentication.verify_firebase_token')
    def test_13_accessibility_profile_authenticated_get(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        response = self.client.get('/api/accessibility/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertIn('profile', response.data)

        # Check DB link
        user_prof = UserProfile.objects.get(firebase_uid=self.mock_uid)
        acc_prof = AccessibilityProfile.objects.get(user=user_prof)
        self.assertIsNotNone(acc_prof)
        self.assertEqual(acc_prof.user, user_prof)

    # 14. POST /api/accessibility/profile/ with authenticated user saves preferences
    @patch('myapp.authentication.verify_firebase_token')
    def test_14_accessibility_profile_authenticated_save(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        acc_data = {
            "wheelchair_required": True,
            "step_free_required": True,
            "accessible_vehicle_required": True,
            "elevator_preferred": True,
        }
        response = self.client.post('/api/accessibility/profile/', acc_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertTrue(response.data['profile']['wheelchair_required'])
        self.assertTrue(response.data['profile']['step_free_required'])

        user_prof = UserProfile.objects.get(firebase_uid=self.mock_uid)
        acc_prof = AccessibilityProfile.objects.get(user=user_prof)
        self.assertTrue(acc_prof.wheelchair_required)
        self.assertTrue(acc_prof.step_free_required)

    # 15. Authenticated chat request merges user preferences into travel intent workflow
    @patch('myapp.authentication.verify_firebase_token')
    @patch('chat.services.extract_travel_intent')
    @patch('chat.services.orchestrate_travel_plan')
    @patch('chat.services.rank_travel_options')
    @patch('chat.services.generate_eco_twin')
    def test_15_authenticated_chat_merges_user_context(
        self, mock_eco_twin, mock_rank, mock_orchestrate, mock_intent, mock_verify
    ):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        # First set user home_city and accessibility preferences
        user = UserProfile.objects.create(
            firebase_uid=self.mock_uid,
            email=self.mock_email,
            name=self.mock_name,
            home_city="Pune",
            preferred_currency="INR",
            budget_preference=12000,
        )
        AccessibilityProfile.objects.create(
            user=user,
            wheelchair_required=True,
            step_free_required=True
        )

        mock_intent.return_value = {
            "success": True,
            "intent": {
                "origin": None, # Will be filled from user home_city
                "destination": "Goa",
                "duration_days": 3,
                "budget": None, # Will be filled from user budget_preference
                "currency": None,
                "eco_priority": "high",
                "accessibility_required": False
            }
        }
        mock_orchestrate.return_value = {"options": []}
        mock_rank.return_value = {"results": [], "weights": {}}
        mock_eco_twin.return_value = None

        response = self.client.post('/api/chat/', {"message": "Trip to Goa for 3 days"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check that orchestrate_travel_plan was called with merged intent
        call_args = mock_orchestrate.call_args[0][0]
        self.assertEqual(call_args.get('origin'), "Pune")
        self.assertEqual(call_args.get('budget'), 12000)
        self.assertTrue(call_args.get('wheelchair_required'))
        self.assertTrue(call_args.get('step_free_required'))
