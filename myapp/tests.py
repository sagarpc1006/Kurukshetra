from django.test import TestCase
from unittest.mock import patch
from rest_framework.test import APIClient
from rest_framework import status
from .models import UserProfile

class UserProfileModelTests(TestCase):
    def test_create_user_profile(self):
        profile = UserProfile.objects.create(
            firebase_uid="test_firebase_uid_123",
            name="Aditya Kadam",
            email="aditya@example.com"
        )
        self.assertEqual(profile.firebase_uid, "test_firebase_uid_123")
        self.assertEqual(profile.name, "Aditya Kadam")
        self.assertEqual(profile.email, "aditya@example.com")
        self.assertTrue(profile.is_authenticated)
        self.assertFalse(profile.is_anonymous)
        self.assertIn("aditya@example.com", str(profile))

class FirebaseAuthAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_missing_token(self):
        response = self.client.post('/api/auth/firebase/', {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    @patch('myapp.views.verify_firebase_token')
    def test_firebase_auth_sync_new_user(self, mock_verify):
        mock_verify.return_value = {
            'uid': 'fb_uid_999',
            'email': 'newtraveler@example.com',
            'name': 'New Traveler'
        }

        response = self.client.post(
            '/api/auth/firebase/',
            {'id_token': 'mock_valid_token_xyz'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['firebase_uid'], 'fb_uid_999')
        self.assertEqual(response.data['email'], 'newtraveler@example.com')
        self.assertEqual(response.data['name'], 'New Traveler')

        # Check DB
        profile = UserProfile.objects.get(firebase_uid='fb_uid_999')
        self.assertEqual(profile.email, 'newtraveler@example.com')

    @patch('myapp.views.verify_firebase_token')
    def test_firebase_auth_sync_existing_user(self, mock_verify):
        UserProfile.objects.create(
            firebase_uid='fb_uid_888',
            name='Old Name',
            email='existing@example.com'
        )

        mock_verify.return_value = {
            'uid': 'fb_uid_888',
            'email': 'existing@example.com',
            'name': 'Updated Name'
        }

        response = self.client.post(
            '/api/auth/firebase/',
            {'id_token': 'mock_valid_token_abc'},
            format='json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Updated Name')

        profile = UserProfile.objects.get(firebase_uid='fb_uid_888')
        self.assertEqual(profile.name, 'Updated Name')
