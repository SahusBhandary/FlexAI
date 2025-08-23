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