from django.db import models
from django.contrib.auth.models import User


class SkinPrediction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skin_predictions')
    image = models.ImageField(upload_to='uploads/skin/')
    prediction = models.CharField(max_length=300, blank=True, default='')
    confidence = models.FloatField(default=0.0)
    is_model_available = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Skin prediction: {self.prediction or 'N/A'} ({self.user.username})"

    class Meta:
        ordering = ['-created_at']
