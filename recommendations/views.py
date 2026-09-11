import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import RecommendationQuerySerializer
from .services.ranking import rank_travel_options
from travel.orchestrator import orchestrate_travel_plan

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def get_recommendations_view(request):
    """
    POST /api/recommendations/
    Direct endpoint for generating scored & ranked recommendations.
    """
    serializer = RecommendationQuerySerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    data = serializer.validated_data
    intent = {
        "origin": data["origin"],
        "destination": data["destination"],
        "budget": data.get("budget"),
        "currency": data.get("currency", "INR"),
        "travel_dates": data.get("travel_dates"),
        "eco_priority": data.get("eco_priority"),
        "accessibility_required": data.get("accessibility_required", False),
    }

    try:
        travel_data = orchestrate_travel_plan(intent)
        recommendations = rank_travel_options(travel_data, intent, custom_weights=data.get("weights"))
        return Response({
            "success": True,
            "intent": intent,
            "travel_data": travel_data,
            "recommendations": recommendations
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error in get_recommendations_view: {e}", exc_info=True)
        return Response({"success": False, "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
