# Workspace Creation Logic

This document outlines the comprehensive workspace creation logic implemented for the job portal platform.

## Overview

The workspace creation system provides automated provisioning of cloud-based virtual desktops (VDI) for job seekers, managed by job providers. It supports both AWS WorkSpaces and Azure Virtual Desktop platforms with robust error handling, monitoring, and recovery mechanisms.

## Architecture

### Core Components

1. **Models** (`models.py`)
   - `CloudCredential`: Stores encrypted cloud provider credentials
   - `Workspace`: Tracks workspace lifecycle and metadata

2. **Services** 
   - `AWSWorkSpacesService` (`aws_service.py`): AWS WorkSpaces API integration
   - `AzureVirtualDesktopService` (`azure_service.py`): Azure Virtual Desktop API integration

3. **Background Tasks** (`tasks.py`)
   - `WorkspaceManager`: Handles asynchronous workspace creation and monitoring
   - `BundleManager`: Manages workspace bundle/template operations

4. **API Views** (`views.py`)
   - REST API endpoints for workspace CRUD operations
   - Bundle listing and workspace management endpoints

## Features Implemented

### ✅ Background Task Support
- **Asynchronous workspace creation** using threading
- **Non-blocking API responses** - workspace creation happens in background
- **Proper state management** with database updates

### ✅ Bundle Listing API
- **GET `/api/workspaces/bundles/{credential_id}/`** - List available bundles for a credential
- **Cloud provider specific** bundle formatting
- **Error handling** for bundle retrieval failures

### ✅ Workspace Monitoring System
- **Real-time status polling** for workspace provisioning
- **Automatic state updates** (PENDING → AVAILABLE/ERROR)
- **30-minute timeout** with configurable intervals
- **Connection string** updates when workspace becomes available

### ✅ Bundle Compatibility Validation
- **Bundle availability checking** during workspace creation
- **Workspace type validation** (Ubuntu/Windows)
- **Cloud provider compatibility** verification
- **Detailed error messages** for validation failures

### ✅ Error Recovery & Retry Mechanisms
- **Exponential backoff** retry logic (3 attempts max)
- **Retryable error detection** (throttling, timeouts, service unavailable)
- **Manual retry endpoint** for failed workspaces
- **Comprehensive error logging**

### ✅ Enhanced Azure Implementation
- **Host pool verification** before session host creation
- **VM size mapping** from bundle IDs
- **Session host lifecycle management**
- **Azure-specific error handling**

## API Endpoints

### Workspace Management
```
POST   /api/workspaces/workspaces/                    # Create workspace
GET    /api/workspaces/workspaces/                    # List workspaces
GET    /api/workspaces/workspaces/{id}/               # Get workspace details
PUT    /api/workspaces/workspaces/{id}/               # Update workspace
DELETE /api/workspaces/workspaces/{id}/               # Delete workspace
```

### Workspace Operations
```
POST   /api/workspaces/workspaces/{id}/start/         # Start workspace
POST   /api/workspaces/workspaces/{id}/stop/          # Stop workspace
POST   /api/workspaces/workspaces/{id}/restart/       # Restart workspace
POST   /api/workspaces/workspaces/{id}/terminate/     # Terminate workspace
GET    /api/workspaces/workspaces/{id}/connection/    # Get connection info
```

### Monitoring & Troubleshooting
```
POST   /api/workspaces/workspaces/{id}/refresh/       # Refresh workspace status
POST   /api/workspaces/workspaces/{id}/retry/         # Retry failed creation
GET    /api/workspaces/workspaces/{id}/troubleshoot/  # Get troubleshooting info
GET    /api/workspaces/workspaces/{id}/logs/          # Get workspace logs
GET    /api/workspaces/workspaces/{id}/metrics/       # Get usage metrics
```

### Bundle Management
```
GET    /api/workspaces/bundles/{credential_id}/       # List available bundles
```

### Cloud Credentials
```
POST   /api/workspaces/cloud-credentials/             # Create credentials
GET    /api/workspaces/cloud-credentials/             # List credentials
GET    /api/workspaces/cloud-credentials/{id}/        # Get credential details
PUT    /api/workspaces/cloud-credentials/{id}/        # Update credentials
DELETE /api/workspaces/cloud-credentials/{id}/        # Delete credentials
POST   /api/workspaces/cloud-credentials/{id}/test/   # Test credentials
```

## Workspace Creation Flow

1. **Request Validation**
   - Validate application is approved
   - Check workspace doesn't already exist
   - Verify cloud credential ownership
   - Validate bundle compatibility

2. **Database Record Creation**
   - Create workspace record with PENDING state
   - Associate with application and credential

3. **Background Processing**
   - Initialize cloud service client
   - Create workspace with cloud provider
   - Update workspace ID and state

4. **Monitoring Loop**
   - Poll workspace status every 30 seconds
   - Update database with current state
   - Set connection info when available
   - Handle timeout after 30 minutes

5. **Error Handling**
   - Retry on transient errors (3 attempts max)
   - Log detailed error information
   - Update workspace state to ERROR
   - Provide troubleshooting suggestions

## Usage Examples

### Creating a Workspace
```python
POST /api/workspaces/workspaces/
{
    "application_id": 123,
    "cloud_credential_id": 456,
    "workspace_type": "ubuntu",
    "bundle_id": "wsb-1234567890",
    "username": "john.doe"
}
```

### Listing Available Bundles
```python
GET /api/workspaces/bundles/456/
# Returns:
{
    "bundles": [
        {
            "bundle_id": "wsb-1234567890",
            "name": "Standard Ubuntu 20.04",
            "compute_type": "Standard",
            "user_storage": 100,
            "cloud_provider": "aws"
        }
    ],
    "count": 1
}
```

### Monitoring Workspace Status
```python
POST /api/workspaces/workspaces/789/refresh/
# Returns:
{
    "message": "Workspace status refreshed successfully",
    "state": "AVAILABLE",
    "connection_string": "workspaces://ws-abc123def456"
}
```

## Error Recovery

### Automatic Retry
- Handles transient errors automatically
- Uses exponential backoff (30s, 60s, 120s delays)
- Logs retry attempts for debugging

### Manual Recovery
```python
POST /api/workspaces/workspaces/789/retry/
# Resets workspace state and retries creation
```

### Troubleshooting
```python
GET /api/workspaces/workspaces/789/troubleshoot/
# Returns specific error analysis and solutions
```

## Configuration

### AWS WorkSpaces
- Requires valid AWS credentials with WorkSpaces permissions
- Directory ID must be provided
- Bundle ID must be available in the region

### Azure Virtual Desktop
- Requires service principal credentials
- Host pool must exist in the resource group
- VM sizes are mapped from bundle IDs

## Security Considerations

1. **Credential Encryption**: Cloud credentials are encrypted at rest
2. **Permission Checks**: Users can only manage their own workspaces
3. **Input Validation**: All inputs are validated before processing
4. **Error Sanitization**: Sensitive information is not exposed in error messages

## Monitoring & Logging

- All operations are logged with appropriate levels
- Workspace state changes are tracked
- Error conditions are logged with full context
- Performance metrics are available via API

## Future Enhancements

1. **Celery Integration**: Replace threading with Celery for production
2. **WebSocket Support**: Real-time status updates for frontend
3. **Cost Tracking**: Integration with cloud billing APIs
4. **Auto-scaling**: Dynamic workspace provisioning based on demand
5. **Backup & Recovery**: Automated workspace backup capabilities
