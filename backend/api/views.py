from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.db import transaction, IntegrityError
from django.core.exceptions import ValidationError
from .models import UserProfile
import json
import logging

logger = logging.getLogger(__name__)

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
        else:
            # Handle form data
            name = request.POST.get('name')
            height_feet = request.POST.get('height_feet')
            height_inches = request.POST.get('height_inches')
            weight = request.POST.get('weight')
            activity_level = request.POST.get('activity_level')
            email = request.POST.get('email')
            password = request.POST.get('password')

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
        
        if User.objects.filter(username=email).exists():
            return JsonResponse({
                "status": "error",
                "message": "Username already exists"
            }, status=400)

        try:
            # Use database transaction to ensure data integrity
            with transaction.atomic():
                # Create user with PostgreSQL
                user = User.objects.create_user(
                    username=email,  # Using email as username
                    email=email,
                    password=password,  # create_user automatically hashes
                    first_name=name.strip()
                )
                
                logger.info(f"Created user: {user.id} - {user.email}")
                
                # Create user profile
                user_profile = UserProfile.objects.create(
                    user=user,
                    height_feet=height_feet,
                    height_inches=height_inches,
                    weight=weight,
                    activity_level=activity_level
                )
                
                logger.info(f"Created profile for user: {user.id}")
                
                return JsonResponse({
                    "status": "success",
                    "message": "User created successfully",
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
                
        except IntegrityError as e:
            logger.error(f"Database integrity error: {str(e)}")
            return JsonResponse({
                "status": "error", 
                "message": "Database error: User might already exist"
            }, status=500)
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
def get_user_profile(request, user_id):
    if request.method == "GET":
        try:
            user = User.objects.select_related('profile').get(id=user_id)

            return JsonResponse({
                "status": "success",
                "user": {
                    "id": user.id,
                    "name": user.first_name,
                    "email": user.email,
                    "username": user.username,
                    "date_joined": user.date_joined.isoformat(),
                    "profile": {
                        "height_feet": user.profile.height_feet,
                        "height_inches": user.profile.height_inches,
                        "weight": float(user.profile.weight),
                        "activity_level": user.profile.activity_level,
                        "created_at": user.profile.created_at.isoformat(),
                        "updated_at": user.profile.updated_at.isoformat(),
                    }
                }
            })
        except User.DoesNotExist:
                return JsonResponse({
                    "status": "error",
                    "message": "User not found"
                }, status=404)
        except UserProfile.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "User profile not found"
            }, status=404)
        except Exception as e:
            logger.error(f"Error retrieving user profile: {str(e)}")
            return JsonResponse({
                "status": "error",
                "message": "Error retrieving user profile"
            }, status=500)
    else:
        return JsonResponse({
            "status": "error",
            "message": "Only GET methods are allowed"
        }, status=405)

# For debugging
@csrf_exempt
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