from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db import transaction

from .models import Question, Option, Exam, ExamAttempt, StudentAnswer, ExamResult

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Standard user profile serializer.
    """
    is_admin = serializers.BooleanField(source='is_admin_user', read_only=True)
    is_student = serializers.BooleanField(source='is_student_user', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name', 
            'role', 
            'is_staff', 
            'is_admin', 
            'is_student', 
            'date_joined'
        ]
        read_only_fields = ['id', 'is_staff', 'is_admin', 'is_student', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with role specification and validation.
    """
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default=User.ROLE_STUDENT)

    class Meta:
        model = User
        fields = [
            'username', 
            'email', 
            'first_name', 
            'last_name', 
            'role', 
            'password', 
            'password_confirm'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email is required.")
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Password fields do not match."})
        if len(attrs['password']) < 6:
            raise serializers.ValidationError({"password": "Password must be at least 6 characters long."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        role = validated_data.get('role', User.ROLE_STUDENT)

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        if role == User.ROLE_ADMIN:
            user.is_staff = True
            user.save()

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer that adds user role and profile metadata
    both in the token claims and in the login response payload.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['is_admin'] = user.is_admin_user
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class OptionSerializer(serializers.ModelSerializer):
    """
    Option serializer representing answer choices.
    """
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Option
        fields = ['id', 'option_text', 'is_correct', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    """
    Full Question serializer with nested options, comprehensive validation,
    and support for Multiple Choice (MCQ) and True/False (TF).
    """
    options = OptionSerializer(many=True)
    correct_option_id = serializers.SerializerMethodField(read_only=True)
    correct_option_text = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 
            'subject', 
            'question_type', 
            'difficulty', 
            'marks', 
            'question_text', 
            'options',
            'correct_option_id',
            'correct_option_text',
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'correct_option_id', 'correct_option_text']

    def get_correct_option_id(self, obj):
        correct = obj.options.filter(is_correct=True).first()
        return correct.id if correct else None

    def get_correct_option_text(self, obj):
        correct = obj.options.filter(is_correct=True).first()
        return correct.option_text if correct else None

    def validate_marks(self, value):
        if value < 1:
            raise serializers.ValidationError("Marks must be at least 1.")
        return value

    def validate_subject(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Subject cannot be empty.")
        return value.strip()

    def validate_question_text(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Question text cannot be blank.")
        return value.strip()

    def validate(self, attrs):
        q_type = attrs.get('question_type', getattr(self.instance, 'question_type', Question.TYPE_MCQ))
        options_data = attrs.get('options')

        if options_data is not None:
            if len(options_data) < 2:
                raise serializers.ValidationError({
                    "options": "A question must have at least 2 options."
                })

            # Check that option texts are not empty
            for i, opt in enumerate(options_data):
                text = opt.get('option_text', '').strip()
                if not text:
                    raise serializers.ValidationError({
                        "options": f"Option #{i + 1} text cannot be blank."
                    })

            # Check correct answers count
            correct_count = sum(1 for opt in options_data if opt.get('is_correct', False))
            if correct_count == 0:
                raise serializers.ValidationError({
                    "options": "Exactly one option must be marked as the correct answer."
                })
            if correct_count > 1:
                raise serializers.ValidationError({
                    "options": "Only one option can be marked as the correct answer."
                })

            # True/False specific validation
            if q_type == Question.TYPE_TF:
                if len(options_data) != 2:
                    raise serializers.ValidationError({
                        "options": "True/False questions must have exactly 2 options ('True' and 'False')."
                    })

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        options_data = validated_data.pop('options', [])
        question = Question.objects.create(**validated_data)

        for index, opt_data in enumerate(options_data):
            Option.objects.create(
                question=question,
                option_text=opt_data['option_text'].strip(),
                is_correct=opt_data.get('is_correct', False),
                order=opt_data.get('order', index)
            )

        return question

    @transaction.atomic
    def update(self, instance, validated_data):
        options_data = validated_data.pop('options', None)

        instance.subject = validated_data.get('subject', instance.subject)
        instance.question_type = validated_data.get('question_type', instance.question_type)
        instance.difficulty = validated_data.get('difficulty', instance.difficulty)
        instance.marks = validated_data.get('marks', instance.marks)
        instance.question_text = validated_data.get('question_text', instance.question_text)
        instance.save()

        if options_data is not None:
            # Cleanly replace options
            instance.options.all().delete()
            for index, opt_data in enumerate(options_data):
                Option.objects.create(
                    question=instance,
                    option_text=opt_data['option_text'].strip(),
                    is_correct=opt_data.get('is_correct', False),
                    order=opt_data.get('order', index)
                )

        return instance


class ExamListSerializer(serializers.ModelSerializer):
    """
    Serializer for listing exams with question counts and availability.
    """
    questions_count = serializers.IntegerField(source='questions.count', read_only=True)
    is_available = serializers.SerializerMethodField(read_only=True)
    attempts_used = serializers.SerializerMethodField(read_only=True)
    can_attempt = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Exam
        fields = [
            'id', 
            'title', 
            'description', 
            'subject', 
            'duration_minutes',
            'total_marks', 
            'passing_marks', 
            'questions_count',
            'start_time', 
            'end_time', 
            'max_attempts', 
            'is_published',
            'is_available', 
            'attempts_used', 
            'can_attempt', 
            'created_at'
        ]

    def get_is_available(self, obj):
        return obj.is_currently_available()

    def get_attempts_used(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.attempts.filter(student=request.user).count()
        return 0

    def get_can_attempt(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            attempts_count = obj.attempts.filter(student=request.user).count()
            return obj.is_currently_available() and (attempts_count < obj.max_attempts)
        return False


class ExamDetailSerializer(serializers.ModelSerializer):
    """
    Full Exam serializer supporting question assignment, total calculation,
    and availability window validation.
    """
    questions = QuestionSerializer(many=True, read_only=True)
    question_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Question.objects.all(), write_only=True, required=False, source='questions'
    )
    questions_count = serializers.IntegerField(source='questions.count', read_only=True)
    is_available = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Exam
        fields = [
            'id', 
            'title', 
            'description', 
            'subject', 
            'duration_minutes',
            'total_marks', 
            'passing_marks', 
            'questions', 
            'question_ids',
            'questions_count', 
            'start_time', 
            'end_time', 
            'max_attempts', 
            'is_published', 
            'is_available', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_available', 'questions_count']

    def validate(self, attrs):
        start_time = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end_time = attrs.get('end_time', getattr(self.instance, 'end_time', None))
        if start_time and end_time and end_time <= start_time:
            raise serializers.ValidationError({"end_time": "Exam end time must be after start time."})

        duration = attrs.get('duration_minutes', getattr(self.instance, 'duration_minutes', 30))
        if duration < 1:
            raise serializers.ValidationError({"duration_minutes": "Duration must be at least 1 minute."})

        passing = attrs.get('passing_marks', getattr(self.instance, 'passing_marks', 40))
        total = attrs.get('total_marks', getattr(self.instance, 'total_marks', 100))
        if passing > total:
            raise serializers.ValidationError({"passing_marks": "Passing marks cannot exceed total marks."})

        return attrs

    def create(self, validated_data):
        questions = validated_data.pop('questions', [])
        if questions and ('total_marks' not in validated_data or validated_data['total_marks'] == 0):
            validated_data['total_marks'] = sum(q.marks for q in questions)
        exam = Exam.objects.create(**validated_data)
        if questions:
            exam.questions.set(questions)
        return exam

    def update(self, instance, validated_data):
        questions = validated_data.pop('questions', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if questions is not None:
            instance.questions.set(questions)
            calculated_total = sum(q.marks for q in instance.questions.all())
            if calculated_total > 0:
                instance.total_marks = calculated_total
                instance.save(update_fields=['total_marks'])
        return instance


class StudentOptionSerializer(serializers.ModelSerializer):
    """
    Sanitized Option serializer for students during exam attempts.
    Crucial security: does NOT include is_correct!
    """
    class Meta:
        model = Option
        fields = ['id', 'option_text', 'order']


class StudentQuestionSerializer(serializers.ModelSerializer):
    """
    Sanitized Question serializer for students during exams.
    Crucial security: correct answers are strictly excluded!
    """
    options = StudentOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'subject', 'question_type', 'difficulty', 'marks', 'question_text', 'options']


class ExamAttemptDetailSerializer(serializers.ModelSerializer):
    """
    Serializer providing active attempt details to the student,
    including server-calculated remaining_seconds, questions ordered
    by the attempt's randomized question_order, and restored saved answers.
    """
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    exam_subject = serializers.CharField(source='exam.subject', read_only=True)
    duration_minutes = serializers.IntegerField(source='exam.duration_minutes', read_only=True)
    total_marks = serializers.IntegerField(source='exam.total_marks', read_only=True)
    passing_marks = serializers.IntegerField(source='exam.passing_marks', read_only=True)
    remaining_seconds = serializers.SerializerMethodField(read_only=True)
    questions = serializers.SerializerMethodField(read_only=True)
    saved_answers = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ExamAttempt
        fields = [
            'id', 
            'exam_id', 
            'exam_title', 
            'exam_subject', 
            'duration_minutes',
            'total_marks', 
            'passing_marks', 
            'attempt_number', 
            'status',
            'start_time', 
            'remaining_seconds', 
            'questions', 
            'saved_answers'
        ]

    def get_remaining_seconds(self, obj):
        return obj.remaining_seconds()

    def get_questions(self, obj):
        q_order = obj.question_order or []
        qs_dict = {q.id: q for q in obj.exam.questions.prefetch_related('options').all()}
        ordered_qs = [qs_dict[qid] for qid in q_order if qid in qs_dict]
        if not ordered_qs:
            ordered_qs = list(qs_dict.values())
        return StudentQuestionSerializer(ordered_qs, many=True).data

    def get_saved_answers(self, obj):
        return {
            ans.question_id: ans.selected_option_id
            for ans in obj.answers.all()
        }


class ExamResultSerializer(serializers.ModelSerializer):
    """
    Comprehensive evaluation result serializer for student review and admin reporting.
    """
    student_username = serializers.CharField(source='student.username', read_only=True)
    student_full_name = serializers.SerializerMethodField(read_only=True)
    exam_title = serializers.CharField(source='exam.title', read_only=True)
    exam_subject = serializers.CharField(source='exam.subject', read_only=True)
    duration_minutes = serializers.IntegerField(source='exam.duration_minutes', read_only=True)
    passing_marks = serializers.IntegerField(source='exam.passing_marks', read_only=True)
    attempt_number = serializers.IntegerField(source='attempt.attempt_number', read_only=True)
    answers_review = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = ExamResult
        fields = [
            'id', 
            'attempt_id', 
            'exam_id', 
            'exam_title', 
            'exam_subject',
            'student_id', 
            'student_username', 
            'student_full_name',
            'duration_minutes', 
            'passing_marks', 
            'attempt_number',
            'total_questions', 
            'correct_answers', 
            'wrong_answers', 
            'unanswered',
            'score', 
            'total_marks', 
            'percentage', 
            'passed',
            'submitted_at', 
            'answers_review'
        ]

    def get_student_full_name(self, obj):
        name = f"{obj.student.first_name} {obj.student.last_name}".strip()
        return name if name else obj.student.username

    def get_answers_review(self, obj):
        review = []
        attempt = obj.attempt
        answers_map = {ans.question_id: ans for ans in attempt.answers.select_related('selected_option').all()}

        for q in attempt.exam.questions.prefetch_related('options').all():
            ans = answers_map.get(q.id)
            correct_opt = q.options.filter(is_correct=True).first()
            selected_opt = ans.selected_option if ans else None

            review.append({
                "question_id": q.id,
                "question_text": q.question_text,
                "marks": q.marks,
                "marks_obtained": ans.marks_obtained if ans else 0,
                "is_correct": ans.is_correct if ans else False,
                "selected_option_id": selected_opt.id if selected_opt else None,
                "selected_option_text": selected_opt.option_text if selected_opt else None,
                "correct_option_id": correct_opt.id if correct_opt else None,
                "correct_option_text": correct_opt.option_text if correct_opt else None,
                "options": [
                    {
                        "id": opt.id,
                        "option_text": opt.option_text,
                        "is_correct": opt.is_correct,
                        "is_selected": selected_opt and selected_opt.id == opt.id
                    }
                    for opt in q.options.all()
                ]
            })
        return review

