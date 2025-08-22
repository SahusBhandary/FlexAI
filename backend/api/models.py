from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class UserProfile(models.Model):
    ACTIVITY_CHOICES = [
        ('1-2', '1-2 days a week'),
        ('3-5', '3-5 days a week'),
        ('6-7', '6-7 days a week'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    height_feet = models.IntegerField()
    height_inches = models.IntegerField() 
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    activity_level = models.CharField(max_length=3, choices=ACTIVITY_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"{self.user.first_name}'s Profile"