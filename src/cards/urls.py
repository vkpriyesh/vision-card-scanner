from django.urls import path
from . import views

urlpatterns = [
    path('', views.upload_view, name='upload'),
    path('analyze/', views.analyze_card, name='analyze_card'),
]