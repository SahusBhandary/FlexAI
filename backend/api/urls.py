from django.urls import path
from . import views

urlpatterns = [
    path('test/', views.test, name='test'),
    path('create_user/', views.create_user, name='create_user'),
    path('login/', views.login_user, name='login_user'),
    path('refresh/', views.refresh_token, name='refresh_token'),
    path('chat/', views.open_ai_chat, name='chat_ai'),
    path('create-workout/', views.create_workout, name='create_workout'),
    path('update-workout-progress/<int:workout_id>/', views.update_workout, name='update_workout_progress'),
    path('complete-workout/<int:workout_id>/', views.complete_workout, name='complete_workout'),
    path('get-workouts/', views.get_workouts, name='get_workouts')
]