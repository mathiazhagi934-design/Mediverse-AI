from django.db import models
from django.contrib.auth.models import User


class PatientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=200, blank=True, default='')
    age = models.PositiveIntegerField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    height = models.FloatField(null=True, blank=True, help_text='Height in cm')
    weight = models.FloatField(null=True, blank=True, help_text='Weight in kg')
    blood_group = models.CharField(max_length=5, blank=True, default='')
    allergies = models.TextField(blank=True, default='')
    existing_conditions = models.TextField(blank=True, default='')
    emergency_contact = models.CharField(max_length=200, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.username}"

    class Meta:
        ordering = ['-created_at']
