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
