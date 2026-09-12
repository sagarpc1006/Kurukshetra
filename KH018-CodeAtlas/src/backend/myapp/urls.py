from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/auth/firebase/', views.firebase_auth_sync, name='firebase_auth_sync'),
    path('api/auth/me/', views.current_user_profile, name='current_user_profile'),
    path('api/profile/', views.user_preferences_view, name='user_preferences'),
]
