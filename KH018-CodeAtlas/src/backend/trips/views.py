import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import SavedTrip
from .serializers import SavedTripCreateSerializer

logger = logging.getLogger(__name__)

class SavedTripListCreateView(APIView):
    """
    GET /api/trips/
    Lists all saved journeys belonging strictly to the authenticated user.

    POST /api/trips/
    Saves a planned or recommended journey to PostgreSQL for the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        trips = SavedTrip.objects.filter(user=user)
        trip_list = [t.to_dict() for t in trips]
        logger.info(f"Retrieved {len(trip_list)} saved trips for user {getattr(user, 'email', user.id)}")
        return Response({
            "success": True,
            "count": len(trip_list),
            "trips": trip_list
        }, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        serializer = SavedTripCreateSerializer(data=request.data)
        if not serializer.is_valid():
            logger.warning(f"Failed trip save validation: {serializer.errors}")
            return Response({
                "success": False,
                "message": "Invalid trip data payload.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        # Save with authenticated user ownership
        saved_trip = serializer.save(user=user)
        logger.info(f"Successfully saved trip {saved_trip.id} ('{saved_trip.title}') for user {getattr(user, 'email', user.id)}")

        return Response({
            "success": True,
            "message": "Trip successfully saved to your collection.",
            "trip": saved_trip.to_dict()
        }, status=status.HTTP_201_CREATED)


class SavedTripDetailView(APIView):
    """
    GET /api/trips/<int:trip_id>/
    Retrieves detailed itinerary and score verification for a specific saved trip.
    Strictly verifies ownership: users can only access their own trips.

    DELETE /api/trips/<int:trip_id>/
    Deletes a saved trip belonging to the authenticated user.
    """
    permission_classes = [IsAuthenticated]

    def _get_user_trip(self, request, trip_id):
        try:
            trip = SavedTrip.objects.get(id=trip_id)
            if trip.user_id != request.user.id:
                logger.warning(f"Unauthorized trip access attempt: User {request.user.id} tried to access trip {trip_id} belonging to user {trip.user_id}")
                return None, status.HTTP_403_FORBIDDEN
            return trip, status.HTTP_200_OK
        except SavedTrip.DoesNotExist:
            return None, status.HTTP_404_NOT_FOUND

    def get(self, request, trip_id):
        trip, err_status = self._get_user_trip(request, trip_id)
        if not trip:
            return Response({
                "success": False,
                "message": "Trip not found or you do not have permission to view it."
            }, status=err_status)

        return Response({
            "success": True,
            "trip": trip.to_dict()
        }, status=status.HTTP_200_OK)

    def delete(self, request, trip_id):
        trip, err_status = self._get_user_trip(request, trip_id)
        if not trip:
            return Response({
                "success": False,
                "message": "Trip not found or you do not have permission to delete it."
            }, status=err_status)

        trip_id_num = trip.id
        trip.delete()
        logger.info(f"Deleted trip {trip_id_num} for user {request.user.id}")

        return Response({
            "success": True,
            "message": "Trip successfully deleted from your collection."
        }, status=status.HTTP_200_OK)
