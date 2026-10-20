from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    """
    Custom User model with role-based access control.
    Supports ADMIN and STUDENT roles.
    """
    ROLE_ADMIN = 'ADMIN'
    ROLE_STUDENT = 'STUDENT'
    ROLE_CHOICES = [
        (ROLE_ADMIN, 'Admin'),
        (ROLE_STUDENT, 'Student'),
    ]

    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        default=ROLE_STUDENT,
        help_text="Role determining access permissions: Admin or Student"
    )

    @property
    def is_admin_user(self):
        return self.role == self.ROLE_ADMIN or self.is_superuser or self.is_staff

    @property
    def is_student_user(self):
        return self.role == self.ROLE_STUDENT

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Question(models.Model):
    """
    Question Bank Model supporting MCQ and True/False types.
    """
    TYPE_MCQ = 'MCQ'
    TYPE_TF = 'TF'
    QUESTION_TYPES = [
        (TYPE_MCQ, 'Multiple Choice'),
        (TYPE_TF, 'True/False'),
    ]

    DIFF_EASY = 'EASY'
    DIFF_MEDIUM = 'MEDIUM'
    DIFF_HARD = 'HARD'
    DIFFICULTY_LEVELS = [
        (DIFF_EASY, 'Easy'),
        (DIFF_MEDIUM, 'Medium'),
        (DIFF_HARD, 'Hard'),
    ]

    subject = models.CharField(max_length=100, db_index=True)
    question_type = models.CharField(max_length=10, choices=QUESTION_TYPES, default=TYPE_MCQ)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_LEVELS, default=DIFF_MEDIUM, db_index=True)
    marks = models.PositiveIntegerField(default=1)
    question_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return f"[{self.subject}][{self.difficulty}] {self.question_text[:50]}"


class Option(models.Model):
    """
    Options for questions. Holds text and indicates if it is correct.
    """
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return f"Option for Q{self.question_id}: {self.option_text[:30]} ({'Correct' if self.is_correct else 'Wrong'})"


class Exam(models.Model):
    """
    Exam configuration model managed by Admin.
    """
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    subject = models.CharField(max_length=100, db_index=True)
    duration_minutes = models.PositiveIntegerField(default=30, help_text="Total exam duration in minutes")
    total_marks = models.PositiveIntegerField(default=100)
    passing_marks = models.PositiveIntegerField(default=40)
    questions = models.ManyToManyField(Question, related_name='exams', blank=True)
    
    # Exam availability window
    start_time = models.DateTimeField(null=True, blank=True, help_text="Exam becomes available at this time")
    end_time = models.DateTimeField(null=True, blank=True, help_text="Exam closes after this time")
    
    max_attempts = models.PositiveIntegerField(default=1, help_text="Max attempts permitted per student")
    is_published = models.BooleanField(default=False, help_text="Only published exams are visible to students")
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_exams')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def is_currently_available(self):
        """Check if exam is within the scheduled availability window and published"""
        if not self.is_published:
            return False
        now = timezone.now()
        if self.start_time and now < self.start_time:
            return False
        if self.end_time and now > self.end_time:
            return False
        return True

    def __str__(self):
        return f"{self.title} ({self.subject}) - {'Published' if self.is_published else 'Draft'}"


class ExamAttempt(models.Model):
    """
    Records an individual student's attempt at an exam.
    """
    STATUS_IN_PROGRESS = 'IN_PROGRESS'
    STATUS_SUBMITTED = 'SUBMITTED'
    STATUS_EXPIRED = 'EXPIRED'
    STATUS_CHOICES = [
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_SUBMITTED, 'Submitted'),
        (STATUS_EXPIRED, 'Expired'),
    ]

    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='attempts')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='attempts')
    attempt_number = models.PositiveIntegerField(default=1)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_IN_PROGRESS)
    
    # Stores randomized question IDs for this attempt to ensure question order consistency across refreshes
    question_order = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_time']
        unique_together = ('student', 'exam', 'attempt_number')

    def is_time_expired(self):
        """Verify if time limit has elapsed based on server start_time and exam duration"""
        if self.status != self.STATUS_IN_PROGRESS:
            return True
        allowed_duration = timezone.timedelta(minutes=self.exam.duration_minutes)
        # 30-second grace buffer for network transit
        grace_period = timezone.timedelta(seconds=30)
        return timezone.now() > (self.start_time + allowed_duration + grace_period)

    def remaining_seconds(self):
        """Calculate remaining time in seconds from server perspective"""
        allowed_duration = timezone.timedelta(minutes=self.exam.duration_minutes)
        elapsed = timezone.now() - self.start_time
        remaining = int((allowed_duration - elapsed).total_seconds())
        return max(0, remaining)

    def __str__(self):
        return f"Attempt #{self.attempt_number} by {self.student.username} for {self.exam.title} ({self.status})"


class StudentAnswer(models.Model):
    """
    Records student answers during an attempt with autosave support.
    """
    attempt = models.ForeignKey(ExamAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_option = models.ForeignKey(Option, on_delete=models.SET_NULL, null=True, blank=True)
    is_correct = models.BooleanField(null=True, blank=True)
    marks_obtained = models.FloatField(default=0.0)
    saved_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('attempt', 'question')

    def __str__(self):
        return f"Answer for Q{self.question_id} in Attempt {self.attempt_id} (Option: {self.selected_option_id})"


class ExamResult(models.Model):
    """
    Stores evaluated outcome and metrics for an attempt.
    """
    attempt = models.OneToOneField(ExamAttempt, on_delete=models.CASCADE, related_name='result')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='results')
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='results')
    
    total_questions = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    wrong_answers = models.PositiveIntegerField(default=0)
    unanswered = models.PositiveIntegerField(default=0)
    
    score = models.FloatField(default=0.0)
    total_marks = models.FloatField(default=0.0)
    percentage = models.FloatField(default=0.0)
    passed = models.BooleanField(default=False)
    
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        status_text = "PASSED" if self.passed else "FAILED"
        return f"Result: {self.student.username} - {self.exam.title}: {self.score}/{self.total_marks} ({self.percentage:.1f}%) - {status_text}"
