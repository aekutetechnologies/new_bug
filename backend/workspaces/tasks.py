"""
Workspace background tasks and monitoring
"""

import threading
import time
import logging
from typing import Optional
from django.utils import timezone
from .models import Workspace, CloudCredential
from .aws_service import AWSWorkSpacesService
from .azure_service import AzureVirtualDesktopService

logger = logging.getLogger(__name__)


class WorkspaceManager:
    """Manages workspace creation and monitoring operations"""
    
    @staticmethod
    def create_workspace_async(workspace_id: int) -> None:
        """
        Create workspace asynchronously in a background thread
        
        Args:
            workspace_id: ID of the workspace to create
        """
        thread = threading.Thread(
            target=WorkspaceManager._create_workspace_background,
            args=(workspace_id,),
            daemon=True
        )
        thread.start()
    
    @staticmethod
    def _create_workspace_background(workspace_id: int) -> None:
        """Background task to create workspace with cloud provider"""
        try:
            workspace = Workspace.objects.get(id=workspace_id)
            logger.info(f"Starting background workspace creation for {workspace_id}")
            
            # Update state to indicate processing has started
            workspace.state = 'PENDING'
            workspace.save()
            
            credential = workspace.cloud_credential
            
            if credential.cloud_provider == 'aws':
                WorkspaceManager._create_aws_workspace(workspace)
            elif credential.cloud_provider == 'azure':
                WorkspaceManager._create_azure_workspace(workspace)
            else:
                workspace.state = 'ERROR'
                workspace.error_message = f"Unsupported cloud provider: {credential.cloud_provider}"
                workspace.save()
                
        except Workspace.DoesNotExist:
            logger.error(f"Workspace {workspace_id} not found")
        except Exception as e:
            logger.error(f"Error creating workspace {workspace_id}: {str(e)}")
            try:
                workspace = Workspace.objects.get(id=workspace_id)
                workspace.state = 'ERROR'
                workspace.error_message = str(e)
                workspace.save()
            except:
                pass
    
    @staticmethod
    def _create_aws_workspace(workspace: Workspace, retry_count: int = 0) -> None:
        """Create AWS workspace with retry mechanism"""
        credential = workspace.cloud_credential
        max_retries = 3
        
        try:
            service = AWSWorkSpacesService(
                access_key=credential.get_access_key(),
                secret_key=credential.get_secret_key(),
                region=credential.region
            )
            
            # Create the workspace
            response = service.create_workspace(
                directory_id=credential.directory_id,
                username=workspace.username,
                bundle_id=workspace.bundle_id,
                tags=[
                    {'Key': 'JobTitle', 'Value': workspace.application.job.title},
                    {'Key': 'Applicant', 'Value': workspace.application.applicant.email},
                    {'Key': 'WorkspaceType', 'Value': workspace.workspace_type},
                    {'Key': 'ManagedBy', 'Value': 'JobPortal'},
                    {'Key': 'RetryCount', 'Value': str(retry_count)}
                ]
            )
            
            if response.get('FailedRequests'):
                error_msg = response['FailedRequests'][0]['ErrorMessage']
                error_code = response['FailedRequests'][0].get('ErrorCode', '')
                
                # Check if error is retryable
                retryable_errors = [
                    'ThrottlingException',
                    'ServiceUnavailableException',
                    'InternalServerError',
                    'RequestLimitExceeded'
                ]
                
                is_retryable = any(retryable in error_code for retryable in retryable_errors)
                
                if is_retryable and retry_count < max_retries:
                    logger.warning(f"Retryable error creating AWS workspace (attempt {retry_count + 1}/{max_retries}): {error_msg}")
                    # Exponential backoff: 2^retry_count * 30 seconds
                    delay = (2 ** retry_count) * 30
                    time.sleep(delay)
                    WorkspaceManager._create_aws_workspace(workspace, retry_count + 1)
                    return
                else:
                    workspace.state = 'ERROR'
                    workspace.error_message = f"Failed after {retry_count + 1} attempts: {error_msg}"
                    workspace.save()
                    logger.error(f"AWS workspace creation failed permanently: {error_msg}")
                    
            elif response.get('PendingRequests'):
                aws_workspace_id = response['PendingRequests'][0]['WorkspaceId']
                workspace.workspace_id = aws_workspace_id
                workspace.state = 'PENDING'
                workspace.save()
                logger.info(f"AWS workspace creation initiated: {aws_workspace_id}")
                
                # Start monitoring the workspace
                WorkspaceManager.monitor_workspace_creation(workspace.id)
            else:
                workspace.state = 'ERROR'
                workspace.error_message = "No response from AWS WorkSpaces API"
                workspace.save()
                
        except Exception as e:
            error_msg = str(e)
            
            # Check if this is a retryable exception
            retryable_exceptions = [
                'ConnectionError',
                'TimeoutError',
                'SSLError',
                'ReadTimeoutError'
            ]
            
            is_retryable = any(retryable in error_msg for retryable in retryable_exceptions)
            
            if is_retryable and retry_count < max_retries:
                logger.warning(f"Retryable exception creating AWS workspace (attempt {retry_count + 1}/{max_retries}): {error_msg}")
                delay = (2 ** retry_count) * 30
                time.sleep(delay)
                WorkspaceManager._create_aws_workspace(workspace, retry_count + 1)
                return
            else:
                workspace.state = 'ERROR'
                workspace.error_message = f"Failed after {retry_count + 1} attempts: {error_msg}"
                workspace.save()
                logger.error(f"Exception creating AWS workspace: {error_msg}")
    
    @staticmethod
    def _create_azure_workspace(workspace: Workspace, retry_count: int = 0) -> None:
        """Create Azure workspace with retry mechanism"""
        credential = workspace.cloud_credential
        max_retries = 3
        
        try:
            service = AzureVirtualDesktopService(
                client_id=credential.get_access_key(),
                client_secret=credential.get_secret_key(),
                tenant_id=credential.tenant_id,
                subscription_id=credential.subscription_id,
                resource_group=credential.resource_group
            )
            
            # Use bundle_id as host_pool_name for Azure
            # In a real implementation, you'd have a mapping or configuration
            host_pool_name = workspace.bundle_id if workspace.bundle_id.startswith('hp-') else 'default-host-pool'
            vm_name = f"vm-{workspace.username}-{workspace.workspace_type}"
            
            # Create session host
            response = service.create_session_host(
                host_pool_name=host_pool_name,
                vm_name=vm_name,
                vm_size=WorkspaceManager._get_azure_vm_size(workspace.bundle_id),
                username=workspace.username
            )
            
            if response.get('status') == 'pending':
                workspace.workspace_id = response['session_host_name']
                workspace.state = 'PENDING'
                workspace.save()
                logger.info(f"Azure workspace creation initiated: {workspace.workspace_id}")
                
                # Start monitoring the workspace
                WorkspaceManager.monitor_workspace_creation(workspace.id)
            else:
                workspace.state = 'ERROR'
                workspace.error_message = f"Unexpected response from Azure: {response}"
                workspace.save()
                
        except Exception as e:
            error_msg = str(e)
            
            # Check if this is a retryable exception
            retryable_exceptions = [
                'ConnectionError',
                'TimeoutError',
                'ServiceUnavailable',
                'InternalError'
            ]
            
            is_retryable = any(retryable in error_msg for retryable in retryable_exceptions)
            
            if is_retryable and retry_count < max_retries:
                logger.warning(f"Retryable exception creating Azure workspace (attempt {retry_count + 1}/{max_retries}): {error_msg}")
                delay = (2 ** retry_count) * 30
                time.sleep(delay)
                WorkspaceManager._create_azure_workspace(workspace, retry_count + 1)
                return
            else:
                workspace.state = 'ERROR'
                workspace.error_message = f"Failed after {retry_count + 1} attempts: {error_msg}"
                workspace.save()
                logger.error(f"Exception creating Azure workspace: {error_msg}")
    
    @staticmethod
    def _get_azure_vm_size(bundle_id: str) -> str:
        """Map bundle ID to Azure VM size"""
        size_mapping = {
            'azure-standard-d2s-v3': 'Standard_D2s_v3',
            'azure-standard-d4s-v3': 'Standard_D4s_v3',
            'azure-standard-d8s-v3': 'Standard_D8s_v3',
            'azure-standard-b2s': 'Standard_B2s',
            'azure-standard-b4ms': 'Standard_B4ms'
        }
        return size_mapping.get(bundle_id, 'Standard_D2s_v3')
    
    @staticmethod
    def monitor_workspace_creation(workspace_id: int) -> None:
        """
        Monitor workspace creation progress in background
        
        Args:
            workspace_id: ID of workspace to monitor
        """
        thread = threading.Thread(
            target=WorkspaceManager._monitor_workspace_background,
            args=(workspace_id,),
            daemon=True
        )
        thread.start()
    
    @staticmethod
    def _monitor_workspace_background(workspace_id: int) -> None:
        """Background monitoring task"""
        max_attempts = 60  # 30 minutes with 30-second intervals
        attempt = 0
        
        while attempt < max_attempts:
            try:
                workspace = Workspace.objects.get(id=workspace_id)
                
                # Skip monitoring if workspace is no longer pending
                if workspace.state not in ['PENDING']:
                    logger.info(f"Stopping monitoring for workspace {workspace_id} (state: {workspace.state})")
                    break
                
                credential = workspace.cloud_credential
                
                if credential.cloud_provider == 'aws':
                    WorkspaceManager._check_aws_workspace_status(workspace)
                elif credential.cloud_provider == 'azure':
                    WorkspaceManager._check_azure_workspace_status(workspace)
                
                # Check if workspace is now available
                workspace.refresh_from_db()
                if workspace.state == 'AVAILABLE':
                    logger.info(f"Workspace {workspace_id} is now available")
                    break
                elif workspace.state == 'ERROR':
                    logger.error(f"Workspace {workspace_id} creation failed")
                    break
                
                time.sleep(30)  # Wait 30 seconds before checking again
                attempt += 1
                
            except Workspace.DoesNotExist:
                logger.error(f"Workspace {workspace_id} not found during monitoring")
                break
            except Exception as e:
                logger.error(f"Error monitoring workspace {workspace_id}: {str(e)}")
                attempt += 1
                time.sleep(30)
        
        if attempt >= max_attempts:
            try:
                workspace = Workspace.objects.get(id=workspace_id)
                if workspace.state == 'PENDING':
                    workspace.error_message = "Workspace creation timeout - please check manually"
                    workspace.save()
                    logger.warning(f"Monitoring timeout for workspace {workspace_id}")
            except:
                pass
    
    @staticmethod
    def _check_aws_workspace_status(workspace: Workspace) -> None:
        """Check AWS workspace status"""
        credential = workspace.cloud_credential
        
        try:
            service = AWSWorkSpacesService(
                access_key=credential.get_access_key(),
                secret_key=credential.get_secret_key(),
                region=credential.region
            )
            
            workspace_info = service.get_workspace(workspace.workspace_id)
            if workspace_info:
                current_state = workspace_info.get('State')
                
                # Update workspace state
                if current_state != workspace.state:
                    workspace.state = current_state
                    logger.info(f"Workspace {workspace.id} state updated to: {current_state}")
                
                # Update connection info if available
                if current_state == 'AVAILABLE':
                    connection_info = service.get_connection_info(workspace.workspace_id)
                    if connection_info:
                        workspace.connection_string = connection_info.get('connection_string', '')
                
                # Update error message if workspace failed
                if current_state == 'ERROR' and workspace_info.get('ErrorMessage'):
                    workspace.error_message = workspace_info['ErrorMessage']
                
                workspace.save()
                
        except Exception as e:
            logger.error(f"Error checking AWS workspace status: {str(e)}")
    
    @staticmethod
    def _check_azure_workspace_status(workspace: Workspace) -> None:
        """Check Azure workspace status (placeholder)"""
        # TODO: Implement actual Azure status checking
        # For now, just mark as available after some time
        try:
            # Simulate workspace becoming available after 5 minutes
            if workspace.created_at and (timezone.now() - workspace.created_at).seconds > 300:
                workspace.state = 'AVAILABLE'
                workspace.connection_string = f"ms-avd://{workspace.workspace_id}"
                workspace.save()
                logger.info(f"Azure workspace {workspace.id} marked as available (simulated)")
        except Exception as e:
            logger.error(f"Error checking Azure workspace status: {str(e)}")


class BundleManager:
    """Manages workspace bundle operations"""
    
    @staticmethod
    def get_available_bundles(cloud_provider: str, credential: CloudCredential) -> list:
        """
        Get available workspace bundles for a cloud provider
        
        Args:
            cloud_provider: 'aws' or 'azure'
            credential: Cloud credential to use for API calls
            
        Returns:
            List of available bundles
        """
        try:
            if cloud_provider == 'aws':
                return BundleManager._get_aws_bundles(credential)
            elif cloud_provider == 'azure':
                return BundleManager._get_azure_bundles(credential)
            else:
                return []
        except Exception as e:
            logger.error(f"Error getting bundles for {cloud_provider}: {str(e)}")
            return []
    
    @staticmethod
    def _get_aws_bundles(credential: CloudCredential) -> list:
        """Get AWS WorkSpaces bundles"""
        try:
            service = AWSWorkSpacesService(
                access_key=credential.get_access_key(),
                secret_key=credential.get_secret_key(),
                region=credential.region
            )
            
            bundles = service.list_bundles()
            
            # Format bundles for API response
            formatted_bundles = []
            for bundle in bundles:
                formatted_bundles.append({
                    'bundle_id': bundle['BundleId'],
                    'name': bundle['Name'],
                    'description': bundle.get('Description', ''),
                    'compute_type': bundle['ComputeType']['Name'],
                    'user_storage': bundle['UserStorage']['Capacity'],
                    'root_storage': bundle['RootStorage']['Capacity'],
                    'owner': bundle.get('Owner', 'AMAZON'),
                    'cloud_provider': 'aws'
                })
            
            return formatted_bundles
            
        except Exception as e:
            logger.error(f"Error getting AWS bundles: {str(e)}")
            return []
    
    @staticmethod
    def _get_azure_bundles(credential: CloudCredential) -> list:
        """Get Azure Virtual Desktop bundles (placeholder)"""
        # TODO: Implement actual Azure bundle retrieval
        return [
            {
                'bundle_id': 'azure-standard-d2s-v3',
                'name': 'Standard D2s v3',
                'description': 'General purpose compute with 2 vCPUs and 8 GB RAM',
                'compute_type': 'Standard_D2s_v3',
                'user_storage': 128,
                'root_storage': 30,
                'owner': 'AZURE',
                'cloud_provider': 'azure'
            },
            {
                'bundle_id': 'azure-standard-d4s-v3',
                'name': 'Standard D4s v3',
                'description': 'General purpose compute with 4 vCPUs and 16 GB RAM',
                'compute_type': 'Standard_D4s_v3',
                'user_storage': 256,
                'root_storage': 30,
                'owner': 'AZURE',
                'cloud_provider': 'azure'
            }
        ]


def refresh_workspace_status(workspace_id: int) -> dict:
    """
    Manually refresh workspace status
    
    Args:
        workspace_id: ID of workspace to refresh
        
    Returns:
        Updated workspace info
    """
    try:
        workspace = Workspace.objects.get(id=workspace_id)
        credential = workspace.cloud_credential
        
        if credential.cloud_provider == 'aws':
            WorkspaceManager._check_aws_workspace_status(workspace)
        elif credential.cloud_provider == 'azure':
            WorkspaceManager._check_azure_workspace_status(workspace)
        
        workspace.refresh_from_db()
        return {
            'id': workspace.id,
            'state': workspace.state,
            'workspace_id': workspace.workspace_id,
            'connection_string': workspace.connection_string,
            'error_message': workspace.error_message,
            'updated_at': workspace.updated_at
        }
        
    except Workspace.DoesNotExist:
        return {'error': 'Workspace not found'}
    except Exception as e:
        logger.error(f"Error refreshing workspace status: {str(e)}")
        return {'error': str(e)}
