from django.contrib import admin
from .models import SkinPrediction


@admin.register(SkinPrediction)
class SkinPredictionAdmin(admin.ModelAdmin):
    list_display = ['user', 'prediction', 'confidence', 'is_model_available', 'created_at']
    list_filter = ['created_at', 'is_model_available']
    search_fields = ['user__username', 'prediction']
