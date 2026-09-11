from rest_framework import serializers

class RecommendationQuerySerializer(serializers.Serializer):
    origin = serializers.CharField(required=True, max_length=150)
    destination = serializers.CharField(required=True, max_length=150)
    budget = serializers.FloatField(required=False, allow_null=True)
    currency = serializers.CharField(required=False, default="INR", max_length=10)
    travel_dates = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    eco_priority = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    accessibility_required = serializers.BooleanField(required=False, default=False)
    weights = serializers.DictField(required=False, allow_null=True)


class ScoreContributionSerializer(serializers.Serializer):
    score = serializers.IntegerField(min_value=0, max_value=100)
    weight = serializers.FloatField(min_value=0.0, max_value=1.0)
    contribution = serializers.FloatField()
    formula = serializers.CharField(required=False, allow_blank=True)


class CalculationSerializer(serializers.Serializer):
    carbon_contribution = serializers.FloatField()
    accessibility_contribution = serializers.FloatField()
    cost_contribution = serializers.FloatField()
    time_contribution = serializers.FloatField()
    final_score = serializers.FloatField()
    formula = serializers.CharField(required=False, allow_blank=True)


class ShowYourMathSerializer(serializers.Serializer):
    weights = serializers.DictField()
    scores = serializers.DictField()
    inputs = serializers.DictField()
    contributions = serializers.DictField()
    calculation = serializers.DictField()
    final_score = serializers.FloatField()
    rounded_score = serializers.IntegerField()
    sources = serializers.DictField(required=False)


class EcoTwinComparisonSerializer(serializers.Serializer):
    baseline = serializers.DictField(required=False)
    eco_twin = serializers.DictField(required=False)
    carbon_reduction_kg = serializers.FloatField()
    carbon_reduction_percent = serializers.FloatField()
    cost_difference = serializers.FloatField()
    time_difference_minutes = serializers.IntegerField()
    accessibility_difference = serializers.FloatField()
    score_difference = serializers.FloatField(required=False)
    headline = serializers.CharField(required=False, allow_blank=True)
    why_eco_twin = serializers.ListField(child=serializers.CharField(), required=False)

