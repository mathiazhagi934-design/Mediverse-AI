from django.db import models
from django.contrib.auth.models import User


class MedicalReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    file = models.FileField(upload_to='uploads/reports/')
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0)
    extracted_text = models.TextField(blank=True, default='')
    extracted_data = models.JSONField(default=dict, blank=True)
    analysis = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report: {self.original_filename} ({self.user.username})"

    class Meta:
        ordering = ['-created_at']
