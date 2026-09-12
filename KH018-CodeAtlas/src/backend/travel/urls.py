from django.urls import path
from .views import discover_places_view, place_detail_view

urlpatterns = [
    path('', discover_places_view, name='discover_places'),
    path('<str:place_name>/', place_detail_view, name='place_detail'),
]
