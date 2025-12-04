from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
import random


class User(AbstractUser):
    """Custom user model for Cybersecurity Job Portal"""
    
    USER_TYPE_CHOICES = [
        ('individual', 'Individual Job Seeker'),
        ('org_seeker', 'Organization Job Seeker'),
        ('org_provider', 'Organization Job Provider'),
    ]
    
    username = models.CharField(max_length=150, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES)
    phone = models.CharField(max_length=20, blank=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    skills = models.JSONField(default=list, blank=True)  # For job seekers
    company_name = models.CharField(max_length=255, blank=True)  # For organizations
    location = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['user_type']
    
    def __str__(self):
        return f"{self.email} ({self.get_user_type_display()})"
    
    def save(self, *args, **kwargs):
        if not self.username:
            self.username = self.email.split('@')[0] + str(self.pk or '')
        super().save(*args, **kwargs)
    
    class Meta:
        ordering = ['-created_at']


class EmailVerification(models.Model):
    """Model to store email verification codes"""
    
    VERIFICATION_TYPE_CHOICES = [
        ('signup', 'Sign Up'),
        ('forgot_password', 'Forgot Password'),
        ('change_password', 'Change Password'),
    ]
    
    email = models.EmailField()
    code = models.CharField(max_length=6)
    verification_type = models.CharField(max_length=20, choices=VERIFICATION_TYPE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    attempts = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'verification_type', 'is_verified']),
        ]
    
    def __str__(self):
        return f"{self.email} - {self.verification_type} - {self.code}"
    
    def save(self, *args, **kwargs):
        if not self.code:
            self.code = str(random.randint(100000, 999999))
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        return not self.is_verified and not self.is_expired() and self.attempts < 5

