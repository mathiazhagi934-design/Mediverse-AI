from rest_framework import serializers
from .models import PredictionHistory


class PredictSerializer(serializers.Serializer):
    symptoms = serializers.ListField(
        child=serializers.CharField(max_length=100),
        min_length=1,
        max_length=20,
    )


class PredictionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictionHistory
        fields = ['id', 'symptoms', 'predicted_disease', 'confidence', 'created_at']
        read_only_fields = fields
