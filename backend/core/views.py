from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import connection
from django.db.models import Q, Count

from .models import User, Question, Option, Exam, ExamAttempt, StudentAnswer, ExamResult
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    CustomTokenObtainPairSerializer,
    QuestionSerializer,
    OptionSerializer
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


class QuestionViewSet(viewsets.ModelViewSet):
    """
    CRUD ViewSet for Question Bank management (Admin only).
    Includes filtering by subject, difficulty, type, and keyword search.
    """
    queryset = Question.objects.all().prefetch_related('options')
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated, IsAdminUserRole]

    def get_queryset(self):
        qs = Question.objects.all().prefetch_related('options')
        
        # Filter by subject
        subject = self.request.query_params.get('subject')
        if subject and subject.strip() and subject.lower() != 'all':
            qs = qs.filter(subject__iexact=subject.strip())

        # Filter by difficulty
        difficulty = self.request.query_params.get('difficulty')
        if difficulty and difficulty.strip() and difficulty.upper() != 'ALL':
            qs = qs.filter(difficulty=difficulty.strip().upper())

        # Filter by question type
        question_type = self.request.query_params.get('question_type')
        if question_type and question_type.strip() and question_type.upper() != 'ALL':
            qs = qs.filter(question_type=question_type.strip().upper())

        # Search by keyword in question_text or subject
        search = self.request.query_params.get('search') or self.request.query_params.get('q')
        if search and search.strip():
            term = search.strip()
            qs = qs.filter(
                Q(question_text__icontains=term) | 
                Q(subject__icontains=term)
            )

        return qs.order_by('-id')

    @action(detail=False, methods=['GET'])
    def subjects(self, request):
        """
        Returns list of all distinct subjects present in the question bank.
        """
        subjects = list(
            Question.objects.values_list('subject', flat=True)
            .distinct()
            .order_by('subject')
        )
        return Response({"subjects": subjects})

    @action(detail=False, methods=['GET'])
    def stats(self, request):
        """
        Returns statistical summary of the Question Bank.
        """
        total = Question.objects.count()
        by_difficulty = dict(Question.objects.values('difficulty').annotate(c=Count('id')).values_list('difficulty', 'c'))
        by_type = dict(Question.objects.values('question_type').annotate(c=Count('id')).values_list('question_type', 'c'))
        by_subject = dict(Question.objects.values('subject').annotate(c=Count('id')).values_list('subject', 'c'))

        return Response({
            "total_questions": total,
            "easy": by_difficulty.get('EASY', 0),
            "medium": by_difficulty.get('MEDIUM', 0),
            "hard": by_difficulty.get('HARD', 0),
            "mcq": by_type.get('MCQ', 0),
            "tf": by_type.get('TF', 0),
            "subjects_count": len(by_subject),
            "by_subject": by_subject
        })
