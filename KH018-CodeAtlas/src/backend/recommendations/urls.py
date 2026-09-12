from django.urls import path
from .views import get_recommendations_view

urlpatterns = [
    path('', get_recommendations_view, name='get_recommendations'),
]
