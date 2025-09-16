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

class Workout(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workouts')
    name = models.CharField(max_length=100)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    is_draft = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'workouts'
        ordering = ['-start_time']
        verbose_name = 'Workouts'
        verbose_name_plural = 'Workouts'
    
    def __str__(self):
        return f"{self.user.first_name}'s {self.name} - {self.start_time.strftime('%Y-%m-%d')}"
    
    """ Calculate the total duration of the workout """
    @property
    def duration(self):
        if self.end_time:
            return int((self.end_time - self.start_time).total_seconds() / 60)
        return None

    @property
    def total_exercises(self):
        return self.exercises.count()

class Exercise(models.Model):
    workout = models.ForeignKey(Workout, on_delete=models.CASCADE, related_name='exercises')
    name = models.CharField(max_length=500)
    pinned_note = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'exercises'
        ordering = ['order', 'created_at']
        verbose_name = 'Exercises'
        verbose_name_plural = 'Exercises'
    
    def __str__(self):
        return f"{self.name} - {self.workout.name}"

    @property
    def total_sets(self):
        return self.sets.count()

class Set(models.Model):
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='sets')
    reps = models.IntegerField()
    weight = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    is_completed = models.BooleanField(default=False)
    previous_weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    previous_reps = models.PositiveIntegerField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sets'
        ordering = ['order', 'created_at']
        verbose_name = 'Sets'
        verbose_name_plural = 'Sets'
    
    def __str__(self):
        return f"Set {self.order + 1}: {self.weight}lbs x {self.reps} - {self.exercise.name}"


