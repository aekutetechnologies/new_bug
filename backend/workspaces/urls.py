from django.urls import path
from .views import (
    CloudCredentialListCreateView,
    CloudCredentialDetailView,
    test_cloud_credential,
    WorkspaceListCreateView,
    WorkspaceDetailView,
    start_workspace,
    stop_workspace,
    restart_workspace,
    terminate_workspace,
    workspace_connection,
    import_workspace,
    refresh_workspace_status_view,
    retry_workspace_creation,
    workspace_troubleshooting,
    list_workspace_bundles,
    workspace_logs,
    workspace_metrics,
    ProviderWorkspaceListView,
    SeekerWorkspaceListView
)

app_name = 'workspaces'

urlpatterns = [
    # Cloud credentials endpoints
    path('cloud-credentials/', CloudCredentialListCreateView.as_view(), name='cloud_credential_list_create'),
    path('cloud-credentials/<int:pk>/', CloudCredentialDetailView.as_view(), name='cloud_credential_detail'),
    path('cloud-credentials/<int:pk>/test/', test_cloud_credential, name='test_cloud_credential'),
    
    # Workspace endpoints
    path('workspaces/', WorkspaceListCreateView.as_view(), name='workspace_list_create'),
    path('workspaces/import/', import_workspace, name='import_workspace'),
    path('workspaces/<int:pk>/', WorkspaceDetailView.as_view(), name='workspace_detail'),
    path('workspaces/<int:pk>/start/', start_workspace, name='start_workspace'),
    path('workspaces/<int:pk>/stop/', stop_workspace, name='stop_workspace'),
    path('workspaces/<int:pk>/restart/', restart_workspace, name='restart_workspace'),
    path('workspaces/<int:pk>/terminate/', terminate_workspace, name='terminate_workspace'),
    path('workspaces/<int:pk>/connection/', workspace_connection, name='workspace_connection'),
    path('workspaces/<int:pk>/refresh/', refresh_workspace_status_view, name='refresh_workspace_status'),
    path('workspaces/<int:pk>/retry/', retry_workspace_creation, name='retry_workspace_creation'),
    path('workspaces/<int:pk>/troubleshoot/', workspace_troubleshooting, name='workspace_troubleshooting'),
    path('workspaces/<int:pk>/logs/', workspace_logs, name='workspace_logs'),
    path('workspaces/<int:pk>/metrics/', workspace_metrics, name='workspace_metrics'),
    
    # Bundle endpoints
    path('bundles/<int:credential_id>/', list_workspace_bundles, name='list_workspace_bundles'),
    
    # Role-specific endpoints
    path('provider/workspaces/', ProviderWorkspaceListView.as_view(), name='provider_workspaces'),
    path('seeker/workspaces/', SeekerWorkspaceListView.as_view(), name='seeker_workspaces'),
]

