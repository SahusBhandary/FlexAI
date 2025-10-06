from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import transaction, IntegrityError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from .models import UserProfile, Workout, Exercise, Set, Food
from django.conf import settings
import json
import logging
from openai import OpenAI

logger = logging.getLogger(__name__)

client = OpenAI(api_key=settings.OPENAI_API_KEY)

# Create your views here.
def test(request):
    return JsonResponse({"message": "API is working"})
@csrf_exempt
def create_user(request):
    if request.method == 'POST':
        # Check if the content is JSON
        if request.content_type == 'application/json':
            try:
                # Parse the JSON data from request.body
                data = json.loads(request.body)
                name = data.get('name')
                height_feet = data.get('height_feet')
                height_inches = data.get('height_inches')
                weight = data.get('weight')
                activity_level = data.get('activity_level')
                email = data.get('email')
                password = data.get('password')
            except json.JSONDecodeError:
                return JsonResponse({
                    "status": "error",
                    "message": "Invalid JSON format"
                }, status=400)

        # Validating Data
        missing_fields = []
        if not name:
            missing_fields.append('name')
        if not height_feet:
            missing_fields.append('height_feet')
        if not height_inches:
            missing_fields.append('height_inches')
        if not weight:
            missing_fields.append('weight')
        if not activity_level:
            missing_fields.append('activity_level')
        if not email:
            missing_fields.append('email')
        if not password:
            missing_fields.append('password')

        if missing_fields:
            return JsonResponse({
                "status": "error",
                "message": "Missing required fields",
                "missing_fields": missing_fields
            }, status=400)
        
        if User.objects.filter(email=email).exists():
            return JsonResponse({
                "status": "error",
                "message": "User with this email already exists"
            }, status=400)
        
        try:
            height_feet = int(height_feet)
            height_inches = int(height_inches)
            weight = float(weight)
            # Use database transaction to ensure data integrity
            with transaction.atomic():
                # Create user with PostgreSQL
                user = User.objects.create_user(
                    username=email,  # Using email as username
                    email=email,
                    password=password,  # create_user automatically hashes
                    first_name=name.strip()
                )
                
                # Create user profile
                user_profile = UserProfile.objects.create(
                    user=user,
                    height_feet=height_feet,
                    height_inches=height_inches,
                    weight=weight,
                    activity_level=activity_level
                )
                
                #Generate JWT Token
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)
                
                logger.info(f"Created user: {user.id} - {user.email}")
                
                return JsonResponse({
                    "status": "success",
                    "message": "User created successfully",
                    "tokens": {
                        "access": access_token,
                        "refresh": refresh_token
                    },
                    "user": {
                        "id": user.id,
                        "name": user.first_name,
                        "email": user.email,
                        "profile": {
                            "height_feet": user_profile.height_feet,
                            "height_inches": user_profile.height_inches,
                            "weight": float(user_profile.weight),
                            "activity_level": user_profile.activity_level,
                        }
                    }
                })

        except Exception as e:
            logger.error(f"Unexpected error creating user: {str(e)}")
            return JsonResponse({
                "status": "error",
                "message": f"Error creating user: {str(e)}"
            }, status=500)
    else:
        return JsonResponse({
            "status": "error",
            "message": "Only POST methods are allowed"
        }, status=405)
    
@csrf_exempt
def login_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            if not email or not password:
                return JsonResponse({
                    "status": "error",
                    "message": "Email and password are required"
                }, status=400)
            
            # Authenticate user
            user = authenticate(username=email, password=password)

            if user is not None:
                if user.is_active:
                    # Generate JWT tokens
                    refresh = RefreshToken.for_user(user)
                    access_token = str(refresh.access_token)
                    refresh_token = str(refresh)

                    # Get user profile
                    try:
                        profile = user.profile
                        profile_data = {
                            "height_feet": profile.height_feet,
                            "height_inches": profile.height_inches,
                            "weight": float(profile.weight),
                            "activity_level": profile.activity_level,
                        }
                    except UserProfile.DoesNotExist:
                        profile_data = None

                    return JsonResponse({
                        "status": "success",
                        "message": "Login successful",
                        "tokens": {
                            "access": access_token,
                            "refresh": refresh_token
                        },
                        "user": {
                            "id": user.id,
                            "name": user.first_name,
                            "email": user.email,
                            "profile": profile_data
                        }
                    })
                else:
                    return JsonResponse({
                        "status": "error",
                        "message": "Account is disabled"
                    }, status=400)
            else:
                return JsonResponse({
                    "status": "error",
                    "message": "Invalid email or password"
                }, status=400)
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "Invalid JSON format"
            }, status=400)
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return JsonResponse({
                "status": "error",
                "message": "Login failed"
            }, status=500)
    else:
        return JsonResponse({
            "status": "error",
            "message": "Only POST methods are allowed"
        }, status=405)

                    
# For debugging
def list_users(request):
    """List all users for debugging - remove in production"""
    if request.method == 'GET':
        users = User.objects.select_related('profile').all()
        users_data = []
        
        for user in users:
            try:
                users_data.append({
                    "id": user.id,
                    "name": user.first_name,
                    "email": user.email,
                    "profile": {
                        "height_feet": user.profile.height_feet,
                        "height_inches": user.profile.height_inches,
                        "weight": float(user.profile.weight),
                        "activity_level": user.profile.activity_level,
                    } if hasattr(user, 'profile') else None
                })
            except UserProfile.DoesNotExist:
                users_data.append({
                    "id": user.id,
                    "name": user.first_name,
                    "email": user.email,
                    "profile": None
                })
        
        return JsonResponse({
            "status": "success",
            "count": len(users_data),
            "users": users_data
        })
    else:
        return JsonResponse({
            "status": "error",
            "message": "Only GET methods are allowed"
        }, status=405)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_token(request):
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({
                'status': 'error',
                'message': 'Refresh token is required'
            }, status=400)
        
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)

        return Response({
            "status": "success",
            "tokens": {
                "access": access_token,
                "refresh": str(refresh)
            }
        })
    except Exception as e:
        return Response({
            "status": "error",
            "message": "Invalid refresh token"
        }, status=400)

"""
    - Call to Open AI API for the chat bot feature
    - Uses the user's personal data to tailor a response for their height, weight, etc.
    - Fetches the user and the user's message 
"""
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def open_ai_chat(request):
    """Chat with OpenAI for fitness and nutrition advice"""
    try:
        data = json.loads(request.body) if hasattr(request, 'body') else request.data
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return JsonResponse({
                'status': 'error',
                'message': 'Message is required'
            }, status=400)
        
        # Get user context for personalized responses
        user = request.user
        context = ""
        try:
            profile = user.profile
            context = f"""
            User profile:
            - Name: {user.first_name}
            - Height: {profile.height_feet}'{profile.height_inches}"
            - Weight: {profile.weight} lbs
            - Activity Level: {profile.activity_level}
            """
        except UserProfile.DoesNotExist:
            context = f"User name: {user.first_name}"

        # Create system prompt for fitness coach
        system_prompt = f"""You are an expert AI fitness and nutrition coach. Provide helpful, accurate, and personalized advice about:
        - Workout routines and exercise form
        - Nutrition and meal planning
        - Weight management
        - Health and wellness tips
        - Motivation and goal setting

        Keep responses conversational, encouraging, and practical. Always prioritize safety and suggest consulting healthcare professionals when appropriate.

        {context}
        """

        # Updated to use GPT-4 models
        response = client.chat.completions.create(
            model="gpt-4o-mini",  
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=800,  # Increased for more detailed responses
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        return JsonResponse({
            'status': 'success',
            'response': ai_response,
            'model_used': 'gpt-4o-mini',  # Track which model was used
            'usage': {
                'prompt_tokens': response.usage.prompt_tokens,
                'completion_tokens': response.usage.completion_tokens,
                'total_tokens': response.usage.total_tokens
            }
        })
        
    except Exception as e:
        # Handle OpenAI-specific errors with new v1.0+ syntax
        error_message = str(e)
        
        if 'rate_limit_exceeded' in error_message.lower() or '429' in error_message:
            return JsonResponse({
                'status': 'error',
                'message': 'API rate limit exceeded. Please try again later.'
            }, status=429)
        
        elif 'invalid_request_error' in error_message.lower() or '400' in error_message:
            logger.error(f"OpenAI invalid request: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'Invalid request to AI service.'
            }, status=400)
        
        elif 'authentication_error' in error_message.lower() or '401' in error_message:
            logger.error("OpenAI authentication error")
            return JsonResponse({
                'status': 'error',
                'message': 'AI service authentication failed.'
            }, status=500)
        
        else:
            logger.error(f"Chat AI error: {str(e)}")
            return JsonResponse({
                'status': 'error',
                'message': 'Failed to get AI response.'
            }, status=500)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_workout(request):
    if request.method == 'POST':
        try: 
            # Checks if data is a JSON
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.data
            
            name = data.get('name')
            notes = data.get('notes')
            exercise_data = data.get('exercises', [])
            is_draft=data.get('is_draft', False)

            if not name:
                return JsonResponse({
                    "status": "error",
                    "message": "Workout Name is Required"
                }, status=400)

            with transaction.atomic():
                workout = Workout.objects.create(
                    user=request.user,
                    name=name,
                    start_time=timezone.now(),
                    notes=notes,
                    is_active=not is_draft,
                    is_draft=is_draft
                )

                for exercise in exercise_data:
                    exercise_name = exercise.get('name')
                    pinned_note = exercise.get('pinnedNote', '')
                    sets_data = exercise.get('sets', [])

                    if not exercise_name:
                        continue

                    new_exercise = Exercise.objects.create(
                        workout=workout,
                        name=exercise_name,
                        pinned_note=pinned_note,
                        order=exercise.get('order', 0)
                    )
                
                    for set in sets_data:
                        Set.objects.create(
                            exercise=new_exercise,
                            reps = set.get('reps'),
                            weight = set.get('weight'),
                            is_completed=set.get('isCompleted', False),
                            previous_weight=set.get('previousWeight'),
                            previous_reps=set.get('previousReps'),
                            order=set.get('order', 0)
                        )
                # Return success response
                return JsonResponse({
                    "status": "success",
                    "message": "Workout saved successfully",
                    "workout_id": workout.id,
                    "is_draft": is_draft
                })
        except Exception as e:
            logger.error(f"Error creating workout: {str(e)}")
            return JsonResponse({
                "status": "error",
                "message": f"Failed to create workout: {str(e)}"
            }, status=500)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_workout(request, workout_id):
    try:
        workout = Workout.objects.get(id=workout_id, user=request.user)

        if request.content_type == 'application/json':
            data = json.loads(request.body)
        else:
            data = request.data
        
        exercises_data = data.get('exercises', [])

        with transaction.atomic():
            # Clear existing workout data
            workout.exercises.all().delete()

            # Update with new workout data
            for exercise_data in exercises_data:
                exercise = Exercise.objects.create(
                    workout=workout,
                    name=exercise_data.get('name'),
                    pinned_note=exercise_data.get('pinnedNote', ''),
                    order=exercise_data.get('order', 0)
                )

                sets_data = exercise_data.get('sets', [])
                for set_data in sets_data:
                    Set.objects.create(
                        exercise=exercise,
                        reps=set_data.get('reps', 0),
                        weight=set_data.get('weight', 0),
                        is_completed=set_data.get('isCompleted', False),
                        previous_weight=set_data.get('previousWeight'),
                        previous_reps=set_data.get('previousReps'),
                        order=set_data.get('order', 0)
                    )
            
            # Update workout metadata
            workout.notes = data.get('notes', workout.notes)
            workout.save()

        return JsonResponse({
            "status": "success",
            "message": "Progress saved",
            "last_saved": timezone.now().isoformat()
        })
    except Workout.DoesNotExist:
        return JsonResponse({
            "status": "error",
            "message": "Workout not found"
        }, status=404)
    except Exception as e:
        logger.error(f"Error updating workout: {str(e)}")
        return JsonResponse({
            "status": "error",
            "message": "Failed to save progress"
        }, status=500)
    
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_workout(request, workout_id):
    """Mark workout as completed"""
    try:
        print("working")
        workout = Workout.objects.get(id=workout_id, user=request.user)
        
        workout.is_active = False
        workout.is_draft = False
        workout.end_time = timezone.now()
        workout.save()

        return JsonResponse({
            "status": "success",
            "message": "Workout completed",
            "duration": workout.duration
        })

    except Workout.DoesNotExist:
        return JsonResponse({
            "status": "error",
            "message": "Workout not found"
        }, status=404)
    
# Return the last 10 workouts
@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_workouts(request):
    try:
        workouts = Workout.objects.filter(user=request.user).order_by("-start_time")
        
        workouts_data = []
        for workout in workouts:
            # Get exercises for each workout
            exercises_data = []
            exercises = Exercise.objects.filter(workout=workout).order_by('order')
            
            for exercise in exercises:
                # Get sets for each exercise
                sets_data = []
                sets = Set.objects.filter(exercise=exercise).order_by('order')
                
                for set_obj in sets:
                    sets_data.append({
                        'id': set_obj.id,
                        'reps': set_obj.reps,
                        'weight': float(set_obj.weight) if set_obj.weight else 0,
                        'is_completed': set_obj.is_completed,
                        'previous_weight': float(set_obj.previous_weight) if set_obj.previous_weight else None,
                        'previous_reps': set_obj.previous_reps,
                        'order': set_obj.order
                    })
                
                exercises_data.append({
                    'id': exercise.id,
                    'name': exercise.name,
                    'pinned_note': exercise.pinned_note,
                    'order': exercise.order,
                    'sets': sets_data
                })

            workouts_data.append({
                'id': workout.id,
                'name': workout.name,
                'start_time': workout.start_time.isoformat() if workout.start_time else None,
                'end_time': workout.end_time.isoformat() if workout.end_time else None,
                'duration': workout.duration if hasattr(workout, 'duration') else None,
                'notes': workout.notes,
                'is_active': workout.is_active,
                'is_draft': workout.is_draft,
                'exercises': exercises_data
            })
        
        return JsonResponse({
            "status": "success",
            "count": len(workouts_data),
            "workouts": workouts_data
        })
    
    except Exception as e:
        logger.error(f"Error fetching workout data: {str(e)}")
        return JsonResponse({
            "status": "error",
            "message": "Workouts not found"
        }, status=404)
    
@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_food(request):
    if request.method == "POST":
        try:
            # Checks if data is a JSON
            if request.content_type == 'application/json':
                data = json.loads(request.body)
            else:
                data = request.data

            name = data.get('name')
            calories = data.get('calories')
            protein = data.get('protein', 0)
            carbs = data.get('carbs', 0)
            fat = data.get('fat', 0)
            fiber = data.get('fiber', 0)
            tag = data.get('tag', 0)

            if not name:
                return JsonResponse({
                    "status": "error",
                    "message": "Food name is required"
                }, status=400)

            with transaction.atomic():
                new_food = Food.objects.create(
                    user=request.user,
                    name=name,
                    protein=protein, 
                    carbs=carbs, 
                    fat=fat, 
                    fiber=fiber, 
                    calories=calories,
                    tag=tag,
                )

            
            return JsonResponse({
                "status": "Success",
                "food": new_food.id,
                "message": "Food Saved successfully"
            })

        except Exception as e:
            logger.error(f"Error Creating Food: {e}")
            return JsonResponse({
                "status": "Erorr",
                "message": "Error creating food"
            }, status=500)

@csrf_exempt
@permission_classes([IsAuthenticated])
@api_view(['GET'])
def get_foods(request):
    try:
        date = request.GET.get('date')
        foods = Food.objects.filter(user=request.user).order_by("-timestamp")

        # Get an array of foods associated with that user
        return JsonResponse({
            "status": "success",
            "foodArray": foods,
            "message": "Foods retreived successfully",
        })
    except Exception as e:
        logger.error(f"Error Creating Food: {e}")
        return JsonResponse({
            "status": "Erorr",
            "message": "Error fetching food"
        }, status=500)



                


