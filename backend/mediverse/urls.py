from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/disease/', include('disease.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/skin/', include('skin.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/assistant/', include('assistant.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)