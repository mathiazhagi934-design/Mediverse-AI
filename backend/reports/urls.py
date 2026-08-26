from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.ReportUploadView.as_view(), name='report-upload'),
    path('', views.ReportListView.as_view(), name='report-list'),
    path('<int:pk>/', views.ReportDetailView.as_view(), name='report-detail'),
]
