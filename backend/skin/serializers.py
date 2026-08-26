from rest_framework import serializers
from .models import SkinPrediction


class SkinPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkinPrediction
        fields = [
            'id', 'prediction', 'confidence', 'is_model_available', 'created_at',
        ]
        read_only_fields = fields


class SkinUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()
