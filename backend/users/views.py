from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from .models import EmailVerification
from .email_service import send_verification_email
from .serializers import (
    UserSerializer,
    UserRegistrationSerializer,
    ChangePasswordSerializer,
    AvatarUploadSerializer,
    SendVerificationCodeSerializer,
    VerifyCodeSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)

User = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view that returns user data along with tokens"""
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Get user from email
            email = request.data.get('email')
            try:
                user = User.objects.get(email=email)
                response.data['user'] = UserSerializer(user).data
            except User.DoesNotExist:
                pass
        
        return response


class UserRegistrationView(generics.CreateAPIView):
    """Register a new user with email verification"""
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Check if email verification code is provided
        verification_code = request.data.get('verification_code')
        email = serializer.validated_data.get('email')
        
        if not verification_code:
            return Response(
                {"verification_code": ["Verification code is required."]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify the code
        try:
            verification = EmailVerification.objects.filter(
                email=email,
                verification_type='signup',
                is_verified=False
            ).order_by('-created_at').first()
            
            if not verification or not verification.is_valid():
                return Response(
                    {"verification_code": ["Invalid or expired verification code."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if verification.code != verification_code:
                verification.attempts += 1
                verification.save()
                return Response(
                    {"verification_code": ["Invalid verification code."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mark verification as used
            verification.is_verified = True
            verification.save()
            
        except Exception as e:
            return Response(
                {"error": "Verification failed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete user profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response(
            {"message": "Account deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )


class ChangePasswordView(generics.UpdateAPIView):
    """Change user password with email verification"""
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        """Handle POST requests for password change"""
        return self.update(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        
        # Check old password
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {"old_password": ["Wrong password."]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if email verification code is provided
        verification_code = request.data.get('verification_code')
        if not verification_code:
            return Response(
                {"verification_code": ["Verification code is required."]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify the code
        try:
            verification = EmailVerification.objects.filter(
                email=user.email,
                verification_type='change_password',
                is_verified=False
            ).order_by('-created_at').first()
            
            if not verification or not verification.is_valid():
                return Response(
                    {"verification_code": ["Invalid or expired verification code."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if verification.code != verification_code:
                verification.attempts += 1
                verification.save()
                return Response(
                    {"verification_code": ["Invalid verification code."]},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Mark verification as used
            verification.is_verified = True
            verification.save()
            
        except Exception as e:
            return Response(
                {"error": "Verification failed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response(
            {"message": "Password updated successfully"},
            status=status.HTTP_200_OK
        )


class AvatarUploadView(generics.UpdateAPIView):
    """Upload or update user avatar"""
    serializer_class = AvatarUploadSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def post(self, request, *args, **kwargs):
        """Handle POST requests for avatar upload"""
        return self.update(request, *args, **kwargs)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            "message": "Avatar updated successfully",
            "avatar": serializer.data['avatar']
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_code(request):
    """Send verification code to email"""
    serializer = SendVerificationCodeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    verification_type = serializer.validated_data['verification_type']
    
    # For signup, check if email already exists
    if verification_type == 'signup':
        if User.objects.filter(email=email).exists():
            return Response(
                {"email": ["User with this email already exists."]},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # For forgot_password and change_password, check if email exists
    if verification_type in ['forgot_password', 'change_password']:
        if not User.objects.filter(email=email).exists():
            return Response(
                {"email": ["User with this email does not exist."]},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Invalidate previous unverified codes for this email and type
    EmailVerification.objects.filter(
        email=email,
        verification_type=verification_type,
        is_verified=False
    ).update(is_verified=True)
    
    # Create new verification code
    verification = EmailVerification.objects.create(
        email=email,
        verification_type=verification_type
    )
    
    # Send email
    send_verification_email(email, verification.code, verification_type)
    
    return Response(
        {"message": "Verification code sent to your email."},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_code(request):
    """Verify the verification code"""
    serializer = VerifyCodeSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    code = serializer.validated_data['code']
    verification_type = serializer.validated_data['verification_type']
    
    try:
        verification = EmailVerification.objects.filter(
            email=email,
            verification_type=verification_type,
            is_verified=False
        ).order_by('-created_at').first()
        
        if not verification or not verification.is_valid():
            return Response(
                {"code": ["Invalid or expired verification code."]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if verification.code != code:
            verification.attempts += 1
            verification.save()
            return Response(
                {"code": ["Invalid verification code."]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as verified
        verification.is_verified = True
        verification.save()
        
        return Response(
            {"message": "Code verified successfully."},
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {"error": "Verification failed."},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Send password reset code"""
    serializer = ForgotPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    
    if not User.objects.filter(email=email).exists():
        # Don't reveal if email exists for security
        return Response(
            {"message": "If the email exists, a verification code has been sent."},
            status=status.HTTP_200_OK
        )
    
    # Invalidate previous unverified codes
    EmailVerification.objects.filter(
        email=email,
        verification_type='forgot_password',
        is_verified=False
    ).update(is_verified=True)
    
    # Create new verification code
    verification = EmailVerification.objects.create(
        email=email,
        verification_type='forgot_password'
    )
    
    # Send email
    send_verification_email(email, verification.code, 'forgot_password')
    
    return Response(
        {"message": "If the email exists, a verification code has been sent."},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset password using verification code"""
    serializer = ResetPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    email = serializer.validated_data['email']
    code = serializer.validated_data['code']
    new_password = serializer.validated_data['new_password']
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"email": ["User with this email does not exist."]},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify the code
    try:
        verification = EmailVerification.objects.filter(
            email=email,
            verification_type='forgot_password',
            is_verified=False
        ).order_by('-created_at').first()
        
        if not verification or not verification.is_valid():
            return Response(
                {"code": ["Invalid or expired verification code."]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if verification.code != code:
            verification.attempts += 1
            verification.save()
            return Response(
                {"code": ["Invalid verification code."]},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark as verified
        verification.is_verified = True
        verification.save()
        
    except Exception as e:
        return Response(
            {"error": "Verification failed."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Reset password
    user.set_password(new_password)
    user.save()
    
    return Response(
        {"message": "Password reset successfully."},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """Handle Google OAuth login"""
    # This endpoint will be used by the frontend to exchange Google token
    # for JWT tokens. Implementation depends on frontend Google OAuth flow.
    # For now, return a placeholder response
    
    # In production, you would:
    # 1. Verify the Google token
    # 2. Get user info from Google
    # 3. Create or get user
    # 4. Return JWT tokens
    
    return Response({
        "message": "Google OAuth endpoint. Implement with google-auth-library."
    }, status=status.HTTP_501_NOT_IMPLEMENTED)

