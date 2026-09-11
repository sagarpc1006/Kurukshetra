from django.db import models

class Feature(models.Model):
    name = models.CharField(max_length=100)
    details = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    firebase_uid = models.CharField(max_length=128, unique=True, db_index=True)
    name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_authenticated(self):
        """Allows DRF IsAuthenticated permission checks to succeed."""
        return True

    @property
    def is_anonymous(self):
        return False

    def __str__(self):
        return f"{self.email} ({self.firebase_uid})"
