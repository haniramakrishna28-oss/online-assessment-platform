from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

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

        # Create user
        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        # If user registered as Admin, give staff permission for dashboard capabilities
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
        # Custom claims embedded in token
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['is_admin'] = user.is_admin_user
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Embed complete user profile in response
        data['user'] = UserSerializer(self.user).data
        return data
