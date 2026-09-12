from django.test import TestCase
from recommendations.config import DEFAULT_WEIGHTS, validate_weights, FALLBACK_EMISSION_FACTORS
from recommendations.services.carbon import calculate_carbon_emissions, calculate_carbon_score
from recommendations.services.accessibility import calculate_accessibility_score
from recommendations.services.cost import calculate_cost_score, evaluate_budget_compliance
from recommendations.services.time import calculate_time_score
from recommendations.services.scoring import calculate_green_accessible_score
from recommendations.services.ranking import rank_travel_options

class RecommendationEngineTestCase(TestCase):
    """
    Comprehensive test suite covering all 13 required scenarios for
    Recommendation Engine and Green & Accessible Scoring.
    """

    def test_1_carbon_emissions_and_score_calculation(self):
        """1. Test carbon emissions from factors and normalized scoring."""
        # Train factor is 0.035 kg CO2e / km
        dist = 400.0
        emissions = calculate_carbon_emissions("train", distance_km=dist)
        self.assertEqual(emissions["kg_co2e"], 14.0)
        self.assertEqual(emissions["method"], "fallback_factor")

        # Carbon score: low emissions should yield high score (>= 90)
        score = calculate_carbon_score(14.0)
        self.assertGreaterEqual(score, 90)
        self.assertLessEqual(score, 100)

    def test_2_accessibility_score_conversion(self):
        """2. Test conversion: AccessScore = accessibility_rating * 20."""
        cases = [
            (0, 0),
            (1, 20),
            (2, 40),
            (3, 60),
            (4, 80),
            (5, 100),
            (2.5, 50),
        ]
        for rating, expected_score in cases:
            res = calculate_accessibility_score({"rating": rating, "verified": True})
            self.assertEqual(res["accessibility_score"], expected_score)
            self.assertEqual(res["accessibility_status"], "verified")

    def test_3_cost_score_normalization(self):
        """3. Test cost scoring: cheapest option receives highest score."""
        cheapest_score = calculate_cost_score(1000, min_cost=1000, max_cost=5000)
        expensive_score = calculate_cost_score(5000, min_cost=1000, max_cost=5000)
        self.assertEqual(cheapest_score, 100)
        self.assertLess(expensive_score, cheapest_score)
        self.assertGreaterEqual(expensive_score, 0)

    def test_4_time_score_normalization(self):
        """4. Test time scoring: shortest duration receives highest score."""
        fastest_score = calculate_time_score(60, min_duration=60, max_duration=480)
        slowest_score = calculate_time_score(480, min_duration=60, max_duration=480)
        self.assertEqual(fastest_score, 100)
        self.assertLess(slowest_score, fastest_score)

    def test_5_final_weighted_score_formula(self):
        """
        5. Verify exact project formula test example:
        CarbonScore = 96, AccessScore = 100, CostScore = 84, TimeScore = 72
        Formula: 0.40*96 + 0.30*100 + 0.15*84 + 0.15*72 = 91
        """
        res = calculate_green_accessible_score(
            carbon_score=96,
            accessibility_score=100,
            cost_score=84,
            time_score=72
        )
        self.assertEqual(res["green_accessible_score"], 91)
        self.assertEqual(res["carbon_score"], 96)
        self.assertEqual(res["accessibility_score"], 100)
        self.assertEqual(res["cost_score"], 84)
        self.assertEqual(res["time_score"], 72)

    def test_6_ranking_order(self):
        """6. Test ranking logic: options ordered descending by score with correct ranks."""
        travel_data = {
            "route": {"distance_km": 400, "duration_minutes": 300},
            "transport_options": [
                {"airline": "TestAir", "price": 8000, "duration_minutes": 60, "currency": "INR", "source": "duffel_test"}
            ]
        }
        intent = {"origin": "Pune", "destination": "Goa", "budget": 10000}
        ranked = rank_travel_options(travel_data, intent)

        results = ranked["results"]
        self.assertGreater(len(results), 1)
        # Verify rank 1 has highest or equal score to rank 2
        for i in range(len(results) - 1):
            self.assertGreaterEqual(results[i]["green_accessible_score"], results[i+1]["green_accessible_score"])
            self.assertEqual(results[i]["rank"], i + 1)

    def test_7_budget_handling(self):
        """7. Test budget compliance: options over budget flagged properly."""
        within = evaluate_budget_compliance(amount=4500, budget=5000)
        self.assertTrue(within["within_budget"])
        self.assertFalse(within["over_budget"])
        self.assertEqual(within["budget_delta"], 500)

        over = evaluate_budget_compliance(amount=6000, budget=5000)
        self.assertFalse(over["within_budget"])
        self.assertTrue(over["over_budget"])
        self.assertEqual(over["budget_delta"], -1000)

    def test_8_missing_accessibility_data(self):
        """8. Missing accessibility data: conservative rating 2.5, score 50, marked unknown."""
        res_none = calculate_accessibility_score(None)
        self.assertEqual(res_none["accessibility_score"], 50)
        self.assertEqual(res_none["accessibility_status"], "unknown")
        self.assertFalse(res_none["accessibility_verified"])

        res_empty = calculate_accessibility_score({})
        self.assertEqual(res_empty["accessibility_score"], 50)
        self.assertEqual(res_empty["accessibility_status"], "unknown")
        self.assertFalse(res_empty["accessibility_verified"])

    def test_9_missing_carbon_data(self):
        """9. Missing carbon data: fallback without crashing."""
        res = calculate_carbon_emissions("unknown_mode", distance_km=None)
        self.assertIn("kg_co2e", res)
        self.assertGreater(res["kg_co2e"], 0)
        self.assertEqual(res["method"], "estimated_baseline")

        score = calculate_carbon_score(None)
        self.assertEqual(score, 50)

    def test_10_missing_price(self):
        """10. Missing price: returns baseline neutral score without error."""
        score_none = calculate_cost_score(None)
        self.assertEqual(score_none, 50)

        score_zero = calculate_cost_score(0)
        self.assertEqual(score_zero, 50)

    def test_11_missing_duration(self):
        """11. Missing duration: returns baseline neutral score without error."""
        score_none = calculate_time_score(None)
        self.assertEqual(score_none, 50)

        score_zero = calculate_time_score(0)
        self.assertEqual(score_zero, 50)

    def test_12_invalid_values_clamping(self):
        """12. Scores must strictly stay within 0-100 regardless of input."""
        res_high = calculate_green_accessible_score(150, 200, 110, 120)
        self.assertEqual(res_high["green_accessible_score"], 100)

        res_low = calculate_green_accessible_score(-50, -20, -10, -5)
        self.assertEqual(res_low["green_accessible_score"], 0)

    def test_13_weight_validation(self):
        """13. Weight validation: rejects negative weights, invalid keys, non-summing weights."""
        valid = {"carbon": 0.50, "accessibility": 0.20, "cost": 0.15, "time": 0.15}
        validated = validate_weights(valid)
        self.assertEqual(validated["carbon"], 0.50)

        # Rejects sum != 1.0
        with self.assertRaises(ValueError):
            validate_weights({"carbon": 0.50, "accessibility": 0.20, "cost": 0.15, "time": 0.20})

        # Rejects negative weight
        with self.assertRaises(ValueError):
            validate_weights({"carbon": -0.10, "accessibility": 0.60, "cost": 0.25, "time": 0.25})

        # Rejects non-numeric
        with self.assertRaises(ValueError):
            validate_weights({"carbon": "high", "accessibility": 0.30, "cost": 0.15, "time": 0.15})


class EcoTwinTestCase(TestCase):
    """
    Comprehensive test suite covering all 19 required Eco-Twin scenarios
    plus the Section 18 Demo Test Fixture (Pune to Goa).
    """

    def setUp(self):
        self.demo_option_a = {
            "id": "demo_standard",
            "title": "Flight + Taxi",
            "transport": "flight + taxi",
            "price": 8400,
            "currency": "INR",
            "duration_minutes": 190,
            "carbon_kg_co2e": 142.0,
            "accessibility_rating": 2.0,
            "accessibility_verified": False,
            "green_accessible_score": 65
        }
        self.demo_option_b = {
            "id": "demo_eco_twin",
            "title": "Train + Shared EV",
            "transport": "train + shared EV",
            "price": 7650,
            "currency": "INR",
            "duration_minutes": 235,
            "carbon_kg_co2e": 31.0,
            "accessibility_rating": 5.0,
            "accessibility_verified": True,
            "green_accessible_score": 91
        }

    def test_1_baseline_selection(self):
        """1. Test baseline selection: picks flight or highest carbon option, or explicit baseline_id."""
        from recommendations.services.ecotwin import identify_baseline_option
        options = [
            {"id": "opt_train", "transport": {"mode": "train"}, "carbon": {"kg_co2e": 20}},
            {"id": "opt_flight", "transport": {"mode": "flight"}, "carbon": {"kg_co2e": 120}},
            {"id": "opt_ev", "transport": {"mode": "ev"}, "carbon": {"kg_co2e": 15}},
        ]
        # Auto-detect flight baseline
        baseline = identify_baseline_option(options)
        self.assertEqual(baseline["id"], "opt_flight")

        # Explicit baseline_id override
        custom_base = identify_baseline_option(options, baseline_id="opt_ev")
        self.assertEqual(custom_base["id"], "opt_ev")

    def test_2_ecotwin_selection(self):
        """2. Test Eco-Twin selection: selects best green alternative based on Green & Accessible Score."""
        from recommendations.services.ecotwin import generate_eco_twin
        options = [self.demo_option_a, self.demo_option_b]
        res = generate_eco_twin(options, intent={"budget": 10000})
        self.assertTrue(res["available"])
        self.assertEqual(res["eco_twin_option_id"], "demo_eco_twin")
        self.assertEqual(res["baseline_option_id"], "demo_standard")

    def test_3_lower_carbon_alternative(self):
        """3. Candidate with lower carbon qualifies; candidate with equal/higher carbon is rejected."""
        from recommendations.services.ecotwin import select_eco_twin_candidate
        base = {"id": "base", "carbon_kg_co2e": 100, "green_accessible_score": 50}
        cand_higher = {"id": "c1", "carbon_kg_co2e": 110, "green_accessible_score": 80}
        cand_lower = {"id": "c2", "carbon_kg_co2e": 40, "green_accessible_score": 75}

        selected = select_eco_twin_candidate([base, cand_higher, cand_lower], base)
        self.assertIsNotNone(selected)
        self.assertEqual(selected["id"], "c2")

    def test_4_cheaper_ecotwin(self):
        """4. Cheaper Eco-Twin: cost difference is negative, formatted as '₹X cheaper'."""
        from recommendations.services.ecotwin import generate_eco_twin
        res = generate_eco_twin([self.demo_option_a, self.demo_option_b])
        comp = res["comparison"]
        self.assertEqual(comp["cost_difference"], -750)
        self.assertTrue(any("750 cheaper" in s for s in res["summary"]))

    def test_5_more_expensive_ecotwin(self):
        """5. More expensive Eco-Twin: allowed if it provides meaningful carbon reduction."""
        from recommendations.services.ecotwin import generate_eco_twin
        base = {"id": "base", "transport": "flight", "price": 5000, "carbon_kg_co2e": 100, "duration_minutes": 100, "accessibility_rating": 3, "green_accessible_score": 60}
        expensive_twin = {"id": "twin", "transport": "luxury_ev_train", "price": 5500, "carbon_kg_co2e": 20, "duration_minutes": 120, "accessibility_rating": 4, "green_accessible_score": 85}

        res = generate_eco_twin([base, expensive_twin])
        self.assertTrue(res["available"])
        self.assertEqual(res["comparison"]["cost_difference"], 500)
        self.assertTrue(any("500 more" in s for s in res["summary"]))

    def test_6_longer_ecotwin(self):
        """6. Longer Eco-Twin: time difference is positive, formatted as 'X minutes longer'."""
        from recommendations.services.ecotwin import generate_eco_twin
        res = generate_eco_twin([self.demo_option_a, self.demo_option_b])
        comp = res["comparison"]
        self.assertEqual(comp["time_difference_minutes"], 45)
        self.assertTrue(any("45 minutes longer" in s for s in res["summary"]))

    def test_7_better_accessibility(self):
        """7. Better accessibility: highlights improvement from baseline rating to twin rating."""
        from recommendations.services.ecotwin import generate_eco_twin
        res = generate_eco_twin([self.demo_option_a, self.demo_option_b])
        comp = res["comparison"]
        self.assertEqual(comp["accessibility_difference"], 3.0)
        self.assertTrue(any("Accessibility improved from 2/5 to 5/5" in s for s in res["summary"]))

    def test_8_worse_accessibility(self):
        """8. Worse accessibility: accurately reports lower accessibility without claiming full accessibility."""
        from recommendations.services.ecotwin import generate_eco_twin
        base = {"id": "base", "transport": "flight", "carbon_kg_co2e": 100, "accessibility_rating": 4.0, "green_accessible_score": 60}
        twin_low_acc = {"id": "twin", "transport": "bus", "carbon_kg_co2e": 30, "accessibility_rating": 2.0, "accessibility_verified": False, "green_accessible_score": 70}

        res = generate_eco_twin([base, twin_low_acc])
        self.assertTrue(res["available"])
        self.assertEqual(res["comparison"]["accessibility_difference"], -2.0)
        self.assertTrue(any("Accessibility: 2/5" in s for s in res["summary"]))
        self.assertFalse(res["eco_twin"]["accessibility_verified"])

    def test_9_missing_carbon_data(self):
        """9. Missing carbon data: handles gracefully without crashing or claiming unverified reduction."""
        from recommendations.services.ecotwin import generate_eco_twin
        base = {"id": "base", "transport": "flight", "carbon_kg_co2e": None, "accessibility_rating": 3.0}
        twin = {"id": "twin", "transport": "train", "carbon_kg_co2e": 25.0, "accessibility_rating": 4.0}

        res = generate_eco_twin([base, twin])
        self.assertFalse(res["available"])
        self.assertIn("reason", res)

    def test_10_missing_accessibility_data(self):
        """10. Missing accessibility data: marks accessibility_status unknown without crashing."""
        from recommendations.services.ecotwin import generate_eco_twin
        base = {"id": "base", "transport": "flight", "carbon_kg_co2e": 100, "accessibility_rating": None}
        twin = {"id": "twin", "transport": "train", "carbon_kg_co2e": 20, "accessibility_rating": None}

        res = generate_eco_twin([base, twin])
        self.assertTrue(res["available"])
        self.assertEqual(res["baseline"]["accessibility_status"], "unknown")
        self.assertEqual(res["eco_twin"]["accessibility_status"], "unknown")

    def test_11_no_valid_ecotwin(self):
        """11. No valid Eco-Twin: when no greener alternative exists, returns available: False."""
        from recommendations.services.ecotwin import generate_eco_twin
        # Only one option or all others have higher carbon
        base = {"id": "base", "transport": "train", "carbon_kg_co2e": 15}
        higher = {"id": "plane", "transport": "flight", "carbon_kg_co2e": 150}

        res = generate_eco_twin([base, higher], baseline_id="base")
        self.assertFalse(res["available"])
        self.assertEqual(res["reason"], "No suitable lower-carbon alternative found.")

    def test_12_budget_constraint(self):
        """12. Budget constraint: rejects options exceeding budget when hard_budget is specified."""
        from recommendations.services.ecotwin import generate_eco_twin
        base = {"id": "base", "transport": "flight", "price": 4000, "carbon_kg_co2e": 100}
        over_budget_twin = {"id": "twin", "transport": "high_speed_rail", "price": 8000, "carbon_kg_co2e": 20}

        # Hard budget of 5000 should reject twin
        res = generate_eco_twin([base, over_budget_twin], intent={"budget": 5000, "hard_budget": True})
        self.assertFalse(res["available"])

    def test_13_hard_accessibility_constraint(self):
        """13. Hard accessibility constraint: rejects candidate failing required accessibility."""
        from recommendations.services.ecotwin import generate_eco_twin
        base = {"id": "base", "transport": "flight", "carbon_kg_co2e": 100, "accessibility_rating": 3.0}
        inaccessible_twin = {"id": "twin", "transport": "coach", "carbon_kg_co2e": 20, "accessibility_rating": 2.0}

        res = generate_eco_twin(
            [base, inaccessible_twin],
            intent={"accessibility_required": True, "min_accessibility_rating": 4.0}
        )
        self.assertFalse(res["available"])

    def test_14_carbon_reduction_calculation(self):
        """14. Deterministic carbon reduction calculation: baseline_carbon - eco_twin_carbon."""
        from recommendations.services.ecotwin import compute_ecotwin_comparison
        base = {"carbon_kg_co2e": 142.0, "price": {"amount": 8400}, "duration_minutes": 190, "accessibility_rating": 2.0, "green_accessible_score": 65}
        twin = {"carbon_kg_co2e": 31.0, "price": {"amount": 7650}, "duration_minutes": 235, "accessibility_rating": 5.0, "green_accessible_score": 91}

        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["carbon_reduction_kg"], 111.0)
        # 111 / 142 * 100 = 78.169%
        self.assertAlmostEqual(comp["carbon_reduction_percent"], 78.17, places=1)

    def test_15_cost_difference_calculation(self):
        """15. Deterministic cost difference calculation: eco_twin_cost - baseline_cost."""
        from recommendations.services.ecotwin import compute_ecotwin_comparison
        base = {"carbon_kg_co2e": 142.0, "price": {"amount": 8400}, "duration_minutes": 190, "accessibility_rating": 2.0, "green_accessible_score": 65}
        twin = {"carbon_kg_co2e": 31.0, "price": {"amount": 7650}, "duration_minutes": 235, "accessibility_rating": 5.0, "green_accessible_score": 91}

        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["cost_difference"], -750.0)

    def test_16_time_difference_calculation(self):
        """16. Deterministic time difference calculation: eco_twin_duration - baseline_duration."""
        from recommendations.services.ecotwin import compute_ecotwin_comparison
        base = {"carbon_kg_co2e": 142.0, "price": {"amount": 8400}, "duration_minutes": 190, "accessibility_rating": 2.0, "green_accessible_score": 65}
        twin = {"carbon_kg_co2e": 31.0, "price": {"amount": 7650}, "duration_minutes": 235, "accessibility_rating": 5.0, "green_accessible_score": 91}

        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["time_difference_minutes"], 45)

    def test_17_accessibility_difference_calculation(self):
        """17. Deterministic accessibility difference calculation: eco_twin_rating - baseline_rating."""
        from recommendations.services.ecotwin import compute_ecotwin_comparison
        base = {"carbon_kg_co2e": 142.0, "price": {"amount": 8400}, "duration_minutes": 190, "accessibility_rating": 2.0, "green_accessible_score": 65}
        twin = {"carbon_kg_co2e": 31.0, "price": {"amount": 7650}, "duration_minutes": 235, "accessibility_rating": 5.0, "green_accessible_score": 91}

        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["accessibility_difference"], 3.0)

    def test_18_score_difference_calculation(self):
        """18. Deterministic score difference calculation: eco_twin_score - baseline_score."""
        from recommendations.services.ecotwin import compute_ecotwin_comparison
        base = {"carbon_kg_co2e": 142.0, "price": {"amount": 8400}, "duration_minutes": 190, "accessibility_rating": 2.0, "green_accessible_score": 65}
        twin = {"carbon_kg_co2e": 31.0, "price": {"amount": 7650}, "duration_minutes": 235, "accessibility_rating": 5.0, "green_accessible_score": 91}

        comp = compute_ecotwin_comparison(base, twin)
        self.assertEqual(comp["score_difference"], 26.0)

    def test_19_dynamic_explanation_generation(self):
        """19. Test dynamic explanation strings and why_eco_twin points generated from calculations."""
        from recommendations.services.ecotwin import generate_eco_twin
        res = generate_eco_twin([self.demo_option_a, self.demo_option_b], intent={"budget": 10000})
        self.assertTrue(len(res["summary"]) >= 3)
        self.assertTrue(len(res["why_eco_twin"]) >= 3)
        self.assertIn("headline", res)
        self.assertTrue(any("less carbon" in s for s in res["summary"]))
        self.assertTrue(any("cheaper" in s for s in res["summary"]))

    def test_20_demo_test_case_pune_to_goa(self):
        """
        20. Deterministic Demo Test Case from Section 18:
        Pune to Goa under ₹10,000.
        Option A: Flight + Taxi (8400 INR, 190 min, 142 kg CO2e, Access 2/5)
        Option B: Train + Shared EV (7650 INR, 235 min, 31 kg CO2e, Access 5/5)
        Expected:
        - Option B selected as Eco-Twin of Option A
        - ~78% lower carbon (78.17%)
        - ₹750 cheaper
        - 45 minutes longer
        - Accessibility improves 2/5 -> 5/5
        """
        from recommendations.services.ecotwin import generate_eco_twin
        intent = {
            "origin": "Pune",
            "destination": "Goa",
            "budget": 10000,
            "currency": "INR",
        }
        res = generate_eco_twin([self.demo_option_a, self.demo_option_b], intent=intent)

        self.assertTrue(res["available"])
        self.assertEqual(res["baseline_option_id"], "demo_standard")
        self.assertEqual(res["eco_twin_option_id"], "demo_eco_twin")

        comp = res["comparison"]
        self.assertAlmostEqual(comp["carbon_reduction_percent"], 78.17, places=1)
        self.assertEqual(comp["carbon_reduction_kg"], 111.0)
        self.assertEqual(comp["cost_difference"], -750.0)
        self.assertEqual(comp["time_difference_minutes"], 45)
        self.assertEqual(comp["accessibility_difference"], 3.0)
        self.assertEqual(comp["score_difference"], 26.0)

        # Truthful facts verification
        summary = res["summary"]
        self.assertTrue(any("78% less carbon" in s for s in summary))
        self.assertTrue(any("750 cheaper" in s for s in summary))
        self.assertTrue(any("45 minutes longer" in s for s in summary))
        self.assertTrue(any("Accessibility improved from 2/5 to 5/5" in s for s in summary))

        # Check weights are saved with result
        self.assertIn("weights", res)
        self.assertEqual(res["weights"]["carbon"], 0.40)
        self.assertEqual(res["weights"]["accessibility"], 0.30)
        self.assertEqual(res["weights"]["cost"], 0.15)
        self.assertEqual(res["weights"]["time"], 0.15)
