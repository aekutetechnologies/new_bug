from django.db import models
from django.contrib.auth import get_user_model
from jobs.models import Application
import base64
from cryptography.fernet import Fernet
from django.conf import settings

User = get_user_model()


def get_cipher():
    """Get cipher for encryption/decryption"""
    key = settings.CRYPTOGRAPHY_KEY.encode()
    # Ensure key is properly formatted for Fernet
    key = base64.urlsafe_b64encode(key.ljust(32)[:32])
    return Fernet(key)


class CloudCredential(models.Model):
    """Cloud credentials for VDI creation"""
    
    CLOUD_PROVIDER_CHOICES = [
        ('aws', 'AWS WorkSpaces'),
        ('azure', 'Azure Virtual Desktop'),
    ]
    
    provider_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cloud_credentials')
    cloud_provider = models.CharField(max_length=10, choices=CLOUD_PROVIDER_CHOICES)
    credential_name = models.CharField(max_length=255)
    
    # Encrypted credentials
    access_key = models.TextField()  # AWS Access Key or Azure Client ID
    secret_key = models.TextField()  # AWS Secret or Azure Client Secret
    region = models.CharField(max_length=100)  # AWS region or Azure location
    
    # Optional fields
    directory_id = models.CharField(max_length=255, blank=True)  # AWS Directory ID
    tenant_id = models.CharField(max_length=255, blank=True)  # Azure Tenant ID
    subscription_id = models.CharField(max_length=255, blank=True)  # Azure Subscription ID
    resource_group = models.CharField(max_length=255, blank=True)  # Azure Resource Group
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['provider_user', 'credential_name']
    
    def __str__(self):
        return f"{self.credential_name} ({self.cloud_provider}) - {self.provider_user.email}"
    
    def encrypt_field(self, value):
        """Encrypt a field value"""
        if not value:
            return ''
        cipher = get_cipher()
        return cipher.encrypt(value.encode()).decode()
    
    def decrypt_field(self, value):
        """Decrypt a field value"""
        if not value:
            return ''
        cipher = get_cipher()
        return cipher.decrypt(value.encode()).decode()
    
    def set_access_key(self, value):
        self.access_key = self.encrypt_field(value)
    
    def get_access_key(self):
        return self.decrypt_field(self.access_key)
    
    def set_secret_key(self, value):
        self.secret_key = self.encrypt_field(value)
    
    def get_secret_key(self):
        return self.decrypt_field(self.secret_key)


class Workspace(models.Model):
    """VDI/Workspace model"""
    
    STATE_CHOICES = [
        ('PENDING', 'Pending'),
        ('AVAILABLE', 'Available'),
        ('STOPPED', 'Stopped'),
        ('STOPPING', 'Stopping'),
        ('STARTING', 'Starting'),
        ('REBOOTING', 'Rebooting'),
        ('TERMINATED', 'Terminated'),
        ('ERROR', 'Error'),
    ]
    
    OS_TYPE_CHOICES = [
        ('ubuntu', 'Ubuntu Linux'),
        ('windows', 'Windows'),
    ]
    
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='workspace', null=True, blank=True)
    cloud_credential = models.ForeignKey(CloudCredential, on_delete=models.PROTECT, related_name='workspaces', null=True, blank=True)
    
    workspace_id = models.CharField(max_length=255, blank=True)
    cloud_provider = models.CharField(max_length=10, choices=CloudCredential.CLOUD_PROVIDER_CHOICES)
    workspace_type = models.CharField(max_length=20, choices=OS_TYPE_CHOICES)
    bundle_id = models.CharField(max_length=255, blank=True)  # Optional for imported workspaces
    
    state = models.CharField(max_length=20, choices=STATE_CHOICES, default='PENDING')
    connection_string = models.TextField(blank=True)
    username = models.CharField(max_length=255)
    registration_code = models.CharField(max_length=255, blank=True)  # AWS WorkSpaces registration code
    password_encrypted = models.TextField(blank=True)  # Encrypted password for imported workspaces
    error_message = models.TextField(blank=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workspaces_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def set_password(self, value):
        """Encrypt and store password"""
        if not value:
            self.password_encrypted = ''
            return
        cipher = get_cipher()
        self.password_encrypted = cipher.encrypt(value.encode()).decode()
    
    def get_password(self):
        """Decrypt and return password"""
        if not self.password_encrypted:
            return ''
        cipher = get_cipher()
        return cipher.decrypt(self.password_encrypted.encode()).decode()
    
    def __str__(self):
        if self.application:
            return f"{self.workspace_type} workspace for {self.application.applicant.email}"
        return f"{self.workspace_type} workspace {self.workspace_id or '(unassigned)'}"

