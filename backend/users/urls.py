from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    UserRegistrationView,
    UserProfileView,
    ChangePasswordView,
    AvatarUploadView,
    google_login,
    send_verification_code,
    verify_code,
    forgot_password,
    reset_password,
)

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('google/', google_login, name='google_login'),
    
    # Email verification
    path('send-verification-code/', send_verification_code, name='send_verification_code'),
    path('verify-code/', verify_code, name='verify_code'),
    
    # Password reset
    path('forgot-password/', forgot_password, name='forgot_password'),
    path('reset-password/', reset_password, name='reset_password'),
    
    # User profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('upload-avatar/', AvatarUploadView.as_view(), name='upload_avatar'),
]

