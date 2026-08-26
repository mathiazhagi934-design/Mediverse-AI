from rest_framework import serializers
from .models import MedicalReport


class MedicalReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReport
        fields = [
            'id', 'original_filename', 'file_size', 'extracted_text',
            'extracted_data', 'analysis', 'created_at',
        ]
        read_only_fields = fields


class UploadReportSerializer(serializers.Serializer):
    file = serializers.FileField()
