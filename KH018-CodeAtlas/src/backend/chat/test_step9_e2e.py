from unittest.mock import patch
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from myapp.models import UserProfile
from ai.fallback_intent import extract_fallback_intent
from travel.demo_data import get_demo_corridor, get_demo_places

class Step9EndToEndIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = UserProfile.objects.create(
            firebase_uid="uid_step9_traveler",
            email="traveler_e2e@example.com",
            name="E2E Eco Traveler",
            preferred_currency="INR"
        )
        self.mock_token_payload = {
            "uid": self.user.firebase_uid,
            "email": self.user.email,
            "name": self.user.name,
        }

    # 1. Chat API success with full pipeline (Pune to Goa for 3 days under ₹10,000)
    @patch('myapp.authentication.verify_firebase_token')
    def test_01_chat_e2e_success_flow(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        payload = {"message": "Pune to Goa for 3 days under ₹10,000, I prefer eco-friendly and accessible travel."}
        response = self.client.post('/api/chat/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertTrue(data["success"])

        # Validate Response Contract (Section 6)
        self.assertIn("intent", data)
        self.assertIn("recommendations", data)
        self.assertIn("eco_twin", data)
        self.assertIn("itinerary", data)
        self.assertIn("show_your_math", data)

        # Validate Intent
        intent = data["intent"]
        self.assertEqual(intent["origin"].lower(), "pune")
        self.assertEqual(intent["destination"].lower(), "goa")
        self.assertEqual(intent["duration_days"], 3)
        self.assertLessEqual(intent["budget"], 10000)

        # Validate Recommendations
        recs = data["recommendations"]["results"]
        self.assertGreater(len(recs), 0)
        top_pick = recs[0]
        self.assertIn("green_accessible_score", top_pick)
        self.assertIn("scores", top_pick)
        self.assertIn("show_your_math", top_pick)

        # Validate Eco-Twin
        eco_twin = data["eco_twin"]
        self.assertTrue(eco_twin.get("available"))
        self.assertIn("baseline", eco_twin)
        self.assertIn("eco_twin", eco_twin)
        self.assertIn("comparison", eco_twin)

        # Validate Itinerary
        itinerary = data["itinerary"]
        self.assertEqual(itinerary["duration_days"], 3)
        self.assertEqual(len(itinerary["days"]), 3)
        self.assertIn("morning", itinerary["days"][0])
        self.assertIn("afternoon", itinerary["days"][0])
        self.assertIn("evening", itinerary["days"][0])
        self.assertIn("green_tip", itinerary["days"][0])

    # 2. Invalid chat request: Empty message returns 400 Bad Request
    @patch('myapp.authentication.verify_firebase_token')
    def test_02_invalid_empty_message(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        response = self.client.post('/api/chat/', {"message": "   "}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    # 3. Invalid chat request: Excessively long message returns 400 Bad Request
    @patch('myapp.authentication.verify_firebase_token')
    def test_03_invalid_long_message(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        long_msg = "Travel from Pune to Goa. " * 150 # > 2000 chars
        response = self.client.post('/api/chat/', {"message": long_msg}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])

    # 4. Gemini failure -> Groq / deterministic rule fallback
    def test_04_rule_fallback_intent_extraction(self):
        query = "Mumbai to Bengaluru for 4 days under ₹15,000, wheelchair accessible required"
        fallback = extract_fallback_intent(query)
        self.assertEqual(fallback["origin"], "Mumbai")
        self.assertEqual(fallback["destination"], "Bengaluru")
        self.assertEqual(fallback["duration_days"], 4)
        self.assertEqual(fallback["budget"], 15000)
        self.assertTrue(fallback["accessibility_required"])
        self.assertTrue(fallback["wheelchair_required"])

    # 5. Travel API failure -> graceful degradation with demo fallback data
    def test_05_demo_fallback_corridor_data(self):
        corridor = get_demo_corridor("Pune", "Goa")
        self.assertIsNotNone(corridor)
        self.assertIn("distance_km", corridor)
        self.assertIn("flight", corridor)
        self.assertIn("train", corridor)
        self.assertIn("shared_ev", corridor)
        self.assertLess(corridor["shared_ev"]["carbon_kg"], corridor["flight"]["carbon_kg"])

        places = get_demo_places("Goa")
        self.assertGreater(len(places), 0)
        self.assertTrue(any(p.get("wheelchair_accessible") for p in places))

    # 6. Recommendation calculation and deterministic ranking
    @patch('myapp.authentication.verify_firebase_token')
    def test_06_recommendation_deterministic_ranking(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        response = self.client.post('/api/chat/', {"message": "Pune to Mumbai for 2 days"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data["recommendations"]["results"]
        # Scores must be sorted in descending order
        scores = [r["green_accessible_score"] for r in results]
        self.assertEqual(scores, sorted(scores, reverse=True))

    # 7. Eco-Twin comparison deltas are calculated correctly
    @patch('myapp.authentication.verify_firebase_token')
    def test_07_eco_twin_calculation_deltas(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        response = self.client.post('/api/chat/', {"message": "Pune to Goa for 3 days"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        eco_twin = response.data["eco_twin"]
        if eco_twin.get("available"):
            comp = eco_twin["comparison"]
            self.assertIn("carbon_reduction_percent", comp)
            self.assertIn("cost_difference", comp)
            self.assertIn("time_difference_minutes", comp)
            self.assertIn("accessibility_difference", comp)

    # 8. Show Your Math structure conforms to mathematical explainability
    @patch('myapp.authentication.verify_firebase_token')
    def test_08_show_your_math_explainability(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        response = self.client.post('/api/chat/', {"message": "Pune to Goa for 3 days under ₹10,000"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        math = response.data["show_your_math"]
        self.assertIn("inputs", math)
        self.assertIn("contributions", math)
        self.assertIn("calculation", math)
        self.assertIn("sources", math)

    # 9. Empty results handling
    @patch('chat.services.rank_travel_options')
    @patch('myapp.authentication.verify_firebase_token')
    def test_09_empty_recommendation_results_handling(self, mock_verify, mock_rank):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')
        mock_rank.return_value = {"results": [], "weights": {}}

        response = self.client.post('/api/chat/', {"message": "Pune to Goa for 3 days"}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["recommendations"]["results"]), 0)

    # 10. Genuine real-time official package links and portal access
    @patch('myapp.authentication.verify_firebase_token')
    def test_10_official_packages_and_realtime_links(self, mock_verify):
        mock_verify.return_value = self.mock_token_payload
        self.client.credentials(HTTP_AUTHORIZATION='Bearer valid_mock_token')

        response = self.client.post(
            '/api/chat/',
            {"message": "Plan a trip to Tirupati for Balaji darshan from Mumbai for 3 days"},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        self.assertTrue(data["success"])

        # Check official links
        links = data.get("official_links", [])
        self.assertGreater(len(links), 0)

        # Check that official packages exist
        package_links = [l for l in links if l.get("is_package")]
        self.assertGreater(len(package_links), 0)

        # Confirm exact government/authorized package URLs exist
        urls = [l["url"] for l in links]
        has_ttd = any("ttdevasthanams.ap.gov.in" in u for u in urls)
        has_irctc = any("irctc" in u for u in urls)
        self.assertTrue(has_ttd)
        self.assertTrue(has_irctc)

        # Ensure AI response exists and is non-empty
        self.assertTrue(len(data.get("ai_response", "")) > 20)

