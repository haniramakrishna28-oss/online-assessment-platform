from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.db import connection
from django.db.models import Q, Count
from django.utils import timezone

from .models import User, Question, Option, Exam, ExamAttempt, StudentAnswer, ExamResult
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    CustomTokenObtainPairSerializer,
    QuestionSerializer,
    OptionSerializer,
    ExamListSerializer,
    ExamDetailSerializer
)
from .permissions import IsAdminUserRole, IsStudentUserRole, IsAdminOrReadOnly


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


class ExamViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Exam management (Admin CRUD, publish/unpublish)
    and student availability queries.
    """
    queryset = Exam.objects.all().prefetch_related('questions')
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['list', 'available']:
            return ExamListSerializer
        return ExamDetailSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Exam.objects.all().prefetch_related('questions')

        # If user is student, only return published exams
        if user.is_authenticated and not (user.role == User.ROLE_ADMIN or user.is_staff or user.is_superuser):
            qs = qs.filter(is_published=True)

        # Filters for admin
        status_filter = self.request.query_params.get('status')
        if status_filter:
            if status_filter.lower() == 'published':
                qs = qs.filter(is_published=True)
            elif status_filter.lower() == 'draft':
                qs = qs.filter(is_published=False)

        subject = self.request.query_params.get('subject')
        if subject and subject.strip() and subject.lower() != 'all':
            qs = qs.filter(subject__iexact=subject.strip())

        search = self.request.query_params.get('search') or self.request.query_params.get('q')
        if search and search.strip():
            term = search.strip()
            qs = qs.filter(Q(title__icontains=term) | Q(subject__icontains=term))

        return qs.order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated, IsAdminUserRole])
    def publish(self, request, pk=None):
        """Publish the exam, making it visible to students"""
        exam = self.get_object()
        exam.is_published = True
        exam.save(update_fields=['is_published'])
        return Response({"message": f"Exam '{exam.title}' published successfully.", "is_published": True})

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated, IsAdminUserRole])
    def unpublish(self, request, pk=None):
        """Unpublish the exam (convert back to draft)"""
        exam = self.get_object()
        exam.is_published = False
        exam.save(update_fields=['is_published'])
        return Response({"message": f"Exam '{exam.title}' converted to draft.", "is_published": False})

    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated])
    def available(self, request):
        """
        List all currently available published exams for students.
        """
        user = request.user
        now = timezone.now()
        qs = Exam.objects.filter(is_published=True)

        # Window filter: start_time <= now or null, end_time >= now or null
        available_exams = [e for e in qs if e.is_currently_available()]

        serializer = ExamListSerializer(available_exams, many=True, context={'request': request})
        return Response(serializer.data)

