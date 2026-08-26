from django.urls import path
from . import views

urlpatterns = [
    path('predict/', views.SkinPredictView.as_view(), name='skin-predict'),
    path('history/', views.SkinHistoryView.as_view(), name='skin-history'),
]
