from django.contrib import admin
from django.contrib.auth.models import User
from .models import PatientProfile


@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'full_name', 'age', 'gender', 'blood_group']
    search_fields = ['user__username', 'user__email', 'full_name']
