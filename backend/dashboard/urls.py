from django.urls import path
from . import views

urlpatterns = [
    path('', views.DashboardView.as_view(), name='dashboard'),
    path('analytics/', views.AnalyticsView.as_view(), name='dashboard-analytics'),
    path('timeline/', views.TimelineView.as_view(), name='dashboard-timeline'),
    path('health-score-history/', views.HealthScoreHistoryView.as_view(), name='health-score-history'),
]