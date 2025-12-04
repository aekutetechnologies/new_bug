from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import CloudCredential, Workspace
from .serializers import (
    CloudCredentialSerializer,
    CloudCredentialCreateSerializer,
    WorkspaceSerializer,
    WorkspaceCreateSerializer,
    WorkspaceConnectionSerializer,
    WorkspaceImportSerializer,
    WorkspaceUpdateSerializer
)
from .aws_service import AWSWorkSpacesService
from .azure_service import AzureVirtualDesktopService
from .tasks import WorkspaceManager, BundleManager, refresh_workspace_status
from jobs.permissions import IsJobProvider


class CloudCredentialListCreateView(generics.ListCreateAPIView):
    """List or create cloud credentials"""
    permission_classes = [IsAuthenticated, IsJobProvider]
    
    def get_queryset(self):
        return CloudCredential.objects.filter(provider_user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CloudCredentialCreateSerializer
        return CloudCredentialSerializer


class CloudCredentialDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a cloud credential"""
    permission_classes = [IsAuthenticated, IsJobProvider]
    
    def get_queryset(self):
        return CloudCredential.objects.filter(provider_user=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return CloudCredentialCreateSerializer
        return CloudCredentialSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsJobProvider])
def test_cloud_credential(request, pk):
    """Test if cloud credentials are valid"""
    credential = get_object_or_404(CloudCredential, pk=pk, provider_user=request.user)
    
    # Validate required fields before testing
    validation_errors = []
    
    if credential.cloud_provider == 'aws':
        # Check for valid AWS region
        valid_aws_regions = [
            'us-east-1', 'us-west-2', 'eu-west-1', 'eu-central-1', 
            'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1',
            'ca-central-1', 'sa-east-1'
        ]
        if credential.region not in valid_aws_regions:
            validation_errors.append(f"Invalid AWS region '{credential.region}'. Valid regions: {', '.join(valid_aws_regions[:5])}...")
        
        if not credential.directory_id:
            validation_errors.append("Directory ID is required for AWS WorkSpaces")
        
        if not credential.get_access_key() or not credential.get_secret_key():
            validation_errors.append("Access key and secret key are required")
    
    elif credential.cloud_provider == 'azure':
        if not credential.tenant_id:
            validation_errors.append("Tenant ID is required for Azure")
        if not credential.subscription_id:
            validation_errors.append("Subscription ID is required for Azure")
        if not credential.resource_group:
            validation_errors.append("Resource Group is required for Azure")
        if not credential.get_access_key() or not credential.get_secret_key():
            validation_errors.append("Client ID and Client Secret are required")
    
    if validation_errors:
        return Response(
            {
                "error": "Validation failed",
                "details": validation_errors,
                "valid": False
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Attempt to test credentials
    try:
        if credential.cloud_provider == 'aws':
            service = AWSWorkSpacesService(
                access_key=credential.get_access_key(),
                secret_key=credential.get_secret_key(),
                region=credential.region
            )
            is_valid = service.test_credentials(credential.directory_id)
            
            if is_valid:
                return Response({
                    "message": "AWS credentials are valid and directory is accessible",
                    "valid": True,
                    "cloud_provider": "aws",
                    "region": credential.region
                })
            else:
                return Response(
                    {
                        "message": "AWS credentials are invalid or directory is not accessible",
                        "valid": False,
                        "suggestion": "Please verify your AWS access key, secret key, and directory ID"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        elif credential.cloud_provider == 'azure':
            service = AzureVirtualDesktopService(
                client_id=credential.get_access_key(),
                client_secret=credential.get_secret_key(),
                tenant_id=credential.tenant_id,
                subscription_id=credential.subscription_id,
                resource_group=credential.resource_group
            )
            is_valid = service.test_credentials()
            
            if is_valid:
                return Response({
                    "message": "Azure credentials are valid and resource group is accessible",
                    "valid": True,
                    "cloud_provider": "azure",
                    "resource_group": credential.resource_group
                })
            else:
                return Response(
                    {
                        "message": "Azure credentials are invalid or resource group is not accessible",
                        "valid": False,
                        "suggestion": "Please verify your Azure client ID, client secret, tenant ID, subscription ID, and resource group"
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {"error": "Unsupported cloud provider", "valid": False},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    except Exception as e:
        error_message = str(e)
        
        # Provide more helpful error messages
        if "InvalidParameterValue" in error_message or "InvalidParameter" in error_message:
            suggestion = "Check that your directory ID and region are correct"
        elif "UnauthorizedOperation" in error_message or "AccessDenied" in error_message:
            suggestion = "Credentials are valid but lack necessary permissions. Ensure your IAM user/role has WorkSpaces permissions"
        elif "AuthFailure" in error_message or "SignatureDoesNotMatch" in error_message:
            suggestion = "Invalid access key or secret key. Please verify your credentials"
        elif "botocore.exceptions.NoCredentialsError" in error_message:
            suggestion = "Credentials not properly configured"
        else:
            suggestion = "Please check your cloud provider credentials and configuration"
        
        return Response(
            {
                "error": error_message,
                "valid": False,
                "suggestion": suggestion,
                "cloud_provider": credential.cloud_provider
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class WorkspaceListCreateView(generics.ListCreateAPIView):
    """List or create workspaces"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Provider sees their created workspaces
        if user.user_type == 'org_provider':
            return Workspace.objects.filter(created_by=user)
        
        # Seekers see workspaces assigned to them
        return Workspace.objects.filter(application__applicant=user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WorkspaceCreateSerializer
        return WorkspaceSerializer
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def create(self, request, *args, **kwargs):
        # Only providers can create workspaces
        if request.user.user_type != 'org_provider':
            return Response(
                {"error": "Only job providers can create workspaces."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workspace = serializer.save()
        
        # Initiate workspace creation with cloud provider in background
        try:
            WorkspaceManager.create_workspace_async(workspace.id)
        except Exception as e:
            workspace.state = 'ERROR'
            workspace.error_message = str(e)
            workspace.save()
        
        return Response(
            WorkspaceSerializer(workspace).data,
            status=status.HTTP_201_CREATED
        )
    


class WorkspaceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a workspace"""
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.user_type == 'org_provider':
            return Workspace.objects.filter(created_by=user)
        return Workspace.objects.filter(application__applicant=user)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return WorkspaceUpdateSerializer
        return WorkspaceSerializer
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def update(self, request, *args, **kwargs):
        """Update workspace (for assigning/reassigning applications)"""
        # Only providers can update workspaces
        if request.user.user_type != 'org_provider':
            return Response(
                {"error": "Only job providers can update workspaces."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        workspace = self.get_object()
        serializer = self.get_serializer(workspace, data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        workspace = serializer.save()
        
        return Response(
            WorkspaceSerializer(workspace, context={'request': request}).data,
            status=status.HTTP_200_OK
        )
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to delete workspace from cloud before database deletion"""
        instance = self.get_object()
        
        # Delete workspace in cloud provider before deleting from database
        deletion_success = True
        error_message = None
        
        if instance.workspace_id:
            try:
                credential = instance.cloud_credential
                
                # For AWS, termination permanently deletes the workspace
                if credential.cloud_provider == 'aws':
                    service = AWSWorkSpacesService(
                        access_key=credential.get_access_key(),
                        secret_key=credential.get_secret_key(),
                        region=credential.region
                    )
                    
                    # Terminate/Delete the workspace in AWS
                    response = service.terminate_workspace(instance.workspace_id)
                    
                    # Check if termination/deletion failed
                    if response.get('FailedRequests'):
                        failed = response['FailedRequests'][0]
                        deletion_success = False
                        error_message = failed.get('ErrorMessage', 'Deletion failed in AWS')
                    else:
                        # Workspace is being terminated/deleted in AWS
                        deletion_success = True
                        
                elif credential.cloud_provider == 'azure':
                    # TODO: Implement Azure deletion
                    pass
                
            except Exception as e:
                # If deletion fails, log the error but continue with database deletion
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Failed to delete workspace from cloud: {str(e)}")
                deletion_success = False
                error_message = str(e)
                # Still continue with database deletion
        
        # Always proceed with database deletion
        try:
            response = super().destroy(request, *args, **kwargs)
        except Exception as db_error:
            # If database deletion fails, return error
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to delete workspace from database: {str(db_error)}")
            return Response({
                "error": f"Failed to delete workspace: {str(db_error)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Add deletion status to response if cloud deletion failed
        if not deletion_success and error_message:
            # Modify the response to include warning about cloud deletion failure
            if hasattr(response, 'data'):
                response.data['warning'] = f"Cloud deletion failed: {error_message}. Workspace removed from local database only."
            else:
                # If no data attribute, create a proper response
                response = Response({
                    "message": "Workspace deleted from database",
                    "warning": f"Cloud deletion failed: {error_message}. Please delete manually from AWS."
                }, status=200)
        
        return response


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsJobProvider])
def start_workspace(request, pk):
    """Start a stopped workspace"""
    workspace = get_object_or_404(Workspace, pk=pk, created_by=request.user)
    
    if not workspace.cloud_credential:
        return Response(
            {"error": "Workspace has no cloud credential assigned. Please assign a cloud credential to manage this workspace."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if workspace.state not in ['STOPPED', 'AVAILABLE']:
        return Response(
            {"error": "Workspace cannot be started in current state"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        credential = workspace.cloud_credential
        
        if credential.cloud_provider == 'aws':
            service = AWSWorkSpacesService(
                access_key=credential.get_access_key(),
                secret_key=credential.get_secret_key(),
                region=credential.region
            )
            service.start_workspace(workspace.workspace_id)
            workspace.state = 'STARTING'
            workspace.save()
        
        return Response({"message": "Workspace starting", "state": workspace.state})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsJobProvider])
def stop_workspace(request, pk):
    """Stop a running workspace"""
    workspace = get_object_or_404(Workspace, pk=pk, created_by=request.user)
    
    if not workspace.cloud_credential:
        return Response(
            {"error": "Workspace has no cloud credential assigned. Please assign a cloud credential to manage this workspace."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if workspace.state != 'AVAILABLE':
        return Response(
            {"error": "Workspace cannot be stopped in current state"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        credential = workspace.cloud_credential
        
        if credential.cloud_provider == 'aws':
            service = AWSWorkSpacesService(
                access_key=credential.get_access_key(),
                secret_key=credential.get_secret_key(),
                region=credential.region
            )
            service.stop_workspace(workspace.workspace_id)
            workspace.state = 'STOPPING'
            workspace.save()
        
        return Response({"message": "Workspace stopping", "state": workspace.state})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsJobProvider])
def restart_workspace(request, pk):
    """Restart a workspace"""
    workspace = get_object_or_404(Workspace, pk=pk, created_by=request.user)
    
    if not workspace.cloud_credential:
        return Response(
            {"error": "Workspace has no cloud credential assigned. Please assign a cloud credential to manage this workspace."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        credential = workspace.cloud_credential
        
        if credential.cloud_provider == 'aws':
            service = AWSWorkSpacesService(
                access_key=credential.get_access_key(),
                secret_key=credential.get_secret_key(),
                region=credential.region
            )
            service.reboot_workspace(workspace.workspace_id)
            workspace.state = 'REBOOTING'
            workspace.save()
        
        return Response({"message": "Workspace rebooting", "state": workspace.state})
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def workspace_connection(request, pk):
    """Get workspace connection information"""
    user = request.user
    
    if user.user_type == 'org_provider':
        workspace = get_object_or_404(Workspace, pk=pk, created_by=user)
    else:
        workspace = get_object_or_404(Workspace, pk=pk, application__applicant=user)
    
    try:
        # If workspace has no cloud credential, return basic connection info
        if not workspace.cloud_credential:
            serializer = WorkspaceConnectionSerializer(workspace)
            return Response(serializer.data)
        
        credential = workspace.cloud_credential
        
        if credential.cloud_provider == 'aws':
            service = AWSWorkSpacesService(
                access_key=credential.get_access_key(),
                secret_key=credential.get_secret_key(),
                region=credential.region
            )
            connection_info = service.get_connection_info(workspace.workspace_id)
            
            # Update workspace state
            workspace_data = service.get_workspace(workspace.workspace_id)
            if workspace_data:
                workspace.state = workspace_data['State']
                workspace.connection_string = connection_info['connection_string']
                workspace.save()
        
        serializer = WorkspaceConnectionSerializer(workspace)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsJobProvider])
def import_workspace(request):
    """Import a pre-existing workspace"""
    serializer = WorkspaceImportSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    workspace = serializer.save()
    
    return Response(
        WorkspaceSerializer(workspace).data,
        status=status.HTTP_201_CREATED
    )


class ProviderWorkspaceListView(generics.ListAPIView):
    """List all workspaces created by provider"""
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated, IsJobProvider]
    
    def get_queryset(self):
        return Workspace.objects.filter(created_by=self.request.user)


class SeekerWorkspaceListView(generics.ListAPIView):
    """List all workspaces assigned to seeker"""
    serializer_class = WorkspaceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Workspace.objects.filter(application__applicant=self.request.user)
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsJobProvider])
def list_workspace_bundles(request, credential_id):
    """List available workspace bundles for a cloud credential with grouping"""
    try:
        credential = get_object_or_404(CloudCredential, pk=credential_id, provider_user=request.user)
        
        bundles = BundleManager.get_available_bundles(credential.cloud_provider, credential)

        print(bundles)
        
        # Group bundles by type for better frontend organization
        bundles_by_type = {}
        bundle_types = set()
        
        for bundle in bundles:
            bundle_type = bundle.get('bundle_type', 'Standard')
            bundle_types.add(bundle_type)
            
            if bundle_type not in bundles_by_type:
                bundles_by_type[bundle_type] = []
            bundles_by_type[bundle_type].append(bundle)
        
        # Create type summary for frontend
        type_summary = []
        type_order = ['Basic', 'Standard', 'Performance', 'Graphics']  # Preferred order
        
        for bundle_type in type_order:
            if bundle_type in bundles_by_type:
                type_bundles = bundles_by_type[bundle_type]
                type_summary.append({
                    'type': bundle_type,
                    'count': len(type_bundles),
                    'bundles': type_bundles
                })
        
        # Add any other types not in the preferred order
        for bundle_type in sorted(bundle_types):
            if bundle_type not in type_order:
                type_bundles = bundles_by_type[bundle_type]
                type_summary.append({
                    'type': bundle_type,
                    'count': len(type_bundles),
                    'bundles': type_bundles
                })
        
        return Response({
            "success": True,
            "bundles": bundles,
            "bundles_by_type": bundles_by_type,
            "type_summary": type_summary,
            "cloud_provider": credential.cloud_provider,
            "credential_name": credential.credential_name,
            "region": credential.region if hasattr(credential, 'region') else None,
            "total_count": len(bundles),
            "available_types": sorted(list(bundle_types)),
            "metadata": {
                "last_updated": timezone.now().isoformat(),
                "source": f"{credential.cloud_provider.upper()} API"
            }
        })
        
    except Exception as e:
        return Response(
            {
                "success": False,
                "error": f"Failed to retrieve bundles: {str(e)}",
                "bundles": [],
                "bundles_by_type": {},
                "type_summary": []
            },
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refresh_workspace_status_view(request, pk):
    """Manually refresh workspace status"""
    try:
        # Check permissions
        user = request.user
        if user.user_type == 'org_provider':
            workspace = get_object_or_404(Workspace, pk=pk, created_by=user)
        else:
            workspace = get_object_or_404(Workspace, pk=pk, application__applicant=user)
        
        # Refresh status
        result = refresh_workspace_status(workspace.id)
        
        if 'error' in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            "message": "Workspace status refreshed successfully",
            **result
        })
        
    except Exception as e:
        return Response(
            {"error": f"Failed to refresh workspace status: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )


# Workspace lifecycle management endpoints
@api_view(['POST'])
@permission_classes([IsAuthenticated, IsJobProvider])
def terminate_workspace(request, pk):
    """Terminate a workspace permanently and delete from AWS"""
    workspace = get_object_or_404(Workspace, pk=pk, created_by=request.user)
    
    if workspace.state in ['TERMINATED']:
        return Response(
            {"error": f"Workspace is already terminated"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # If no cloud credential, just mark as terminated in database
    if not workspace.cloud_credential:
        workspace.state = 'TERMINATED'
        workspace.save()
        return Response({
            "message": "Workspace marked as terminated (no cloud credential assigned, cannot delete from cloud)",
            "state": workspace.state
        })
    
    try:
        credential = workspace.cloud_credential
        termination_success = False
        error_message = None
        
        if credential.cloud_provider == 'aws':
            service = AWSWorkSpacesService(
                access_key=credential.get_access_key(),
                secret_key=credential.get_secret_key(),
                region=credential.region
            )
            
            # Terminate the workspace in AWS
            response = service.terminate_workspace(workspace.workspace_id)
            
            # Check if termination was successful
            if response.get('FailedRequests'):
                failed = response['FailedRequests'][0]
                termination_success = False
                error_message = failed.get('ErrorMessage', 'Termination failed in AWS')
                return Response({
                    "error": error_message,
                    "state": workspace.state
                }, status=status.HTTP_400_BAD_REQUEST)
            else:
                termination_success = True
                
        elif credential.cloud_provider == 'azure':
            # TODO: Implement Azure termination
            termination_success = True
        
        # Update workspace state if termination was successful
        if termination_success:
            workspace.state = 'TERMINATED'
            workspace.save()
            return Response({
                "message": "Workspace terminated successfully in cloud provider", 
                "state": workspace.state
            })
        else:
            return Response({
                "error": "Failed to terminate workspace",
                "message": error_message
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            "error": f"Failed to terminate workspace: {str(e)}"
        }, status=status.HTTP_400_BAD_REQUEST)


# Helper endpoints for workspace management
@api_view(['GET'])
@permission_classes([IsAuthenticated, IsJobProvider])
def workspace_logs(request, pk):
    """Get workspace creation and management logs"""
    workspace = get_object_or_404(Workspace, pk=pk, created_by=request.user)
    
    # For now, return basic info. In a real implementation, this would
    # fetch logs from CloudWatch, Azure Monitor, or local log files
    logs = [
        {
            "timestamp": workspace.created_at,
            "level": "INFO",
            "message": "Workspace creation initiated"
        },
        {
            "timestamp": workspace.updated_at,
            "level": "INFO",
            "message": f"Current state: {workspace.state}"
        }
    ]
    
    if workspace.error_message:
        logs.append({
            "timestamp": workspace.updated_at,
            "level": "ERROR",
            "message": workspace.error_message
        })
    
    return Response({
        "workspace_id": workspace.id,
        "logs": logs,
        "current_state": workspace.state
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsJobProvider])
def workspace_metrics(request, pk):
    """Get workspace usage metrics"""
    workspace = get_object_or_404(Workspace, pk=pk, created_by=request.user)
    
    # Placeholder metrics - in real implementation would fetch from cloud provider APIs
    metrics = {
        "workspace_id": workspace.workspace_id,
        "state": workspace.state,
        "uptime_hours": 0,
        "cpu_usage_percent": 0,
        "memory_usage_percent": 0,
        "storage_used_gb": 0,
        "last_user_activity": None,
        "connection_count": 0
    }
    
    # Calculate basic uptime if workspace is available
    if workspace.state == 'AVAILABLE' and workspace.created_at:
        from django.utils import timezone
        uptime = timezone.now() - workspace.created_at
        metrics["uptime_hours"] = round(uptime.total_seconds() / 3600, 2)
    
    return Response(metrics)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsJobProvider])
def retry_workspace_creation(request, pk):
    """Retry failed workspace creation"""
    workspace = get_object_or_404(Workspace, pk=pk, created_by=request.user)
    
    if workspace.state != 'ERROR':
        return Response(
            {"error": f"Workspace is not in ERROR state. Current state: {workspace.state}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Reset workspace state and error message
        workspace.state = 'PENDING'
        workspace.error_message = ''
        workspace.workspace_id = ''  # Clear the failed workspace ID
        workspace.save()
        
        # Retry workspace creation
        WorkspaceManager.create_workspace_async(workspace.id)
        
        return Response({
            "message": "Workspace creation retry initiated",
            "state": workspace.state,
            "workspace_id": workspace.id
        })
        
    except Exception as e:
        return Response(
            {"error": f"Failed to retry workspace creation: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsJobProvider])
def workspace_troubleshooting(request, pk):
    """Get troubleshooting information for a workspace"""
    workspace = get_object_or_404(Workspace, pk=pk, created_by=request.user)
    
    troubleshooting_info = {
        "workspace_id": workspace.id,
        "current_state": workspace.state,
        "error_message": workspace.error_message,
        "cloud_provider": workspace.cloud_provider,
        "bundle_id": workspace.bundle_id,
        "username": workspace.username,
        "created_at": workspace.created_at,
        "updated_at": workspace.updated_at,
        "troubleshooting_tips": []
    }
    
    # Add specific troubleshooting tips based on error state
    if workspace.state == 'ERROR':
        error_msg = workspace.error_message.lower()
        
        if 'invalid parameter' in error_msg or 'invalidparameter' in error_msg:
            troubleshooting_info["troubleshooting_tips"].append({
                "issue": "Invalid Parameter",
                "solution": "Check if the bundle ID and directory ID are correct for the selected region"
            })
        
        if 'unauthorized' in error_msg or 'access denied' in error_msg:
            troubleshooting_info["troubleshooting_tips"].append({
                "issue": "Access Denied",
                "solution": "Verify that your cloud credentials have the necessary permissions for WorkSpaces operations"
            })
        
        if 'quota' in error_msg or 'limit' in error_msg:
            troubleshooting_info["troubleshooting_tips"].append({
                "issue": "Quota/Limit Exceeded",
                "solution": "Check your account limits and consider requesting a quota increase"
            })
        
        if 'throttling' in error_msg or 'rate' in error_msg:
            troubleshooting_info["troubleshooting_tips"].append({
                "issue": "Rate Limiting",
                "solution": "Wait a few minutes and retry the operation"
            })
        
        if 'user already exists' in error_msg:
            troubleshooting_info["troubleshooting_tips"].append({
                "issue": "User Already Exists",
                "solution": "The username already exists in the directory. Try with a different username"
            })
    
    elif workspace.state == 'PENDING':
        from django.utils import timezone
        time_since_creation = timezone.now() - workspace.created_at
        
        if time_since_creation.total_seconds() > 1800:  # 30 minutes
            troubleshooting_info["troubleshooting_tips"].append({
                "issue": "Long Pending Time",
                "solution": "Workspace has been pending for more than 30 minutes, consider checking the cloud console directly"
            })
    
    # Add general tips
    troubleshooting_info["troubleshooting_tips"].extend([
        {
            "issue": "General Debugging",
            "solution": "Check the workspace logs and refresh the status to get the latest information"
        },
        {
            "issue": "Cloud Console",
            "solution": f"Check your {workspace.cloud_provider.upper()} console for additional details about the workspace"
        }
    ])
    
    return Response(troubleshooting_info)

