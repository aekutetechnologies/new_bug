from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'user_type',
            'phone', 'bio', 'avatar', 'skills', 'company_name',
            'location', 'website', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'user_type',
            'first_name', 'last_name', 'company_name'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Company name is required for organizations
        if attrs['user_type'] in ['org_seeker', 'org_provider'] and not attrs.get('company_name'):
            raise serializers.ValidationError({"company_name": "Company name is required for organizations."})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        email = validated_data.get('email')
        # Set username to email since our model uses email as primary auth
        validated_data['username'] = email
        user = User.objects.create_user(password=password, **validated_data)
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs


class AvatarUploadSerializer(serializers.ModelSerializer):
    """Serializer for avatar upload"""
    
    class Meta:
        model = User
        fields = ['avatar']


class SendVerificationCodeSerializer(serializers.Serializer):
    """Serializer for sending verification code"""
    email = serializers.EmailField(required=True)
    verification_type = serializers.ChoiceField(
        choices=['signup', 'forgot_password', 'change_password'],
        required=True
    )


class VerifyCodeSerializer(serializers.Serializer):
    """Serializer for verifying code"""
    email = serializers.EmailField(required=True)
    code = serializers.CharField(max_length=6, required=True)
    verification_type = serializers.ChoiceField(
        choices=['signup', 'forgot_password', 'change_password'],
        required=True
    )


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password"""
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for reset password"""
    email = serializers.EmailField(required=True)
    code = serializers.CharField(max_length=6, required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs

