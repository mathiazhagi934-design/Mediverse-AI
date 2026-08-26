from django.db import models
from django.contrib.auth.models import User


class PredictionHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='predictions')
    symptoms = models.JSONField(default=list)
    predicted_disease = models.CharField(max_length=300)
    confidence = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.predicted_disease} ({self.confidence:.1%})"

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Prediction histories'
