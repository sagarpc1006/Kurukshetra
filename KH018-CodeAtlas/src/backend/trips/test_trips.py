from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from myapp.models import UserProfile
from trips.models import SavedTrip

class SavedTripsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = UserProfile.objects.create(
            firebase_uid="uid_traveler_1",
            email="traveler1@example.com",
            name="Traveler One",
            display_name="Traveler One",
            preferred_currency="INR"
        )
        self.user2 = UserProfile.objects.create(
            firebase_uid="uid_traveler_2",
            email="traveler2@example.com",
            name="Traveler Two",
            display_name="Traveler Two"
        )
        self.valid_payload = {
            "title": "3-Day Eco Trip: Pune to Goa",
            "origin": "Pune",
            "destination": "Goa",
            "duration_days": 3,
            "travel_dates": "2026-10-15",
            "transport_mode": "Electric Rail + Shared EV",
            "total_cost": 2310,
            "currency": "INR",
            "eco_score": 92,
            "carbon_emissions": 9.4,
            "carbon_saved": "54.9 kg CO₂e saved",
            "accessibility_rating": 5.0,
            "accessibility_verified": True,
            "status": "Saved",
            "stays": "Wildernest Certified Eco-Cottages",
            "itinerary_data": {
                "title": "3-Day Eco Trip",
                "days": [{"day": 1, "title": "Arrival & Check-in"}]
            }
        }

    # 1. Unauthenticated requests to /api/trips/ return HTTP 401
    def test_unauthenticated_access_rejected(self):
        response = self.client.get('/api/trips/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.post('/api/trips/', self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 2. Save trip (POST /api/trips/) creates trip in PostgreSQL for authenticated user
    @patch('myapp.authentication.verify_firebase_token')
    def test_save_trip_authenticated(self, mock_verify):
        mock_verify.return_value = {"uid": self.user1.firebase_uid, "email": self.user1.email}
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        response = self.client.post('/api/trips/', self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["trip"]["origin"], "Pune")
        self.assertEqual(response.data["trip"]["destination"], "Goa")
        self.assertEqual(response.data["trip"]["ecoScore"], 92)

        # Verify DB entry and foreign key ownership
        saved = SavedTrip.objects.get(id=response.data["trip"]["id"])
        self.assertEqual(saved.user, self.user1)
        self.assertEqual(saved.total_cost, 2310)

    # 3. Get user's trips (GET /api/trips/) returns only trips belonging to authenticated user
    @patch('myapp.authentication.verify_firebase_token')
    def test_get_user_trips_isolation(self, mock_verify):
        # Create a trip for user1 and user2
        trip1 = SavedTrip.objects.create(user=self.user1, title="User1 Trip", origin="Pune", destination="Goa")
        trip2 = SavedTrip.objects.create(user=self.user2, title="User2 Trip", origin="Mumbai", destination="Delhi")

        mock_verify.return_value = {"uid": self.user1.firebase_uid, "email": self.user1.email}
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        response = self.client.get('/api/trips/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["trips"][0]["id"], trip1.id)
        self.assertEqual(response.data["trips"][0]["title"], "User1 Trip")

    # 4. Get single trip (GET /api/trips/<id>/) returns detailed trip
    @patch('myapp.authentication.verify_firebase_token')
    def test_get_single_trip_detail(self, mock_verify):
        trip = SavedTrip.objects.create(
            user=self.user1,
            title="Detailed Trip",
            origin="Pune",
            destination="Goa",
            duration_days=3,
            itinerary_data={"summary": "Detailed itinerary test"}
        )
        mock_verify.return_value = {"uid": self.user1.firebase_uid, "email": self.user1.email}
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        response = self.client.get(f'/api/trips/{trip.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["trip"]["id"], trip.id)
        self.assertEqual(response.data["trip"]["itinerary"]["summary"], "Detailed itinerary test")

    # 5. Unauthorized trip access: User 2 cannot access User 1's trip
    @patch('myapp.authentication.verify_firebase_token')
    def test_unauthorized_trip_access_forbidden(self, mock_verify):
        trip_user1 = SavedTrip.objects.create(user=self.user1, title="Private Trip", origin="Pune", destination="Goa")

        # Authenticate as user2
        mock_verify.return_value = {"uid": self.user2.firebase_uid, "email": self.user2.email}
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token_user2')

        response = self.client.get(f'/api/trips/{trip_user1.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(response.data["success"])

    # 6. Delete trip (DELETE /api/trips/<id>/) deletes from PostgreSQL
    @patch('myapp.authentication.verify_firebase_token')
    def test_delete_trip_authenticated(self, mock_verify):
        trip = SavedTrip.objects.create(user=self.user1, title="To Be Deleted", origin="Pune", destination="Goa")
        mock_verify.return_value = {"uid": self.user1.firebase_uid, "email": self.user1.email}
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        response = self.client.delete(f'/api/trips/{trip.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(SavedTrip.objects.filter(id=trip.id).count(), 0)

    # 7. User cannot delete another user's trip
    @patch('myapp.authentication.verify_firebase_token')
    def test_delete_other_user_trip_forbidden(self, mock_verify):
        trip_user1 = SavedTrip.objects.create(user=self.user1, title="Protected Trip", origin="Pune", destination="Goa")
        mock_verify.return_value = {"uid": self.user2.firebase_uid, "email": self.user2.email}
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token_user2')

        response = self.client.delete(f'/api/trips/{trip_user1.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(SavedTrip.objects.filter(id=trip_user1.id).count(), 1)
