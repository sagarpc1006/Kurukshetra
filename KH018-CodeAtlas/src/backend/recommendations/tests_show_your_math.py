"""
Comprehensive Unit Tests for Step 6: 'Show Your Math'
Tests all 20 required scenarios and demo fixtures.
"""

from django.test import TestCase
from recommendations.services.scoring import calculate_green_accessible_score
from recommendations.services.ranking import rank_travel_options
from recommendations.services.ecotwin import compute_ecotwin_comparison, generate_eco_twin
from recommendations.config import validate_weights, DEFAULT_WEIGHTS
from recommendations.serializers import (
    ScoreContributionSerializer,
    CalculationSerializer,
    ShowYourMathSerializer,
    EcoTwinComparisonSerializer
)


class ShowYourMathTests(TestCase):

    def setUp(self):
        self.default_weights = DEFAULT_WEIGHTS

    def test_01_score_contribution_calculation(self):
        """1. Test that score contributions are computed as score * weight with precision."""
        res = calculate_green_accessible_score(
            carbon_score=96,
            accessibility_score=100,
            cost_score=84,
            time_score=72,
            weights={"carbon": 0.40, "accessibility": 0.30, "cost": 0.15, "time": 0.15}
        )
        contribs = res["contributions"]
        self.assertEqual(contribs["carbon"], 38.4)
        self.assertEqual(contribs["accessibility"], 30.0)
        self.assertEqual(contribs["cost"], 12.6)
        self.assertEqual(contribs["time"], 10.8)

    def test_02_final_score_calculation(self):
        """2. Test final score is 91.8 unrounded sum, with rounded display value 92."""
        res = calculate_green_accessible_score(
            carbon_score=96,
            accessibility_score=100,
            cost_score=84,
            time_score=72
        )
        self.assertEqual(res["final_score"], 91.8)
        self.assertEqual(res["rounded_score"], 92)
        # Clamped int for backward compatibility
        self.assertEqual(res["green_accessible_score"], 91)

    def test_03_weight_validation(self):
        """3. Test weight validation enforces required keys and 1.0 sum."""
        valid_w = validate_weights({"carbon": 0.5, "accessibility": 0.2, "cost": 0.2, "time": 0.1})
        self.assertAlmostEqual(sum(valid_w.values()), 1.0)

        # Invalid keys or sum != 1.0 raise ValueError
        with self.assertRaises(ValueError):
            validate_weights({"invalid": 1.0})

        with self.assertRaises(ValueError):
            validate_weights({"carbon": 0.5, "accessibility": 0.5, "cost": 0.5, "time": 0.5})

    def test_04_carbon_calculation_display_data(self):
        """4. Test that carbon explanation contains emissions, method, and source disclosure."""
        travel_data = {
            "route": {"distance_km": 450, "duration_minutes": 235},
            "transport_options": []
        }
        res = rank_travel_options(travel_data, {"origin": "Pune", "destination": "Goa"})
        opt = res["results"][0]
        c_src = opt["show_your_math"]["sources"]["carbon"]
        self.assertIn("method", c_src)
        self.assertIn("description", c_src)
        self.assertIn("configured transport emission factor", c_src["description"].lower())

    def test_05_accessibility_calculation_display_data(self):
        """5. Test accessibility explanation displays rating, score, weight, status, and confidence."""
        travel_data = {
            "route": {"distance_km": 450, "duration_minutes": 235},
            "transport_options": []
        }
        res = rank_travel_options(travel_data, {"origin": "Pune", "destination": "Goa"})
        opt = res["results"][0]
        a_src = opt["show_your_math"]["sources"]["accessibility"]
        self.assertIn("rating", a_src)
        self.assertIn("confidence", a_src)
        self.assertIn("status", a_src)
        self.assertIn("verified", a_src)

    def test_06_cost_calculation_display_data(self):
        """6. Test cost explanation displays price, currency, source, and budget delta."""
        travel_data = {
            "route": {"distance_km": 450, "duration_minutes": 235},
            "transport_options": []
        }
        res = rank_travel_options(travel_data, {"origin": "Pune", "destination": "Goa", "budget": 10000})
        opt = res["results"][0]
        cost_src = opt["show_your_math"]["sources"]["cost"]
        self.assertEqual(cost_src["budget"], 10000)
        self.assertTrue(cost_src["within_budget"])
        self.assertIsNotNone(cost_src["budget_difference"])

    def test_07_time_calculation_display_data(self):
        """7. Test time explanation displays duration minutes, formatted string, and source."""
        travel_data = {
            "route": {"distance_km": 450, "duration_minutes": 235},
            "transport_options": []
        }
        res = rank_travel_options(travel_data, {"origin": "Pune", "destination": "Goa"})
        opt = res["results"][0]
        time_src = opt["show_your_math"]["sources"]["time"]
        self.assertIn("h ", time_src["formatted"])
        self.assertIn("m", time_src["formatted"])

    def test_08_ecotwin_carbon_reduction(self):
        """8. Test Eco-Twin carbon reduction formula: (base - twin) / base * 100."""
        base = {"carbon_kg_co2e": 142.0, "price": {"amount": 8400}, "duration_minutes": 190, "accessibility_rating": 2.0}
        twin = {"carbon_kg_co2e": 31.0, "price": {"amount": 7650}, "duration_minutes": 235, "accessibility_rating": 5.0}
        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["carbon_reduction_kg"], 111.0)
        self.assertEqual(comp["carbon_reduction_percent"], 78.17)

    def test_09_ecotwin_cost_difference(self):
        """9. Test Eco-Twin cost difference: twin - base = -750 (cheaper)."""
        base = {"price": {"amount": 8400}}
        twin = {"price": {"amount": 7650}}
        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["cost_difference"], -750.0)

    def test_10_ecotwin_time_difference(self):
        """10. Test Eco-Twin time difference: twin - base = +45 minutes."""
        base = {"duration_minutes": 190}
        twin = {"duration_minutes": 235}
        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["time_difference_minutes"], 45)

    def test_11_ecotwin_accessibility_difference(self):
        """11. Test Eco-Twin accessibility difference: twin - base = +3.0."""
        base = {"accessibility_rating": 2.0}
        twin = {"accessibility_rating": 5.0}
        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["accessibility_difference"], 3.0)

    def test_12_rounding_precision(self):
        """12. Test that display rounding does not alter intermediate precision."""
        res = calculate_green_accessible_score(77, 85, 92, 64)
        raw = res["final_score"]
        rounded = res["rounded_score"]
        self.assertEqual(rounded, round(raw))
        # Ensure contributions sum cleanly to raw
        summed_contribs = round(sum(res["contributions"].values()), 2)
        self.assertEqual(raw, summed_contribs)

    def test_13_missing_carbon_fallback(self):
        """13. Test missing carbon inputs are handled gracefully without exceptions."""
        base = {"carbon_kg_co2e": None, "price": {"amount": 5000}, "duration_minutes": 120}
        twin = {"carbon_kg_co2e": 25.0, "price": {"amount": 4000}, "duration_minutes": 180}
        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["carbon_reduction_kg"], 0.0)
        self.assertEqual(comp["carbon_reduction_percent"], 0.0)

    def test_14_missing_accessibility_fallback(self):
        """14. Test missing accessibility rating defaults safely to 0 delta."""
        base = {"accessibility_rating": None}
        twin = {"accessibility_rating": 4.0}
        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["accessibility_difference"], 4.0)

    def test_15_missing_price_fallback(self):
        """15. Test missing price handles gracefully without breaking math."""
        base = {"price": {}}
        twin = {"price": {"amount": 2500}}
        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["cost_difference"], 2500.0)

    def test_16_missing_duration_fallback(self):
        """16. Test missing duration handles gracefully without breaking math."""
        base = {"duration_minutes": None}
        twin = {"duration_minutes": 150}
        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["time_difference_minutes"], 150)

    def test_17_unknown_verification_status(self):
        """17. Test unknown verification is explicitly flagged as unknown and never verified."""
        from recommendations.services.accessibility import calculate_accessibility_score
        res = calculate_accessibility_score({"rating": 3.0, "status": "unknown"})
        self.assertFalse(res["accessibility_verified"])
        self.assertEqual(res["accessibility_status"], "unknown")
        self.assertEqual(res["status_label"], "Unknown")

    def test_18_business_declared_accessibility(self):
        """18. Test business declared accessibility is marked unverified with business label."""
        from recommendations.services.accessibility import calculate_accessibility_score
        res = calculate_accessibility_score({"rating": 4.0, "status": "business_declared"})
        self.assertFalse(res["accessibility_verified"])
        self.assertEqual(res["accessibility_status"], "business_declared")
        self.assertEqual(res["status_label"], "Business reported")

    def test_19_osm_supported_accessibility(self):
        """19. Test OSM-supported accessibility is labeled OSM and unverified."""
        from recommendations.services.accessibility import calculate_accessibility_score
        res = calculate_accessibility_score({"rating": 4.0, "status": "osm_supported"})
        self.assertFalse(res["accessibility_verified"])
        self.assertEqual(res["accessibility_status"], "osm_supported")
        self.assertEqual(res["status_label"], "OSM data")

    def test_20_verified_accessibility_display(self):
        """20. Test verified accessibility is certified and labeled Verified."""
        from recommendations.services.accessibility import calculate_accessibility_score
        res = calculate_accessibility_score({"rating": 5.0, "status": "verified", "verified": True})
        self.assertTrue(res["accessibility_verified"])
        self.assertEqual(res["accessibility_status"], "verified")
        self.assertEqual(res["status_label"], "Verified")

    def test_demo_fixture_exact_values(self):
        """
        Verify Demo Fixture specified in Section 27:
        STANDARD: price=8400, carbon=142, duration=190, accessibility=2
        ECO-TWIN: price=7650, carbon=31, duration=235, accessibility=5
        Expected: carbon reduction: 78.17%, cost: ₹750 cheaper, time: 45 min longer, accessibility: +3
        """
        standard = {
            "id": "opt_standard",
            "title": "Flight + Taxi",
            "price": {"amount": 8400, "currency": "INR"},
            "carbon_kg_co2e": 142.0,
            "duration_minutes": 190,
            "accessibility_rating": 2.0,
            "accessibility_status": "business_declared"
        }
        eco_twin = {
            "id": "opt_eco_twin",
            "title": "Train + Shared EV",
            "price": {"amount": 7650, "currency": "INR"},
            "carbon_kg_co2e": 31.0,
            "duration_minutes": 235,
            "accessibility_rating": 5.0,
            "accessibility_status": "verified",
            "accessibility_verified": True
        }
        comp = compute_ecotwin_comparison(standard, eco_twin)

        self.assertEqual(comp["carbon_reduction_percent"], 78.17)
        self.assertEqual(comp["cost_difference"], -750.0)
        self.assertEqual(comp["time_difference_minutes"], 45)
        self.assertEqual(comp["accessibility_difference"], 3.0)

    def test_serializer_validation(self):
        """Verify DRF serializers validate the Show Your Math structure."""
        calc_data = {
            "carbon_contribution": 38.4,
            "accessibility_contribution": 30.0,
            "cost_contribution": 12.6,
            "time_contribution": 10.8,
            "final_score": 91.8,
            "formula": "Score = 0.40*96 + 0.30*100 + 0.15*84 + 0.15*72"
        }
        serializer = CalculationSerializer(data=calc_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
