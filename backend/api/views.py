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

        # Make OpenAI API call using new syntax
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content.strip()
        
        return JsonResponse({
            'status': 'success',
            'response': ai_response,
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