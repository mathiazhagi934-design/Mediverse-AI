from django.urls import path
from . import views

urlpatterns = [
    path('predict/', views.DiseasePredictView.as_view(), name='disease-predict'),
    path('symptoms/', views.SymptomListView.as_view(), name='symptom-list'),
    path('predictions/history/', views.PredictionHistoryView.as_view(), name='prediction-history'),
]
