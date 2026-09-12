from django.urls import path
from . import views

urlpatterns = [
    path('', views.SavedTripListCreateView.as_view(), name='trip_list_create'),
    path('<int:trip_id>/', views.SavedTripDetailView.as_view(), name='trip_detail'),
]
