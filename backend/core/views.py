import random
from django.shortcuts import get_object_or_404
from django.db import connection, transaction
from django.db.models import Q, Count
from django.utils import timezone

from rest_framework import generics, status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, Question, Option, Exam, ExamAttempt, StudentAnswer, ExamResult
from .serializers import (
    UserSerializer, 
    RegisterSerializer, 
    CustomTokenObtainPairSerializer,
    QuestionSerializer,
    OptionSerializer,
    ExamListSerializer,
    ExamDetailSerializer,
    ExamAttemptDetailSerializer,
    ExamResultSerializer
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

    @action(detail=True, methods=['POST'], permission_classes=[IsAuthenticated])
    def start(self, request, pk=None):
        """
        Start or resume an exam attempt for the authenticated student.
        Randomizes question order for new attempts.
        """
        exam = self.get_object()
        user = request.user

        if not exam.is_currently_available():
            return Response(
                {"detail": "This exam is currently not open or available."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check for active in-progress attempt to resume
        in_progress_attempt = ExamAttempt.objects.filter(
            exam=exam, student=user, status=ExamAttempt.STATUS_IN_PROGRESS
        ).first()

        if in_progress_attempt:
            # Check if time expired while away
            if in_progress_attempt.is_time_expired():
                evaluate_attempt(in_progress_attempt, is_expired=True)
                return Response(
                    {"detail": "Time limit for this attempt has expired.", "expired": True},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(ExamAttemptDetailSerializer(in_progress_attempt).data)

        # Check max attempts limit
        completed_attempts = ExamAttempt.objects.filter(exam=exam, student=user).count()
        if completed_attempts >= exam.max_attempts:
            return Response(
                {"detail": f"You have reached the maximum allowed attempts ({exam.max_attempts}) for this exam."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create new attempt with randomized question order
        q_ids = list(exam.questions.values_list('id', flat=True))
        random.shuffle(q_ids)

        new_attempt = ExamAttempt.objects.create(
            student=user,
            exam=exam,
            attempt_number=completed_attempts + 1,
            question_order=q_ids,
            status=ExamAttempt.STATUS_IN_PROGRESS
        )

        return Response(ExamAttemptDetailSerializer(new_attempt).data, status=status.HTTP_201_CREATED)


def evaluate_attempt(attempt, is_expired=False):
    """
    Evaluates an exam attempt server-side, marks answers as correct/wrong,
    calculates score and percentage, and records an ExamResult.
    """
    with transaction.atomic():
        if hasattr(attempt, 'result'):
            return attempt.result

        exam = attempt.exam
        questions = exam.questions.prefetch_related('options').all()
        answers_map = {ans.question_id: ans for ans in attempt.answers.all()}

        total_score = 0.0
        correct_count = 0
        wrong_count = 0
        unanswered_count = 0

        for q in questions:
            ans = answers_map.get(q.id)
            correct_opt = q.options.filter(is_correct=True).first()

            if ans and ans.selected_option_id:
                if correct_opt and ans.selected_option_id == correct_opt.id:
                    ans.is_correct = True
                    ans.marks_obtained = q.marks
                    correct_count += 1
                    total_score += q.marks
                else:
                    ans.is_correct = False
                    ans.marks_obtained = 0.0
                    wrong_count += 1
                ans.save(update_fields=['is_correct', 'marks_obtained'])
            else:
                unanswered_count += 1

        total_marks = exam.total_marks or sum(q.marks for q in questions)
        percentage = round((total_score / total_marks) * 100, 2) if total_marks > 0 else 0.0
        passed = total_score >= exam.passing_marks

        result, _ = ExamResult.objects.get_or_create(
            attempt=attempt,
            defaults={
                'student': attempt.student,
                'exam': exam,
                'total_questions': questions.count(),
                'correct_answers': correct_count,
                'wrong_answers': wrong_count,
                'unanswered': unanswered_count,
                'score': total_score,
                'total_marks': total_marks,
                'percentage': percentage,
                'passed': passed
            }
        )

        attempt.status = ExamAttempt.STATUS_EXPIRED if is_expired else ExamAttempt.STATUS_SUBMITTED
        attempt.end_time = timezone.now()
        attempt.save(update_fields=['status', 'end_time'])

        return result


class ExamAttemptViewSet(viewsets.GenericViewSet):
    """
    Handles active attempt operations: autosave answers, check timer heartbeat, and submit.
    """
    queryset = ExamAttempt.objects.all()
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['POST'])
    def autosave(self, request, pk=None):
        attempt = self.get_object()

        # Authorization check
        if attempt.student != request.user:
            return Response({"detail": "Forbidden: You do not own this attempt."}, status=status.HTTP_403_FORBIDDEN)

        # Status check
        if attempt.status != ExamAttempt.STATUS_IN_PROGRESS:
            return Response({
                "detail": "Attempt is no longer in progress.", 
                "status": attempt.status
            }, status=status.HTTP_400_BAD_REQUEST)

        # Server-enforced time limit check
        if attempt.is_time_expired():
            result = evaluate_attempt(attempt, is_expired=True)
            return Response({
                "expired": True,
                "detail": "Exam time limit has expired. Answers auto-submitted.",
                "result": ExamResultSerializer(result).data
            }, status=status.HTTP_200_OK)

        q_id = request.data.get('question_id')
        opt_id = request.data.get('selected_option_id')

        if not q_id:
            return Response({"detail": "question_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        question = get_object_or_404(Question, id=q_id)
        selected_option = get_object_or_404(Option, id=opt_id) if opt_id else None

        if selected_option and selected_option.question_id != question.id:
            return Response({"detail": "Invalid option for this question."}, status=status.HTTP_400_BAD_REQUEST)

        ans, _ = StudentAnswer.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={'selected_option': selected_option}
        )

        return Response({
            "saved": True,
            "question_id": question.id,
            "selected_option_id": selected_option.id if selected_option else None,
            "saved_at": ans.saved_at,
            "remaining_seconds": attempt.remaining_seconds()
        })

    @action(detail=True, methods=['GET'])
    def status(self, request, pk=None):
        attempt = self.get_object()
        if attempt.student != request.user and not request.user.is_admin_user:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        if attempt.status == ExamAttempt.STATUS_IN_PROGRESS and attempt.is_time_expired():
            evaluate_attempt(attempt, is_expired=True)

        return Response({
            "status": attempt.status,
            "remaining_seconds": attempt.remaining_seconds(),
            "saved_answers": {ans.question_id: ans.selected_option_id for ans in attempt.answers.all()}
        })

    @action(detail=True, methods=['POST'])
    def submit(self, request, pk=None):
        attempt = self.get_object()

        if attempt.student != request.user:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        # Prevent duplicate submissions
        if attempt.status != ExamAttempt.STATUS_IN_PROGRESS:
            if hasattr(attempt, 'result'):
                return Response({
                    "detail": "Exam was already submitted.",
                    "already_submitted": True,
                    "result": ExamResultSerializer(attempt.result).data
                })
            return Response({"detail": "Attempt is not in progress."}, status=status.HTTP_400_BAD_REQUEST)

        is_expired = attempt.is_time_expired()
        result = evaluate_attempt(attempt, is_expired=is_expired)

        return Response({
            "message": "Examination submitted and evaluated successfully.",
            "expired": is_expired,
            "result": ExamResultSerializer(result).data
        }, status=status.HTTP_200_OK)


class ExamResultViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for students to view their own results,
    and admins to view all results across exams.
    """
    queryset = ExamResult.objects.all().select_related('student', 'exam', 'attempt')
    serializer_class = ExamResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = ExamResult.objects.all().select_related('student', 'exam', 'attempt')
        if user.role == User.ROLE_ADMIN or user.is_staff or user.is_superuser:
            exam_id = self.request.query_params.get('exam_id')
            if exam_id:
                qs = qs.filter(exam_id=exam_id)
            return qs.order_by('-submitted_at')
        return qs.filter(student=user).order_by('-submitted_at')

    @action(detail=False, methods=['GET'])
    def my_results(self, request):
        qs = ExamResult.objects.filter(student=request.user).select_related('exam', 'attempt').order_by('-submitted_at')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['GET'], permission_classes=[IsAuthenticated, IsAdminUserRole])
    def all_results(self, request):
        qs = ExamResult.objects.all().select_related('student', 'exam', 'attempt').order_by('-submitted_at')
        exam_id = request.query_params.get('exam_id')
        if exam_id:
            qs = qs.filter(exam_id=exam_id)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


