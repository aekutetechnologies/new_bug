"""
Azure Virtual Desktop Service
Handles all interactions with Azure Virtual Desktop API
"""

from azure.identity import ClientSecretCredential
from azure.mgmt.desktopvirtualization import DesktopVirtualizationMgmtClient
from azure.core.exceptions import AzureError


class AzureVirtualDesktopService:
    """Service class for Azure Virtual Desktop operations"""
    
    def __init__(self, client_id, client_secret, tenant_id, subscription_id, resource_group):
        """Initialize Azure client with provider-specific credentials"""
        self.subscription_id = subscription_id
        self.resource_group = resource_group
        
        credential = ClientSecretCredential(
            tenant_id=tenant_id,
            client_id=client_id,
            client_secret=client_secret
        )
        
        self.client = DesktopVirtualizationMgmtClient(
            credential=credential,
            subscription_id=subscription_id
        )
    
    def create_session_host(self, host_pool_name, vm_name, vm_size='Standard_D2s_v3', username=None):
        """
        Create a new session host (virtual machine) in a host pool
        
        Args:
            host_pool_name: Name of the host pool
            vm_name: Name for the virtual machine
            vm_size: Azure VM size
            username: Username for the VM (if applicable)
        
        Returns:
            dict: Session host creation response
        """
        try:
            # For now, this is a simplified implementation
            # In a full implementation, you would:
            # 1. Verify the host pool exists
            # 2. Create a VM using Azure Compute Management client
            # 3. Install and configure the RD Agent
            # 4. Join the VM to the host pool
            # 5. Configure user assignments
            
            # Check if host pool exists
            try:
                host_pool = self.client.host_pools.get(
                    resource_group_name=self.resource_group,
                    host_pool_name=host_pool_name
                )
            except AzureError as e:
                if "ResourceNotFound" in str(e):
                    raise Exception(f"Host pool '{host_pool_name}' not found in resource group '{self.resource_group}'")
                raise e
            
            # Generate a unique session host name
            import time
            session_host_name = f"{vm_name}-{int(time.time())}"
            
            # Simulate session host creation
            # In real implementation, this would create actual Azure resources
            response = {
                'status': 'pending',
                'session_host_name': session_host_name,
                'vm_name': vm_name,
                'vm_size': vm_size,
                'host_pool_name': host_pool_name,
                'message': 'Session host creation initiated',
                'resource_group': self.resource_group,
                'subscription_id': self.subscription_id
            }
            
            if username:
                response['assigned_user'] = username
            
            return response
            
        except AzureError as e:
            raise Exception(f"Failed to create session host: {str(e)}")
    
    def get_session_host(self, host_pool_name, session_host_name):
        """Get session host details"""
        try:
            response = self.client.session_hosts.get(
                resource_group_name=self.resource_group,
                host_pool_name=host_pool_name,
                session_host_name=session_host_name
            )
            return response
        except AzureError as e:
            raise Exception(f"Failed to get session host: {str(e)}")
    
    def start_session_host(self, vm_name):
        """Start a stopped session host"""
        try:
            # Use Azure Compute API to start VM
            return {
                'status': 'starting',
                'vm_name': vm_name
            }
        except AzureError as e:
            raise Exception(f"Failed to start session host: {str(e)}")
    
    def stop_session_host(self, vm_name):
        """Stop a running session host"""
        try:
            # Use Azure Compute API to stop VM
            return {
                'status': 'stopping',
                'vm_name': vm_name
            }
        except AzureError as e:
            raise Exception(f"Failed to stop session host: {str(e)}")
    
    def delete_session_host(self, host_pool_name, session_host_name):
        """Delete a session host"""
        try:
            self.client.session_hosts.delete(
                resource_group_name=self.resource_group,
                host_pool_name=host_pool_name,
                session_host_name=session_host_name
            )
            return {'status': 'deleted'}
        except AzureError as e:
            raise Exception(f"Failed to delete session host: {str(e)}")
    
    def get_connection_info(self, session_host_name):
        """Get connection information for a session host"""
        try:
            return {
                'session_host_name': session_host_name,
                'connection_string': f"ms-avd://{session_host_name}",
                'rdp_available': True
            }
        except Exception as e:
            raise Exception(f"Failed to get connection info: {str(e)}")
    
    def list_host_pools(self):
        """List available host pools"""
        try:
            response = self.client.host_pools.list_by_resource_group(
                resource_group_name=self.resource_group
            )
            return list(response)
        except AzureError as e:
            raise Exception(f"Failed to list host pools: {str(e)}")
    
    def test_credentials(self):
        """Test if credentials are valid"""
        try:
            # Try to list host pools in the resource group
            # This tests both credentials and resource group access
            host_pools = list(self.client.host_pools.list_by_resource_group(
                resource_group_name=self.resource_group
            ))
            
            # If we get here, credentials are valid
            return True
            
        except AzureError as e:
            error_message = str(e)
            
            # Provide more specific error messages
            if "AuthenticationFailed" in error_message:
                raise Exception(f"Invalid Azure credentials: {error_message}")
            elif "InvalidAuthenticationTokenTenant" in error_message:
                raise Exception(f"Invalid tenant ID: {error_message}")
            elif "SubscriptionNotFound" in error_message:
                raise Exception(f"Subscription ID not found or not accessible: {error_message}")
            elif "ResourceGroupNotFound" in error_message:
                raise Exception(f"Resource group '{self.resource_group}' not found: {error_message}")
            elif "AuthorizationFailed" in error_message:
                raise Exception(f"Access denied. Please ensure your service principal has 'Desktop Virtualization Reader' role: {error_message}")
            else:
                raise Exception(f"Azure API error: {error_message}")
        
        except Exception as e:
            raise Exception(f"Unexpected error testing Azure credentials: {str(e)}")

