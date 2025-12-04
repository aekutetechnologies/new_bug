from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Job, Application, SavedJob

User = get_user_model()

# Import Workspace model for ApplicationWorkspaceSerializer
try:
    from workspaces.models import Workspace
except ImportError:
    Workspace = None


class JobCreatorSerializer(serializers.ModelSerializer):
    """Serializer for job creator info"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'company_name', 'location', 'website']


class JobListSerializer(serializers.ModelSerializer):
    """Serializer for job list"""
    created_by = JobCreatorSerializer(read_only=True)
    applicant_count = serializers.ReadOnlyField()
    is_saved = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'location', 'job_type',
            'experience_level', 'salary_min', 'salary_max', 'skills_required',
            'application_deadline', 'created_by', 'is_active', 'created_at',
            'applicant_count', 'is_saved', 'has_applied'
        ]
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(user=request.user, job=obj).exists()
        return False
    
    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Application.objects.filter(applicant=request.user, job=obj).exists()
        return False


class JobDetailSerializer(serializers.ModelSerializer):
    """Serializer for job details"""
    created_by = JobCreatorSerializer(read_only=True)
    applicant_count = serializers.ReadOnlyField()
    is_saved = serializers.SerializerMethodField()
    has_applied = serializers.SerializerMethodField()
    
    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'requirements', 'responsibilities',
            'location', 'job_type', 'experience_level', 'salary_min', 'salary_max',
            'skills_required', 'application_deadline', 'created_by', 'is_active',
            'created_at', 'updated_at', 'applicant_count', 'is_saved', 'has_applied'
        ]
    
    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedJob.objects.filter(user=request.user, job=obj).exists()
        return False
    
    def get_has_applied(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Application.objects.filter(applicant=request.user, job=obj).exists()
        return False


class JobCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for job creation and update"""
    
    class Meta:
        model = Job
        fields = [
            'title', 'description', 'requirements', 'responsibilities',
            'location', 'job_type', 'experience_level', 'salary_min', 'salary_max',
            'skills_required', 'application_deadline', 'is_active'
        ]


class ApplicantSerializer(serializers.ModelSerializer):
    """Serializer for applicant info"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'phone', 'bio', 'skills', 'avatar', 'location']


class ApplicationWorkspaceSerializer(serializers.ModelSerializer):
    """Minimal workspace serializer for application"""
    
    class Meta:
        model = Workspace
        fields = ['id', 'workspace_type', 'state', 'cloud_provider', 'username']
        read_only_fields = fields


class ApplicationSerializer(serializers.ModelSerializer):
    """Serializer for application list"""
    job = JobListSerializer(read_only=True)
    applicant = ApplicantSerializer(read_only=True)
    workspace = ApplicationWorkspaceSerializer(read_only=True)
    
    class Meta:
        model = Application
        fields = [
            'id', 'job', 'applicant', 'cover_letter', 'resume',
            'status', 'notes', 'applied_at', 'updated_at', 'workspace'
        ]
        read_only_fields = ['status', 'notes']


class ApplicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating an application"""
    
    class Meta:
        model = Application
        fields = ['job', 'cover_letter', 'resume']
    
    def validate(self, attrs):
        job = attrs['job']
        user = self.context['request'].user
        
        # Check if user is a provider
        if user.user_type == 'org_provider':
            raise serializers.ValidationError("Job providers cannot apply for jobs.")
        
        # Check if already applied
        if Application.objects.filter(job=job, applicant=user).exists():
            raise serializers.ValidationError("You have already applied for this job.")
        
        # Check if job is active
        if not job.is_active:
            raise serializers.ValidationError("This job is no longer active.")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['applicant'] = self.context['request'].user
        return super().create(validated_data)


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating application status"""
    
    class Meta:
        model = Application
        fields = ['status', 'notes']


class SavedJobSerializer(serializers.ModelSerializer):
    """Serializer for saved jobs"""
    job = JobListSerializer(read_only=True)
    
    class Meta:
        model = SavedJob
        fields = ['id', 'job', 'saved_at']
        read_only_fields = ['saved_at']

