from django.contrib import admin
from .models import PredictionHistory


@admin.register(PredictionHistory)
class PredictionHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'predicted_disease', 'confidence', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'predicted_disease']
