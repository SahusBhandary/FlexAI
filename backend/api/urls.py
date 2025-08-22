from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test, name='test'),
    path('create_user/', views.create_user, name='create_user'),
    path('user/<int:user_id>/', views.get_user_profile, name='get_user_profile'),
    path('users/', views.list_users, name='list_users'),  
]