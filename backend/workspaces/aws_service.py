"""
AWS WorkSpaces Service
Handles all interactions with AWS WorkSpaces API
"""

import boto3
from botocore.exceptions import ClientError


class AWSWorkSpacesService:
    """Service class for AWS WorkSpaces operations"""
    
    def __init__(self, access_key, secret_key, region):
        """Initialize AWS client with provider-specific credentials"""
        self.client = boto3.client(
            'workspaces',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )
        self.region = region
    
    def create_workspace(self, directory_id, username, bundle_id, tags=None):
        """
        Create a new WorkSpace
        
        Args:
            directory_id: AWS Directory Service directory ID
            username: Username for the WorkSpace
            bundle_id: WorkSpace bundle ID
            tags: Optional tags for the WorkSpace
        
        Returns:
            dict: WorkSpace creation response
        """
        try:
            workspace_request = {
                'DirectoryId': directory_id,
                'UserName': username,
                'BundleId': bundle_id,
                'WorkspaceProperties': {
                    'RunningMode': 'AUTO_STOP',
                    'RunningModeAutoStopTimeoutInMinutes': 60
                }
            }
            
            if tags:
                workspace_request['Tags'] = tags
            
            response = self.client.create_workspaces(
                Workspaces=[workspace_request]
            )
            
            return response
        except ClientError as e:
            raise Exception(f"Failed to create workspace: {str(e)}")
    
    def get_workspace(self, workspace_id):
        """Get workspace details"""
        try:
            response = self.client.describe_workspaces(
                WorkspaceIds=[workspace_id]
            )
            
            if response['Workspaces']:
                return response['Workspaces'][0]
            return None
        except ClientError as e:
            raise Exception(f"Failed to get workspace: {str(e)}")
    
    def start_workspace(self, workspace_id):
        """Start a stopped workspace"""
        try:
            response = self.client.start_workspaces(
                StartWorkspaceRequests=[
                    {'WorkspaceId': workspace_id}
                ]
            )
            return response
        except ClientError as e:
            raise Exception(f"Failed to start workspace: {str(e)}")
    
    def stop_workspace(self, workspace_id):
        """Stop a running workspace"""
        try:
            response = self.client.stop_workspaces(
                StopWorkspaceRequests=[
                    {'WorkspaceId': workspace_id}
                ]
            )
            return response
        except ClientError as e:
            raise Exception(f"Failed to stop workspace: {str(e)}")
    
    def reboot_workspace(self, workspace_id):
        """Reboot a workspace"""
        try:
            response = self.client.reboot_workspaces(
                RebootWorkspaceRequests=[
                    {'WorkspaceId': workspace_id}
                ]
            )
            return response
        except ClientError as e:
            raise Exception(f"Failed to reboot workspace: {str(e)}")
    
    def terminate_workspace(self, workspace_id):
        """Terminate a workspace"""
        try:
            response = self.client.terminate_workspaces(
                TerminateWorkspaceRequests=[
                    {'WorkspaceId': workspace_id}
                ]
            )
            return response
        except ClientError as e:
            raise Exception(f"Failed to terminate workspace: {str(e)}")
    
    def get_connection_info(self, workspace_id):
        """Get connection information for a workspace"""
        try:
            workspace = self.get_workspace(workspace_id)
            if workspace:
                return {
                    'workspace_id': workspace_id,
                    'computer_name': workspace.get('ComputerName'),
                    'ip_address': workspace.get('IpAddress'),
                    'state': workspace.get('State'),
                    'connection_string': f"workspaces://{workspace_id}"
                }
            return None
        except Exception as e:
            raise Exception(f"Failed to get connection info: {str(e)}")
    
    def list_bundles(self):
        """List available WorkSpace bundles"""
        try:
            response = self.client.describe_workspace_bundles(Owner='AMAZON')
            return response.get('Bundles', [])
        except ClientError as e:
            raise Exception(f"Failed to list bundles: {str(e)}")
    
    def test_credentials(self, directory_id):
        """Test if credentials are valid"""
        try:
            # Validate directory_id format
            if not directory_id or not directory_id.startswith('d-'):
                raise ValueError(f"Invalid directory ID format: '{directory_id}'. AWS Directory IDs start with 'd-'")
            
            # Try to describe workspaces in the directory
            # This tests both credentials and directory access
            response = self.client.describe_workspaces(
                DirectoryId=directory_id,
                Limit=1  # Just need to verify access
            )
            
            # If we get here, credentials are valid
            return True
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', '')
            error_message = e.response.get('Error', {}).get('Message', '')
            
            # Re-raise with more specific error message
            if error_code == 'InvalidParameterValue':
                raise Exception(f"Invalid directory ID or region: {error_message}")
            elif error_code in ['UnauthorizedOperation', 'AccessDenied']:
                raise Exception(f"Access denied. Please ensure your IAM user has 'workspaces:Describe*' permissions: {error_message}")
            elif error_code in ['AuthFailure', 'SignatureDoesNotMatch']:
                raise Exception(f"Invalid AWS credentials (access key or secret key): {error_message}")
            else:
                raise Exception(f"AWS API error ({error_code}): {error_message}")
        
        except ValueError as e:
            # Re-raise validation errors
            raise e
        
        except Exception as e:
            # Catch any other errors
            if "Could not connect to the endpoint URL" in str(e):
                raise Exception(f"Invalid region or network error. Please check your region setting.")
            raise Exception(f"Unexpected error: {str(e)}")

