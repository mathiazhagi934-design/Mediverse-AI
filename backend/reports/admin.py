from django.contrib import admin
from .models import MedicalReport


@admin.register(MedicalReport)
class MedicalReportAdmin(admin.ModelAdmin):
    list_display = ['user', 'original_filename', 'file_size', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'original_filename']
