from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import connection

from .models import User
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    CustomTokenObtainPairSerializer
)
from .permissions import IsAdminUserRole, IsStudentUserRole


@api_view(['GET'])
@permission_classes([AllowAny])
def api_status(request):
    """
    Health check endpoint to verify backend status and PostgreSQL connection.
    """
    db_ok = True
    db_error = ""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        db_ok = False
        db_error = str(e)

    return Response({
        "status": "online",
        "database": "PostgreSQL connected" if db_ok else f"Database error: {db_error}",
        "message": "Online Examination and Assessment Platform API is operational.",
        "version": "1.0.0"
    })


class RegisterView(generics.CreateAPIView):
    """
    Register a new user (Student or Admin).
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "message": f"Account for {user.username} successfully registered as {user.get_role_display()}.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    JWT login endpoint returning tokens and complete user profile with role.
    """
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the currently authenticated user's profile.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUserRole])
def admin_check(request):
    """
    Protected endpoint accessible only to users with the ADMIN role.
    """
    return Response({
        "verified": True,
        "role": request.user.role,
        "username": request.user.username,
        "message": "Authorization confirmed: Admin access granted."
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsStudentUserRole])
def student_check(request):
    """
    Protected endpoint accessible only to users with the STUDENT role.
    """
    return Response({
        "verified": True,
        "role": request.user.role,
        "username": request.user.username,
        "message": "Authorization confirmed: Student access granted."
    })
