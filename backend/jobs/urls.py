from django.urls import path
from .views import (
    JobListCreateView,
    JobDetailView,
    ApplicationCreateView,
    UserApplicationListView,
    ApplicationDetailView,
    ApplicationStatusUpdateView,
    ProviderJobListView,
    ProviderApplicantListView,
    SavedJobListCreateView,
    SavedJobDeleteView
)

app_name = 'jobs'

urlpatterns = [
    # Job endpoints
    path('jobs/', JobListCreateView.as_view(), name='job_list_create'),
    path('jobs/<int:pk>/', JobDetailView.as_view(), name='job_detail'),
    
    # Application endpoints
    path('applications/', UserApplicationListView.as_view(), name='application_list'),
    path('applications/create/', ApplicationCreateView.as_view(), name='application_create'),
    path('applications/<int:pk>/', ApplicationDetailView.as_view(), name='application_detail'),
    path('applications/<int:pk>/status/', ApplicationStatusUpdateView.as_view(), name='application_status'),
    
    # Saved jobs endpoints
    path('saved-jobs/', SavedJobListCreateView.as_view(), name='saved_job_list_create'),
    path('saved-jobs/<int:pk>/', SavedJobDeleteView.as_view(), name='saved_job_delete'),
    
    # Provider endpoints
    path('provider/jobs/', ProviderJobListView.as_view(), name='provider_jobs'),
    path('provider/applicants/', ProviderApplicantListView.as_view(), name='provider_applicants'),
]

