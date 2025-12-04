from django.contrib import admin
from .models import Job, Application, SavedJob


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'created_by', 'location', 'job_type', 'is_active', 'created_at']
    list_filter = ['job_type', 'experience_level', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'location', 'created_by__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'job', 'status', 'applied_at']
    list_filter = ['status', 'applied_at']
    search_fields = ['applicant__email', 'job__title']
    readonly_fields = ['applied_at', 'updated_at']


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ['user', 'job', 'saved_at']
    list_filter = ['saved_at']
    search_fields = ['user__email', 'job__title']
    readonly_fields = ['saved_at']

