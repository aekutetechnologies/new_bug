from rest_framework import serializers
from .models import CloudCredential, Workspace
from jobs.serializers import ApplicationSerializer


class CloudCredentialSerializer(serializers.ModelSerializer):
    """Serializer for cloud credentials (masked sensitive data)"""
    
    access_key_masked = serializers.SerializerMethodField()
    secret_key_masked = serializers.SerializerMethodField()
    
    class Meta:
        model = CloudCredential
        fields = [
            'id', 'credential_name', 'cloud_provider', 'region',
            'directory_id', 'tenant_id', 'subscription_id', 'resource_group',
            'is_active', 'created_at', 'updated_at',
            'access_key_masked', 'secret_key_masked'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_access_key_masked(self, obj):
        """Return masked access key"""
        key = obj.get_access_key()
        if len(key) > 8:
            return key[:4] + '*' * (len(key) - 8) + key[-4:]
        return '*' * len(key)
    
    def get_secret_key_masked(self, obj):
        """Return masked secret key"""
        return '**********************'


class CloudCredentialCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating cloud credentials"""
    
    access_key_plain = serializers.CharField(write_only=True)
    secret_key_plain = serializers.CharField(write_only=True)
    
    class Meta:
        model = CloudCredential
        fields = [
            'credential_name', 'cloud_provider', 'region',
            'access_key_plain', 'secret_key_plain',
            'directory_id', 'tenant_id', 'subscription_id', 'resource_group'
        ]
    
    def validate(self, attrs):
        # Validate required fields based on cloud provider
        if attrs['cloud_provider'] == 'aws':
            if not attrs.get('directory_id'):
                raise serializers.ValidationError({
                    "directory_id": "Directory ID is required for AWS."
                })
        elif attrs['cloud_provider'] == 'azure':
            if not attrs.get('tenant_id') or not attrs.get('subscription_id') or not attrs.get('resource_group'):
                raise serializers.ValidationError({
                    "azure_config": "Tenant ID, Subscription ID, and Resource Group are required for Azure."
                })
        
        return attrs
    
    def create(self, validated_data):
        access_key_plain = validated_data.pop('access_key_plain')
        secret_key_plain = validated_data.pop('secret_key_plain')
        
        credential = CloudCredential.objects.create(
            provider_user=self.context['request'].user,
            **validated_data
        )
        
        # Encrypt and save sensitive fields
        credential.set_access_key(access_key_plain)
        credential.set_secret_key(secret_key_plain)
        credential.save()
        
        return credential


class WorkspaceSerializer(serializers.ModelSerializer):
    """Serializer for workspace"""
    
    application = ApplicationSerializer(read_only=True, allow_null=True)
    cloud_credential_name = serializers.SerializerMethodField()
    applicant_name = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    is_imported = serializers.SerializerMethodField()
    registration_code = serializers.SerializerMethodField()
    password = serializers.SerializerMethodField()
    connection_string = serializers.SerializerMethodField()
    
    class Meta:
        model = Workspace
        fields = [
            'id', 'application', 'cloud_credential', 'cloud_credential_name',
            'workspace_id', 'cloud_provider', 'workspace_type', 'bundle_id',
            'state', 'connection_string', 'username', 'error_message',
            'created_by', 'created_at', 'updated_at',
            'applicant_name', 'job_title', 'is_imported', 'registration_code', 'password'
        ]
        read_only_fields = [
            'id', 'workspace_id', 'state',
            'created_by', 'created_at', 'updated_at', 'error_message'
        ]
    
    def get_cloud_credential_name(self, obj):
        """Get cloud credential name, or None if no credential assigned"""
        if obj.cloud_credential:
            return obj.cloud_credential.credential_name
        return None
    
    def get_applicant_name(self, obj):
        """Get applicant name, or None if no application assigned"""
        if obj.application:
            return obj.application.applicant.email
        return None
    
    def get_job_title(self, obj):
        """Get job title, or None if no application assigned"""
        if obj.application:
            return obj.application.job.title
        return None
    
    def get_is_imported(self, obj):
        """Check if workspace is imported (has registration_code or no cloud_credential)"""
        # A workspace is considered imported if:
        # 1. It has a registration_code (imported from AWS/Azure console)
        # 2. OR it has no cloud_credential (imported without credential)
        return bool(obj.registration_code or not obj.cloud_credential)
    
    def get_registration_code(self, obj):
        """Get registration code"""
        return obj.registration_code or ''
    
    def get_connection_string(self, obj):
        """Get connection string - use registration_code if available, otherwise use stored connection_string"""
        if obj.registration_code:
            return f"workspaces://{obj.registration_code}"
        return obj.connection_string or ''
    
    def get_password(self, obj):
        """Get decrypted password - for seekers (workspace owners) and providers (workspace creators)"""
        request = self.context.get('request')
        if request:
            # Show password to:
            # 1. The seeker who owns the workspace (application.applicant)
            # 2. The provider who created the workspace (created_by)
            if obj.application and obj.application.applicant == request.user:
                # Seeker owns the workspace
                try:
                    password = obj.get_password()
                    return password if password else ''
                except Exception:
                    return ''
            elif obj.created_by == request.user:
                # Provider created the workspace
                try:
                    password = obj.get_password()
                    return password if password else ''
                except Exception:
                    return ''
        return ''


class WorkspaceCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a workspace"""
    
    application_id = serializers.IntegerField(write_only=True)
    cloud_credential_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Workspace
        fields = [
            'application_id', 'cloud_credential_id', 'workspace_type',
            'bundle_id', 'username'
        ]
    
    def validate(self, attrs):
        from jobs.models import Application
        from .tasks import BundleManager
        
        # Validate application exists and is approved
        try:
            application = Application.objects.get(id=attrs['application_id'])
        except Application.DoesNotExist:
            raise serializers.ValidationError({"application_id": "Application not found."})
        
        if application.status != 'approved':
            raise serializers.ValidationError({"application_id": "Application must be approved first."})
        
        # Check if workspace already exists for this application
        if Workspace.objects.filter(application=application).exists():
            raise serializers.ValidationError({"application_id": "Workspace already exists for this application."})
        
        # Validate cloud credential exists and belongs to user
        try:
            credential = CloudCredential.objects.get(
                id=attrs['cloud_credential_id'],
                provider_user=self.context['request'].user
            )
        except CloudCredential.DoesNotExist:
            raise serializers.ValidationError({"cloud_credential_id": "Cloud credential not found."})
        
        # Validate user owns the job
        if application.job.created_by != self.context['request'].user:
            raise serializers.ValidationError({"application_id": "You don't have permission to create workspace for this application."})
        
        # Validate bundle compatibility
        bundle_id = attrs.get('bundle_id')
        if bundle_id:
            try:
                # Get available bundles for this credential
                available_bundles = BundleManager.get_available_bundles(credential.cloud_provider, credential)
                bundle_ids = [bundle['bundle_id'] for bundle in available_bundles]
                
                if bundle_id not in bundle_ids:
                    raise serializers.ValidationError({
                        "bundle_id": f"Bundle '{bundle_id}' is not available for this cloud provider/credential. "
                                   f"Available bundles: {', '.join(bundle_ids[:5])}{'...' if len(bundle_ids) > 5 else ''}"
                    })
            except Exception as e:
                # If we can't validate bundles, log a warning but don't fail validation
                # This allows fallback for manual bundle IDs
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Could not validate bundle compatibility: {str(e)}")
        
        # Validate workspace type compatibility
        workspace_type = attrs.get('workspace_type')
        if workspace_type and credential.cloud_provider == 'aws':
            # AWS WorkSpaces bundle validation could be more sophisticated
            # For now, just ensure we have a valid workspace type
            valid_types = ['ubuntu', 'windows']
            if workspace_type not in valid_types:
                raise serializers.ValidationError({
                    "workspace_type": f"Invalid workspace type '{workspace_type}'. Valid types: {', '.join(valid_types)}"
                })
        
        attrs['application'] = application
        attrs['cloud_credential'] = credential
        
        return attrs
    
    def create(self, validated_data):
        application = validated_data.pop('application')
        cloud_credential = validated_data.pop('cloud_credential')
        validated_data.pop('application_id')
        validated_data.pop('cloud_credential_id')
        
        workspace = Workspace.objects.create(
            application=application,
            cloud_credential=cloud_credential,
            cloud_provider=cloud_credential.cloud_provider,
            created_by=self.context['request'].user,
            state='PENDING',
            **validated_data
        )
        
        return workspace


class WorkspaceConnectionSerializer(serializers.ModelSerializer):
    """Serializer for workspace connection details"""
    
    registration_code = serializers.CharField(read_only=True)
    password = serializers.SerializerMethodField()
    connection_string = serializers.SerializerMethodField()
    
    class Meta:
        model = Workspace
        fields = [
            'id', 'workspace_id', 'workspace_type', 'state', 'cloud_provider',
            'connection_string', 'username', 'registration_code', 'password'
        ]
        read_only_fields = ['id', 'workspace_id', 'workspace_type', 'state', 'cloud_provider',
                           'username', 'registration_code']
    
    def get_connection_string(self, obj):
        """Get connection string - use registration_code if available, otherwise use stored connection_string"""
        if obj.registration_code:
            return f"workspaces://{obj.registration_code}"
        return obj.connection_string or ''
    
    def get_password(self, obj):
        """Get decrypted password"""
        try:
            return obj.get_password()
        except Exception:
            return ''


class WorkspaceUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating workspace (assigning/reassigning applications)"""
    
    application_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Workspace
        fields = ['application_id']
    
    def validate(self, attrs):
        from jobs.models import Application
        
        application_id = attrs.get('application_id')
        
        # If application_id is None, allow unassigning
        if application_id is None:
            return attrs
        
        # Validate application exists
        try:
            application = Application.objects.get(id=application_id)
        except Application.DoesNotExist:
            raise serializers.ValidationError({"application_id": "Application not found."})
        
        # Validate application is approved
        if application.status != 'approved':
            raise serializers.ValidationError({"application_id": "Application must be approved first."})
        
        # Validate user owns the job
        if application.job.created_by != self.context['request'].user:
            raise serializers.ValidationError({"application_id": "You don't have permission to assign workspace to this application."})
        
        # Check if another workspace already exists for this application
        existing_workspace = Workspace.objects.filter(application=application).exclude(id=self.instance.id if self.instance else None).first()
        if existing_workspace:
            raise serializers.ValidationError({
                "application_id": f"This application already has a workspace assigned (Workspace ID: {existing_workspace.workspace_id or existing_workspace.id})."
            })
        
        attrs['application'] = application
        return attrs
    
    def update(self, instance, validated_data):
        application = validated_data.pop('application', None)
        validated_data.pop('application_id', None)
        
        # Update workspace application (can be None to unassign)
        instance.application = application
        instance.save()
        
        return instance


class WorkspaceImportSerializer(serializers.ModelSerializer):
    """Serializer for importing pre-existing workspaces"""
    
    cloud_credential_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    application_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    password_plain = serializers.CharField(write_only=True, required=True)
    cloud_provider = serializers.ChoiceField(choices=CloudCredential.CLOUD_PROVIDER_CHOICES, required=True)
    
    class Meta:
        model = Workspace
        fields = [
            'cloud_credential_id', 'workspace_id', 'workspace_type', 'application_id',
            'registration_code', 'username', 'password_plain', 'bundle_id', 'state', 'cloud_provider'
        ]
    
    def validate(self, attrs):
        from jobs.models import Application
        
        # Validate cloud credential if provided
        cloud_credential_id = attrs.get('cloud_credential_id')
        if cloud_credential_id:
            try:
                credential = CloudCredential.objects.get(
                    id=cloud_credential_id,
                    provider_user=self.context['request'].user
                )
                attrs['cloud_credential'] = credential
                # Use cloud provider from credential if not specified
                if 'cloud_provider' not in attrs:
                    attrs['cloud_provider'] = credential.cloud_provider
            except CloudCredential.DoesNotExist:
                raise serializers.ValidationError({"cloud_credential_id": "Cloud credential not found."})
        else:
            attrs['cloud_credential'] = None
            # If no credential, cloud_provider must be provided
            if 'cloud_provider' not in attrs or not attrs.get('cloud_provider'):
                raise serializers.ValidationError({"cloud_provider": "Cloud provider is required when cloud credential is not specified."})
        
        # Validate workspace_id is provided
        if not attrs.get('workspace_id'):
            raise serializers.ValidationError({"workspace_id": "Workspace ID is required for pre-existing workspaces."})
        
        # Check if workspace_id already exists (across all credentials or none)
        workspace_exists = Workspace.objects.filter(workspace_id=attrs['workspace_id']).exists()
        if workspace_exists:
            raise serializers.ValidationError({"workspace_id": "A workspace with this ID already exists in the system."})
        
        # Validate application if provided
        application_id = attrs.get('application_id')
        if application_id:
            try:
                application = Application.objects.get(id=application_id)
            except Application.DoesNotExist:
                raise serializers.ValidationError({"application_id": "Application not found."})
            
            if application.status != 'approved':
                raise serializers.ValidationError({"application_id": "Application must be approved first."})
            
            # Check if workspace already exists for this application
            if Workspace.objects.filter(application=application).exists():
                raise serializers.ValidationError({"application_id": "Workspace already exists for this application."})
            
            # Validate user owns the job
            if application.job.created_by != self.context['request'].user:
                raise serializers.ValidationError({"application_id": "You don't have permission to assign workspace to this application."})
            
            attrs['application'] = application
        else:
            attrs['application'] = None
        
        # Validate workspace_type
        workspace_type = attrs.get('workspace_type')
        if workspace_type:
            valid_types = ['ubuntu', 'windows']
            if workspace_type not in valid_types:
                raise serializers.ValidationError({
                    "workspace_type": f"Invalid workspace type '{workspace_type}'. Valid types: {', '.join(valid_types)}"
                })
        
        return attrs
    
    def create(self, validated_data):
        application = validated_data.pop('application', None)
        cloud_credential = validated_data.pop('cloud_credential', None)
        cloud_provider = validated_data.pop('cloud_provider')
        password_plain = validated_data.pop('password_plain')
        validated_data.pop('cloud_credential_id', None)
        validated_data.pop('application_id', None)
        
        # Set default state if not provided
        if 'state' not in validated_data or not validated_data.get('state'):
            validated_data['state'] = 'AVAILABLE'  # Assume imported workspaces are available
        
        workspace = Workspace.objects.create(
            application=application,
            cloud_credential=cloud_credential,
            cloud_provider=cloud_provider,
            created_by=self.context['request'].user,
            **validated_data
        )
        
        # Encrypt and store password
        workspace.set_password(password_plain)
        workspace.save()
        
        return workspace

