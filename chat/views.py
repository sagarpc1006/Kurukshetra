import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import ChatRequestSerializer
from .services import process_chat_message

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_view(request):
    """
    POST /api/chat/
    Protected endpoint: Requires Firebase ID token.
    Parses natural language prompt, aggregates external travel data,
    computes deterministic Green & Accessible Score, identifies Eco-Twin,
    builds Itinerary, and provides Show Your Math breakdown.
    """
    serializer = ChatRequestSerializer(data=request.data)
    if not serializer.is_valid():
        error_msg = serializer.errors.get('message', ['Invalid request payload.'])[0]
        return Response(
            {"success": False, "message": str(error_msg)},
            status=status.HTTP_400_BAD_REQUEST
        )

    user_message = serializer.validated_data['message'].strip()

    if not user_message:
        return Response(
            {"success": False, "message": "Travel request message cannot be empty."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(user_message) > 2000:
        return Response(
            {"success": False, "message": "Message is too long. Please summarize your travel request in under 2000 characters."},
            status=status.HTTP_400_BAD_REQUEST
        )

    user_id = getattr(request.user, 'id', 'anonymous')
    logger.info(f"Processing travel chat request for user ID {user_id}")

    try:
        result = process_chat_message(user_message, user=request.user)
        if not result.get("success"):
            msg = result.get("message", "The travel planning service is temporarily unavailable.")
            status_code = status.HTTP_400_BAD_REQUEST if "destination" in msg.lower() else status.HTTP_503_SERVICE_UNAVAILABLE
            return Response(
                {
                    "success": False,
                    "message": msg
                },
                status=status_code
            )

        logger.info(f"Successfully processed travel plan for user ID {user_id}")
        return Response(result, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Unexpected error in chat_view: {e}", exc_info=True)
        return Response(
            {
                "success": False,
                "message": "An unexpected error occurred while processing your travel request. Please try again."
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
