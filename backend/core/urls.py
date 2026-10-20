from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    api_status,
    RegisterView,
    CustomTokenObtainPairView,
    UserProfileView,
    admin_check,
    student_check,
    QuestionViewSet,
    ExamViewSet
)

router = DefaultRouter()
router.register('questions', QuestionViewSet, basename='questions')
router.register('exams', ExamViewSet, basename='exams')

urlpatterns = [
    # Health check
    path('status/', api_status, name='api-status'),

    # Authentication & Profile
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='auth-login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/me/', UserProfileView.as_view(), name='auth-me'),

    # Role validation endpoints
    path('auth/admin-check/', admin_check, name='auth-admin-check'),
    path('auth/student-check/', student_check, name='auth-student-check'),

    # Router endpoints (Question Bank)
    path('', include(router.urls)),
]
