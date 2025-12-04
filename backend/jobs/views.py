from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Job, Application, SavedJob
from .serializers import (
    JobListSerializer,
    JobDetailSerializer,
    JobCreateUpdateSerializer,
    ApplicationSerializer,
    ApplicationCreateSerializer,
    ApplicationStatusUpdateSerializer,
    SavedJobSerializer
)
from .permissions import IsJobProvider, IsJobOwner, IsJobSeeker, IsApplicationOwner


class JobListCreateView(generics.ListCreateAPIView):
    """List all jobs or create a new job (providers only)"""
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location', 'skills_required', 'created_by__company_name', 'created_by__email']
    ordering_fields = ['created_at', 'salary_min', 'application_deadline']
    
    def get_queryset(self):
        queryset = Job.objects.filter(is_active=True).select_related('created_by')
        
        # Filter by job type
        job_type = self.request.query_params.get('job_type')
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        
        # Filter by experience level
        experience_level = self.request.query_params.get('experience_level')
        if experience_level:
            queryset = queryset.filter(experience_level=experience_level)
        
        # Filter by location
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Filter by salary range
        min_salary = self.request.query_params.get('min_salary')
        if min_salary:
            queryset = queryset.filter(salary_min__gte=min_salary)
        
        max_salary = self.request.query_params.get('max_salary')
        if max_salary:
            queryset = queryset.filter(salary_max__lte=max_salary)
        
        # Filter by skills
        skills = self.request.query_params.get('skills')
        if skills:
            skills_list = skills.split(',')
            for skill in skills_list:
                queryset = queryset.filter(skills_required__icontains=skill.strip())
        
        return queryset
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return JobCreateUpdateSerializer
        return JobListSerializer
    
    def perform_create(self, serializer):
        # Only providers can create jobs
        if self.request.user.user_type != 'org_provider':
            return Response(
                {"error": "Only job providers can create jobs."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer.save(created_by=self.request.user)


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a specific job"""
    queryset = Job.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return JobCreateUpdateSerializer
        return JobDetailSerializer
    
    def update(self, request, *args, **kwargs):
        job = self.get_object()
        if job.created_by != request.user:
            return Response(
                {"error": "You don't have permission to edit this job."},
                status=status.HTTP_403_FORBIDDEN
            )
        # Allow partial updates for PUT requests (e.g., when only updating is_active)
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        job = self.get_object()
        if job.created_by != request.user:
            return Response(
                {"error": "You don't have permission to delete this job."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)


class ApplicationCreateView(generics.CreateAPIView):
    """Apply for a job"""
    serializer_class = ApplicationCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        if request.user.user_type == 'org_provider':
            return Response(
                {"error": "Job providers cannot apply for jobs."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)


class UserApplicationListView(generics.ListAPIView):
    """List all applications for the current user"""
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user)


class ApplicationDetailView(generics.RetrieveDestroyAPIView):
    """Get or delete (withdraw) an application"""
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsApplicationOwner]
    
    def get_queryset(self):
        return Application.objects.filter(applicant=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        application = self.get_object()
        if application.status == 'approved':
            return Response(
                {"error": "Cannot withdraw approved application."},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)


class ApplicationStatusUpdateView(generics.UpdateAPIView):
    """Update application status (provider only)"""
    serializer_class = ApplicationStatusUpdateSerializer
    permission_classes = [IsAuthenticated, IsJobProvider]
    queryset = Application.objects.all()
    
    def update(self, request, *args, **kwargs):
        application = self.get_object()
        if application.job.created_by != request.user:
            return Response(
                {"error": "You don't have permission to update this application."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)


class ProviderJobListView(generics.ListAPIView):
    """List all jobs created by the provider"""
    serializer_class = JobListSerializer
    permission_classes = [IsAuthenticated, IsJobProvider]
    
    def get_queryset(self):
        return Job.objects.filter(created_by=self.request.user)


class ProviderApplicantListView(generics.ListAPIView):
    """List all applicants for provider's jobs"""
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated, IsJobProvider]
    
    def get_queryset(self):
        queryset = Application.objects.filter(job__created_by=self.request.user)
        
        # Filter by job
        job_id = self.request.query_params.get('job_id')
        if job_id:
            queryset = queryset.filter(job_id=job_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset


class SavedJobListCreateView(generics.ListCreateAPIView):
    """List or create saved jobs"""
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        job_id = request.data.get('job')
        job = get_object_or_404(Job, id=job_id)
        
        # Check if already saved
        if SavedJob.objects.filter(user=request.user, job=job).exists():
            return Response(
                {"error": "Job already saved."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        saved_job = SavedJob.objects.create(user=request.user, job=job)
        serializer = self.get_serializer(saved_job)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SavedJobDeleteView(generics.DestroyAPIView):
    """Delete a saved job"""
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user)

