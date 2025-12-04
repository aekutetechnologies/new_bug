from django.contrib import admin
from .models import CloudCredential, Workspace


@admin.register(CloudCredential)
class CloudCredentialAdmin(admin.ModelAdmin):
    list_display = ['credential_name', 'provider_user', 'cloud_provider', 'region', 'is_active', 'created_at']
    list_filter = ['cloud_provider', 'is_active', 'created_at']
    search_fields = ['credential_name', 'provider_user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ['workspace_id', 'application', 'cloud_provider', 'workspace_type', 'state', 'created_at']
    list_filter = ['cloud_provider', 'workspace_type', 'state', 'created_at']
    search_fields = ['workspace_id', 'application__applicant__email', 'application__job__title']
    readonly_fields = ['created_at', 'updated_at']

