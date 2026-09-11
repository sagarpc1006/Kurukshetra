from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from .models import AccessibilityProfile, AccessibilityEvidence, AccessibilityVerification
from .services.confidence import calculate_accessibility_confidence
from .services.osm_parser import parse_osm_accessibility_tags
from .services.matching import match_accessibility_requirements
from .services.verification import validate_image_file, analyze_accessibility_photo
from recommendations.services.accessibility import calculate_accessibility_score
from recommendations.services.ranking import rank_travel_options
from recommendations.services.ecotwin import generate_eco_twin


class AccessibilityTestCase(TestCase):
    """
    Comprehensive test suite covering all 20 required scenarios for Step 5:
    Accessibility Profile + 'Verified, Not Claimed' transparent verification.
    """

    def setUp(self):
        self.client = APIClient()

    def test_1_accessibility_profile_creation(self):
        """1. Accessibility profile creation via API / model."""
        response = self.client.post("/api/accessibility/profile/", {
            "client_id": "test_traveler_1",
            "wheelchair_required": True,
            "step_free_required": True,
            "accessible_toilet_preferred": True,
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["success"])
        self.assertTrue(response.data["profile"]["wheelchair_required"])
        self.assertTrue(response.data["profile"]["step_free_required"])

        # Check DB
        profile = AccessibilityProfile.objects.get(client_id="test_traveler_1")
        self.assertTrue(profile.wheelchair_required)
        self.assertTrue(profile.step_free_required)
        self.assertFalse(profile.accessible_vehicle_required)

    def test_2_accessibility_profile_update(self):
        """2. Accessibility profile update via PATCH / POST."""
        profile = AccessibilityProfile.objects.create(
            client_id="test_traveler_2",
            wheelchair_required=False
        )
        response = self.client.patch("/api/accessibility/profile/", {
            "client_id": "test_traveler_2",
            "wheelchair_required": True,
            "elevator_preferred": True
        }, format="json")
        self.assertEqual(response.status_code, 200)
        profile.refresh_from_db()
        self.assertTrue(profile.wheelchair_required)
        self.assertTrue(profile.elevator_preferred)

    def test_3_wheelchair_requirement(self):
        """3. Wheelchair requirement: matches when wheelchair_accessible=True, fails when False or unknown."""
        user = {"wheelchair_required": True}
        opt_accessible = {"wheelchair_accessible": True}
        opt_inaccessible = {"wheelchair_accessible": False}
        opt_unknown = {"wheelchair_accessible": None}

        res1 = match_accessibility_requirements(user, opt_accessible)
        self.assertTrue(res1["compatible"])
        self.assertIn("wheelchair", res1["matched_requirements"])

        res2 = match_accessibility_requirements(user, opt_inaccessible)
        self.assertFalse(res2["compatible"])
        self.assertIn("wheelchair", res2["missing_requirements"])

        res3 = match_accessibility_requirements(user, opt_unknown)
        self.assertFalse(res3["compatible"])
        self.assertIn("wheelchair", res3["unknown_requirements"])

    def test_4_step_free_requirement(self):
        """4. Step-free requirement: matches when step_free=True, fails when False or unknown."""
        user = {"step_free_required": True}
        opt_step_free = {"step_free": True}
        opt_steps = {"step_free": False}

        res_ok = match_accessibility_requirements(user, opt_step_free)
        self.assertTrue(res_ok["compatible"])
        self.assertIn("step_free", res_ok["matched_requirements"])

        res_fail = match_accessibility_requirements(user, opt_steps)
        self.assertFalse(res_fail["compatible"])
        self.assertIn("step_free", res_fail["missing_requirements"])

    def test_5_accessibility_matching(self):
        """5. Complete accessibility matching with soft preferences."""
        user = {
            "wheelchair_required": True,
            "step_free_required": True,
            "accessible_toilet_preferred": True,
            "elevator_preferred": True
        }
        venue = {
            "wheelchair_accessible": True,
            "step_free": True,
            "accessible_toilet": True,
            "elevator": True
        }
        res = match_accessibility_requirements(user, venue)
        self.assertTrue(res["compatible"])
        self.assertEqual(res["match_score"], 100)
        self.assertEqual(len(res["missing_requirements"]), 0)

    def test_6_osm_accessibility_parsing(self):
        """6. OSM tags parsed to osm_supported, NEVER verified."""
        tags = {
            "wheelchair": "yes",
            "wheelchair:entrance": "yes",
            "toilets:wheelchair": "yes",
            "elevator": "yes",
            "kerb": "flush"
        }
        parsed = parse_osm_accessibility_tags(tags)
        self.assertTrue(parsed["wheelchair_accessible"])
        self.assertTrue(parsed["step_free"])
        self.assertTrue(parsed["accessible_toilet"])
        self.assertTrue(parsed["elevator"])
        self.assertEqual(parsed["source"], "osm")
        self.assertEqual(parsed["verification_status"], "osm_supported")
        self.assertNotEqual(parsed["verification_status"], "verified") # CRITICAL TRUST RULE
        self.assertEqual(parsed["label"], "Wheelchair: Yes — OSM data")

    def test_7_business_accessibility_parsing(self):
        """7. Business-provided accessibility is marked business_declared, NEVER verified."""
        access_res = calculate_accessibility_score({
            "wheelchair_accessible": True,
            "step_free": True,
            "source": "business_declaration"
        })
        self.assertEqual(access_res["accessibility_status"], "business_declared")
        self.assertFalse(access_res["accessibility_verified"])
        self.assertEqual(access_res["status_label"], "Business reported")

    def test_8_photo_verification_response_parsing(self):
        """8. Photo verification response produces structured evidence, confidence, and status."""
        dummy_bytes = b"\xff\xd8\xff\xe0\x00\x10JFIF" + b"\x00" * 200
        analysis = analyze_accessibility_photo(dummy_bytes, "image/jpeg", "step_free_entrance")

        self.assertEqual(analysis["claim_type"], "step_free_entrance")
        self.assertTrue(analysis["detected"])
        self.assertGreaterEqual(analysis["confidence"], 0.85)
        self.assertIn(analysis["status"], ("verified", "ai_supported"))
        self.assertIn("evidence", analysis)
        self.assertIn("limitations", analysis)

    def test_9_confidence_calculation(self):
        """9. Deterministic confidence scoring reflecting evidence quality."""
        # Photo verified -> 90-95%
        conf_photo = calculate_accessibility_confidence(sources=["photo_verification"], verification_status="verified", has_visual_evidence=True)
        self.assertGreaterEqual(conf_photo, 90)

        # Multi-source consensus -> 75-85%
        conf_multi = calculate_accessibility_confidence(sources=["osm", "business_declaration"], verification_status="business_declared")
        self.assertGreaterEqual(conf_multi, 75)
        self.assertLessEqual(conf_multi, 85)

        # Business declaration alone -> 60-70%
        conf_biz = calculate_accessibility_confidence(sources=["business_declaration"], verification_status="business_declared")
        self.assertGreaterEqual(conf_biz, 60)
        self.assertLessEqual(conf_biz, 70)

        # OSM data alone -> 50-65%
        conf_osm = calculate_accessibility_confidence(sources=["osm"], verification_status="osm_supported")
        self.assertGreaterEqual(conf_osm, 50)
        self.assertLessEqual(conf_osm, 65)

        # Unknown / no sources -> 0%
        conf_none = calculate_accessibility_confidence(sources=[], verification_status="unknown")
        self.assertEqual(conf_none, 0)

    def test_10_verification_status(self):
        """10. Verification status strictly differentiates verified from declared and OSM."""
        v_res = calculate_accessibility_score({"verified": True, "rating": 5.0, "source": "photo_verification"})
        self.assertEqual(v_res["accessibility_status"], "verified")
        self.assertTrue(v_res["accessibility_verified"])

        d_res = calculate_accessibility_score({"status": "business_declared", "rating": 4.0})
        self.assertEqual(d_res["accessibility_status"], "business_declared")
        self.assertFalse(d_res["accessibility_verified"])

        o_res = calculate_accessibility_score({"status": "osm_supported", "rating": 4.0})
        self.assertEqual(o_res["accessibility_status"], "osm_supported")
        self.assertFalse(o_res["accessibility_verified"])

    def test_11_unknown_accessibility(self):
        """11. Missing accessibility is marked unknown with 0 confidence, not assumed accessible."""
        res = calculate_accessibility_score(None)
        self.assertEqual(res["accessibility_status"], "unknown")
        self.assertEqual(res["confidence"], 0)
        self.assertFalse(res["accessibility_verified"])
        self.assertIsNone(res["wheelchair_accessible"])
        self.assertIsNone(res["step_free"])

    def test_12_conflicting_sources(self):
        """12. Conflicting sources result in status 'conflicting' and depressed confidence."""
        conf_conflict = calculate_accessibility_confidence(
            sources=["osm", "business_declaration"],
            verification_status="conflicting",
            is_conflicting=True
        )
        self.assertGreaterEqual(conf_conflict, 20)
        self.assertLessEqual(conf_conflict, 30)

    def test_13_hard_requirement_filtering(self):
        """13. Hard requirements strictly filter out incompatible and unknown options."""
        user = {"wheelchair_required": True}
        opt_a = {"wheelchair_accessible": True}  # eligible
        opt_b = {"wheelchair_accessible": False} # rejected
        opt_c = {"wheelchair_accessible": None}  # rejected (unknown)

        self.assertTrue(match_accessibility_requirements(user, opt_a)["compatible"])
        self.assertFalse(match_accessibility_requirements(user, opt_b)["compatible"])
        self.assertFalse(match_accessibility_requirements(user, opt_c)["compatible"])

    def test_14_accessibility_score_formula(self):
        """14. Formula: AccessScore = accessibility_rating * 20."""
        cases = [(5.0, 100), (4.5, 90), (4.0, 80), (3.0, 60), (2.0, 40), (1.0, 20), (0.0, 0)]
        for rating, expected in cases:
            res = calculate_accessibility_score({"rating": rating})
            self.assertEqual(res["accessibility_score"], expected)

    def test_15_recommendation_ranking_with_accessibility(self):
        """15. Recommendation Engine eliminates incompatible options when hard requirements exist."""
        travel_data = {
            "route": {"distance_km": 400, "duration_minutes": 300},
            "transport_options": [
                {"airline": "TestAir", "price": 8000, "duration_minutes": 60, "currency": "INR"}
            ]
        }
        # Intent with hard wheelchair + step-free requirement
        intent = {
            "origin": "Pune",
            "destination": "Goa",
            "budget": 10000,
            "wheelchair_required": True,
            "step_free_required": True
        }
        ranked = rank_travel_options(travel_data, intent)
        results = ranked["results"]

        # All returned options MUST have step_free=True and wheelchair_accessible=True
        self.assertGreater(len(results), 0)
        for r in results:
            acc = r["accessibility"]
            self.assertTrue(acc["step_free"])
            self.assertTrue(acc["wheelchair_accessible"])

    def test_16_ecotwin_accessibility_filtering(self):
        """16. Eco-Twin rejects greener alternatives that fail accessibility constraints."""
        baseline = {
            "id": "base",
            "transport": "flight",
            "price": 8000,
            "duration_minutes": 90,
            "carbon_kg_co2e": 120,
            "accessibility_rating": 3.0,
            "step_free": True,
            "wheelchair_accessible": True,
            "green_accessible_score": 60
        }
        inaccessible_eco = {
            "id": "inaccessible_bus",
            "transport": "bus + walk",
            "price": 800,
            "duration_minutes": 360,
            "carbon_kg_co2e": 20,
            "accessibility_rating": 1.5,
            "step_free": False, # FAILS step-free requirement
            "wheelchair_accessible": False,
            "green_accessible_score": 75
        }
        accessible_eco = {
            "id": "accessible_train",
            "transport": "train + shared EV",
            "price": 2500,
            "duration_minutes": 240,
            "carbon_kg_co2e": 28,
            "accessibility_rating": 5.0,
            "accessibility_verified": True,
            "step_free": True,
            "wheelchair_accessible": True,
            "green_accessible_score": 92
        }

        # User requires step_free and wheelchair
        res = generate_eco_twin(
            [baseline, inaccessible_eco, accessible_eco],
            intent={"wheelchair_required": True, "step_free_required": True}
        )
        self.assertTrue(res["available"])
        self.assertEqual(res["eco_twin_option_id"], "accessible_train")
        self.assertNotEqual(res["eco_twin_option_id"], "inaccessible_bus")

    def test_17_privacy_and_permission_checks(self):
        """17. Profile stores non-sensitive travel preferences only and excludes medical diagnoses."""
        profile = AccessibilityProfile.objects.create(
            client_id="privacy_test_user",
            wheelchair_required=True,
            elevator_preferred=True
        )
        data = profile.to_dict()
        # Verify no health/medical condition fields exist
        for key in data:
            self.assertNotIn("medical", key.lower())
            self.assertNotIn("diagnosis", key.lower())
            self.assertNotIn("disability_type", key.lower())

    def test_18_invalid_image_upload(self):
        """18. Rejects empty image uploads."""
        is_valid, err = validate_image_file(None)
        self.assertFalse(is_valid)
        self.assertIn("No image file", err)

    def test_19_oversized_image_upload(self):
        """19. Rejects images exceeding 10MB."""
        large_file = SimpleUploadedFile("big_ramp.jpg", b"0" * (11 * 1024 * 1024), content_type="image/jpeg")
        is_valid, err = validate_image_file(large_file)
        self.assertFalse(is_valid)
        self.assertIn("exceeds 10MB", err)

    def test_20_unsupported_image_type(self):
        """20. Rejects unsupported MIME/extensions (.gif or .txt)."""
        bad_file = SimpleUploadedFile("notes.txt", b"not an image", content_type="text/plain")
        is_valid, err = validate_image_file(bad_file)
        self.assertFalse(is_valid)
        self.assertIn("Unsupported file type", err)
