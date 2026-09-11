from django.http import HttpResponse, JsonResponse

def index(request):
    return HttpResponse("Travel Recommendation System Backend API")
