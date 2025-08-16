from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

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
        
        return JsonResponse({
            "status": "success",
            "message": "User created successfully",
            "user": {
                "name": name,
                "email": email
            }
        })
    else:
        return JsonResponse({
            "status": "error",
            "message": "Only POST methods are allowed"
        }, status=405)

    
