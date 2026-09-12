from django.db import models

class Feature(models.Model):
    name = models.CharField(max_length=100)
    details = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    firebase_uid = models.CharField(max_length=128, unique=True, db_index=True)
    name = models.CharField(max_length=255, blank=True, default='')
    display_name = models.CharField(max_length=255, blank=True, default='')
    email = models.EmailField(max_length=255)
    photo_url = models.URLField(max_length=1024, blank=True, default='')
    
    # Travel Preferences (persisted in PostgreSQL)
    preferred_currency = models.CharField(max_length=10, default='INR')
    eco_priority = models.CharField(max_length=50, default='high')
    budget_preference = models.IntegerField(default=10000, null=True, blank=True)
    preferred_transport = models.CharField(max_length=50, blank=True, default='')
    home_city = models.CharField(max_length=100, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.display_name and not self.name:
            self.name = self.display_name
        elif self.name and not self.display_name:
            self.display_name = self.name
        super().save(*args, **kwargs)

    @property
    def is_authenticated(self):
        """Allows DRF IsAuthenticated permission checks to succeed."""
        return True

    @property
    def is_anonymous(self):
        return False

    def to_dict(self):
        return {
            "id": self.id,
            "firebase_uid": self.firebase_uid,
            "name": self.name or self.display_name,
            "display_name": self.display_name or self.name,
            "email": self.email,
            "photo_url": self.photo_url,
            "preferred_currency": self.preferred_currency,
            "eco_priority": self.eco_priority,
            "budget_preference": self.budget_preference,
            "preferred_transport": self.preferred_transport,
            "home_city": self.home_city,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __str__(self):
        return f"{self.email} ({self.firebase_uid})"
