import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useJobStore } from '../../store/jobStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import { Server, Plus, Play, Square, RefreshCw, Trash2, Key, TestTube, HelpCircle, Info, ExternalLink, Upload, Copy, UserPlus, Users } from 'lucide-react';
import { formatDate } from '../../lib/utils';
import { Link as RouterLink } from 'react-router-dom';

export default function ProviderWorkspaces() {
  const [searchParams] = useSearchParams();
  const {
    workspaces,
    cloudCredentials,
    loading,
    fetchWorkspaces,
    fetchCloudCredentials,
    createCloudCredential,
    deleteCloudCredential,
    testCloudCredential,
    createWorkspace,
    importWorkspace,
    assignWorkspace,
    deleteWorkspace,
    startWorkspace,
    stopWorkspace,
    restartWorkspace,
    fetchBundles,
    fetchWorkspace,
  } = useWorkspaceStore();
  
  const { applicants, fetchApplicants } = useJobStore();

  const [credDialogOpen, setCredDialogOpen] = useState(false);
  const [wsDialogOpen, setWsDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'credential' or 'workspace'
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [workspaceCredentials, setWorkspaceCredentials] = useState(null);

  const [credForm, setCredForm] = useState({
    credential_name: '',
    cloud_provider: 'aws',
    access_key_plain: '',
    secret_key_plain: '',
    region: '',
    directory_id: '',
    tenant_id: '',
    subscription_id: '',
    resource_group: '',
  });

  const [wsForm, setWsForm] = useState({
    application_id: searchParams.get('application_id') || '',
    cloud_credential_id: '',
    workspace_type: 'ubuntu',
    bundle_id: '',
    username: '',
  });

  const [importForm, setImportForm] = useState({
    workspace_id: '',
    workspace_type: 'ubuntu',
    cloud_provider: 'aws',
    registration_code: '',
    username: '',
    password: '',
    application_id: '',
  });

  const [bundles, setBundles] = useState([]);
  const [loadingBundles, setLoadingBundles] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
    fetchCloudCredentials();
    fetchApplicants({ status: 'approved' });
  }, [fetchWorkspaces, fetchCloudCredentials, fetchApplicants]);

  // Handle application_id from URL (from Applicants page) - moved after approvedApplicants is defined

  // Fetch bundles when cloud credential is selected
  useEffect(() => {
    const loadBundles = async () => {
      if (wsForm.cloud_credential_id) {
        setLoadingBundles(true);
        try {
          const data = await fetchBundles(wsForm.cloud_credential_id);
          setBundles(data.bundles || []);
        } catch (error) {
          setBundles([]);
          console.error('Failed to load bundles:', error);
        } finally {
          setLoadingBundles(false);
        }
      } else {
        setBundles([]);
      }
    };

    loadBundles();
  }, [wsForm.cloud_credential_id, fetchBundles]);

  const resetCredForm = () => {
    setCredForm({
      credential_name: '',
      cloud_provider: 'aws',
      access_key_plain: '',
      secret_key_plain: '',
      region: '',
      directory_id: '',
      tenant_id: '',
      subscription_id: '',
      resource_group: '',
    });
  };

  const handleCreateCredential = async (e) => {
    e.preventDefault();
    try {
      await createCloudCredential(credForm);
      toast.success('Cloud credential added successfully!');
      setCredDialogOpen(false);
      resetCredForm();
      fetchCloudCredentials();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add cloud credential');
    }
  };

  const handleTestCredential = async (id) => {
    try {
      const result = await testCloudCredential(id);
      if (result.valid) {
        toast.success(result.message || 'Credentials are valid!');
      } else {
        const errorMsg = result.suggestion || result.message || 'Credentials are invalid';
        toast.error(errorMsg);
      }
    } catch (error) {
      // Display detailed error messages from validation or API errors
      const errorData = error.response?.data;
      
      if (errorData?.details && Array.isArray(errorData.details)) {
        // Show validation errors
        errorData.details.forEach((detail) => {
          toast.error(detail);
        });
      } else if (errorData?.suggestion) {
        toast.error(`${errorData.error || 'Test failed'}: ${errorData.suggestion}`);
      } else if (errorData?.error) {
        toast.error(errorData.error);
      } else {
        toast.error('Failed to test credentials. Please check your configuration.');
      }
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    try {
      const wsData = {
        ...wsForm,
        application_id: parseInt(wsForm.application_id),
        cloud_credential_id: parseInt(wsForm.cloud_credential_id),
      };
      const createdWorkspace = await createWorkspace(wsData);
      toast.success('Workspace creation initiated!');
      setWsDialogOpen(false);
      
      // Fetch workspace details to get registration code, username, password if available
      if (createdWorkspace?.id) {
        // Show credentials dialog immediately with what we have
        setWorkspaceCredentials({
          id: createdWorkspace.id,
          workspace_id: createdWorkspace.workspace_id || '',
          username: createdWorkspace.username || wsForm.username,
          registration_code: createdWorkspace.registration_code || '',
          password: createdWorkspace.password || '',
          state: createdWorkspace.state || 'PENDING',
        });
        setCredentialsDialogOpen(true);
        
        // Poll for updated credentials (registration code and password may be available later)
        const pollInterval = setInterval(async () => {
          try {
            await fetchWorkspace(createdWorkspace.id);
            await fetchWorkspaces();
            
            // Get updated workspace from store
            const storeState = useWorkspaceStore.getState();
            const updatedWorkspace = storeState.currentWorkspace?.id === createdWorkspace.id 
              ? storeState.currentWorkspace 
              : storeState.workspaces.find(w => w.id === createdWorkspace.id);
            
            if (updatedWorkspace) {
              // Update credentials if we got new information
              const hasNewInfo = 
                (updatedWorkspace.registration_code && !workspaceCredentials?.registration_code) ||
                (updatedWorkspace.password && !workspaceCredentials?.password) ||
                (updatedWorkspace.workspace_id && !workspaceCredentials?.workspace_id);
              
              if (hasNewInfo) {
                setWorkspaceCredentials({
                  id: updatedWorkspace.id,
                  workspace_id: updatedWorkspace.workspace_id || workspaceCredentials?.workspace_id || '',
                  username: updatedWorkspace.username || workspaceCredentials?.username || wsForm.username,
                  registration_code: updatedWorkspace.registration_code || workspaceCredentials?.registration_code || '',
                  password: updatedWorkspace.password || workspaceCredentials?.password || '',
                  state: updatedWorkspace.state || workspaceCredentials?.state || 'PENDING',
                });
              }
              
              // Stop polling if workspace is AVAILABLE or ERROR
              if (updatedWorkspace.state === 'AVAILABLE' || updatedWorkspace.state === 'ERROR') {
                clearInterval(pollInterval);
              }
            }
          } catch (error) {
            console.error('Failed to fetch workspace details:', error);
          }
        }, 5000); // Poll every 5 seconds
        
        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      }
      
      fetchWorkspaces();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create workspace');
    }
  };

  const handleImportWorkspace = async (e) => {
    e.preventDefault();
    try {
      const importData = {
        workspace_id: importForm.workspace_id,
        workspace_type: importForm.workspace_type,
        cloud_provider: importForm.cloud_provider,
        registration_code: importForm.registration_code,
        username: importForm.username,
        password_plain: importForm.password,
        application_id: importForm.application_id ? parseInt(importForm.application_id) : null,
      };
      await importWorkspace(importData);
      toast.success('Workspace imported successfully!');
      setImportDialogOpen(false);
      setImportForm({
        workspace_id: '',
        workspace_type: 'ubuntu',
        cloud_provider: 'aws',
        registration_code: '',
        username: '',
        password: '',
        application_id: '',
      });
      fetchWorkspaces();
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object') {
        // Handle validation errors
        const errorMessages = Object.values(errorData).flat();
        errorMessages.forEach(msg => toast.error(msg));
      } else {
        toast.error(error.response?.data?.error || 'Failed to import workspace');
      }
    }
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleAssignWorkspace = async (applicationId) => {
    if (!selectedWorkspace) return;
    
    try {
      const appId = applicationId === 'none' || applicationId === '' ? null : parseInt(applicationId);
      await assignWorkspace(selectedWorkspace.id, appId);
      toast.success(appId ? 'Workspace assigned successfully!' : 'Workspace unassigned successfully!');
      setAssignDialogOpen(false);
      setSelectedWorkspace(null);
      fetchWorkspaces();
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData && typeof errorData === 'object') {
        const errorMessages = Object.values(errorData).flat();
        errorMessages.forEach(msg => toast.error(msg));
      } else {
        toast.error(error.response?.data?.error || 'Failed to assign workspace');
      }
    }
  };

  const handleDeleteCredential = async () => {
    try {
      await deleteCloudCredential(selectedItem.id);
      toast.success('Cloud credential deleted');
      setDeleteDialogOpen(false);
      fetchCloudCredentials();
    } catch (error) {
      toast.error('Failed to delete credential. It may be in use.');
    }
  };

  const handleDeleteWorkspace = async () => {
    try {
      await deleteWorkspace(selectedItem.id);
      toast.success('Workspace terminated');
      setDeleteDialogOpen(false);
      fetchWorkspaces();
    } catch (error) {
      toast.error('Failed to delete workspace');
    }
  };

  const getStateBadge = (state) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      AVAILABLE: 'bg-green-100 text-green-800',
      STOPPED: 'bg-gray-100 text-gray-800',
      STOPPING: 'bg-orange-100 text-orange-800',
      STARTING: 'bg-blue-100 text-blue-800',
      REBOOTING: 'bg-purple-100 text-purple-800',
      TERMINATED: 'bg-red-100 text-red-800',
      ERROR: 'bg-red-100 text-red-800',
    };

    return <Badge className={colors[state]}>{state}</Badge>;
  };

  // Filter approved applicants
  const approvedApplicants = applicants.filter(app => app.status === 'approved');

  // Handle application_id from URL (from Applicants page)
  useEffect(() => {
    const applicationId = searchParams.get('application_id');
    if (applicationId && approvedApplicants.length > 0) {
      // Check if applicant already has a workspace
      const hasWorkspace = workspaces.some(w => w.application?.id === parseInt(applicationId));
      
      if (!hasWorkspace) {
        // Pre-select application in Create Workspace form
        setWsForm(prev => ({ ...prev, application_id: applicationId }));
      }
      // Note: If workspace exists, user can use Assign/Reassign dialog instead
    }
  }, [searchParams.get('application_id'), approvedApplicants, workspaces]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My VDIs / Workspaces</h1>
        <p className="text-gray-600">Manage cloud credentials and VDI workspaces</p>
      </div>

      <Tabs defaultValue="workspaces" className="w-full">
        <TabsList>
          <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
          <TabsTrigger value="credentials">Cloud Credentials</TabsTrigger>
        </TabsList>

        {/* Workspaces Tab */}
        <TabsContent value="workspaces" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Workspace
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Import Pre-existing Workspace</DialogTitle>
                  <DialogDescription>
                    Import a workspace that was created outside of this system
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleImportWorkspace} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspace_id">Workspace ID *</Label>
                    <Input
                      id="workspace_id"
                      value={importForm.workspace_id}
                      onChange={(e) => setImportForm({ ...importForm, workspace_id: e.target.value })}
                      placeholder="e.g., ws-w3pxz64vh"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="import_workspace_type">OS Type *</Label>
                      <Select
                        value={importForm.workspace_type}
                        onValueChange={(value) => setImportForm({ ...importForm, workspace_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ubuntu">Ubuntu</SelectItem>
                          <SelectItem value="windows">Windows</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="import_cloud_provider">Cloud Provider *</Label>
                      <Select
                        value={importForm.cloud_provider}
                        onValueChange={(value) => setImportForm({ ...importForm, cloud_provider: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aws">AWS WorkSpaces</SelectItem>
                          <SelectItem value="azure">Azure Virtual Desktop</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="registration_code">Registration Code *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="registration_code"
                        value={importForm.registration_code}
                        onChange={(e) => setImportForm({ ...importForm, registration_code: e.target.value })}
                        placeholder="e.g., SLiad+HP9YKE"
                        required
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(importForm.registration_code, 'Registration code')}
                        disabled={!importForm.registration_code}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="import_username">Username *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="import_username"
                        value={importForm.username}
                        onChange={(e) => setImportForm({ ...importForm, username: e.target.value })}
                        placeholder="e.g., madmasu"
                        required
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(importForm.username, 'Username')}
                        disabled={!importForm.username}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="import_password">Password *</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="import_password"
                        type="password"
                        value={importForm.password}
                        onChange={(e) => setImportForm({ ...importForm, password: e.target.value })}
                        placeholder="e.g., password123"
                        required
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(importForm.password, 'Password')}
                        disabled={!importForm.password}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="import_application_id">Assign to Application (Optional)</Label>
                    <Select
                      value={importForm.application_id || 'none'}
                      onValueChange={(value) => setImportForm({ ...importForm, application_id: value === 'none' ? '' : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select applicant or leave blank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None - Assign Later</SelectItem>
                        {approvedApplicants.map((app) => (
                          <SelectItem key={app.id} value={app.id.toString()}>
                            {app.applicant.email} - {app.job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">You can assign this workspace to an application now or later</p>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setImportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Import Workspace</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={wsDialogOpen} onOpenChange={setWsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workspace
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create VDI Workspace</DialogTitle>
                  <DialogDescription>
                    Create a new workspace for an approved applicant
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="application_id">Approved Applicant *</Label>
                    <Select
                      value={wsForm.application_id}
                      onValueChange={(value) => setWsForm({ ...wsForm, application_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select applicant" />
                      </SelectTrigger>
                      <SelectContent>
                        {approvedApplicants.map((app) => (
                          <SelectItem key={app.id} value={app.id.toString()}>
                            {app.applicant.email} - {app.job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cloud_credential_id">Cloud Credential *</Label>
                    <Select
                      value={wsForm.cloud_credential_id}
                      onValueChange={(value) => {
                        setWsForm({ ...wsForm, cloud_credential_id: value, bundle_id: '' });
                        setBundles([]); // Clear bundles when credential changes
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select cloud credential" />
                      </SelectTrigger>
                      <SelectContent>
                        {cloudCredentials.filter(c => c.is_active).map((cred) => (
                          <SelectItem key={cred.id} value={cred.id.toString()}>
                            {cred.credential_name} ({cred.cloud_provider.toUpperCase()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                                      <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="workspace_type">OS Type *</Label>
                      <Select
                        value={wsForm.workspace_type}
                        onValueChange={(value) => setWsForm({ ...wsForm, workspace_type: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ubuntu">Ubuntu Linux</SelectItem>
                          <SelectItem value="windows">Windows</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bundle_id">Bundle *</Label>
                      {!wsForm.cloud_credential_id ? (
                        <Input
                          id="bundle_id"
                          value={wsForm.bundle_id}
                          onChange={(e) => setWsForm({ ...wsForm, bundle_id: e.target.value })}
                          placeholder="Select cloud credential first"
                          disabled
                        />
                      ) : loadingBundles ? (
                        <Input
                          id="bundle_id"
                          value="Loading bundles..."
                          disabled
                        />
                      ) : bundles.length === 0 ? (
                        <div className="space-y-1">
                          <Input
                            id="bundle_id"
                            value={wsForm.bundle_id}
                            onChange={(e) => setWsForm({ ...wsForm, bundle_id: e.target.value })}
                            placeholder="No bundles found - enter manually"
                          />
                          <p className="text-xs text-yellow-600">No bundles available. Enter bundle ID manually.</p>
                        </div>
                      ) : (
                        <Select
                          value={wsForm.bundle_id}
                          onValueChange={(value) => setWsForm({ ...wsForm, bundle_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select bundle" />
                          </SelectTrigger>
                          <SelectContent>
                            {bundles.map((bundle) => (
                              <SelectItem key={bundle.bundle_id} value={bundle.bundle_id}>
                                {bundle.name} - {bundle.compute_type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={wsForm.username}
                      onChange={(e) => setWsForm({ ...wsForm, username: e.target.value })}
                      required
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setWsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Workspace</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Workspace Credentials Dialog */}
            <Dialog open={credentialsDialogOpen} onOpenChange={setCredentialsDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Workspace Credentials</DialogTitle>
                  <DialogDescription>
                    Save these credentials. They may not be shown again.
                  </DialogDescription>
                </DialogHeader>
                {workspaceCredentials && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Workspace ID</Label>
                      <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded border">
                        <code className="text-sm font-mono flex-1">
                          {workspaceCredentials.workspace_id || 'Pending...'}
                        </code>
                        {workspaceCredentials.workspace_id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(workspaceCredentials.workspace_id);
                              toast.success('Workspace ID copied!');
                            }}
                            title="Copy workspace ID"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {workspaceCredentials.username && (
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded border">
                          <code className="text-sm font-mono flex-1">
                            {workspaceCredentials.username}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(workspaceCredentials.username);
                              toast.success('Username copied!');
                            }}
                            title="Copy username"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {workspaceCredentials.registration_code && (
                      <div className="space-y-2">
                        <Label>Registration Code</Label>
                        <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded border">
                          <code className="text-sm font-mono flex-1">
                            {workspaceCredentials.registration_code}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(workspaceCredentials.registration_code);
                              toast.success('Registration code copied!');
                            }}
                            title="Copy registration code"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {workspaceCredentials.password && (
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded border">
                          <code className="text-sm font-mono flex-1">
                            {workspaceCredentials.password}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              navigator.clipboard.writeText(workspaceCredentials.password);
                              toast.success('Password copied!');
                            }}
                            title="Copy password"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {!workspaceCredentials.registration_code && !workspaceCredentials.password && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <p className="text-sm text-blue-800">
                          <Info className="h-4 w-4 inline mr-2" />
                          Registration code and password will be available once the workspace is fully created and becomes AVAILABLE.
                          The workspace is currently in <strong>{workspaceCredentials.state}</strong> state.
                        </p>
                      </div>
                    )}
                  </div>
                )}
                <DialogFooter>
                  <Button onClick={() => setCredentialsDialogOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {workspaces.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Server className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No workspaces created yet</h3>
                <p className="text-gray-600 mb-4">
                  Create workspaces for approved applicants to give them access to VDI environments.
                </p>
                <Button onClick={() => setWsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Workspace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workspaces.map((workspace) => (
                <Card key={workspace.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle>{workspace.job_title || workspace.workspace_id || 'Workspace'}</CardTitle>
                          {workspace.is_imported ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <Upload className="h-3 w-3 mr-1" />
                              Imported
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <Plus className="h-3 w-3 mr-1" />
                              Created
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          {workspace.applicant_name ? (
                            <>For: {workspace.applicant_name} | Type: {workspace.workspace_type} | Provider: {workspace.cloud_provider.toUpperCase()}</>
                          ) : (
                            <>Unassigned | Type: {workspace.workspace_type} | Provider: {workspace.cloud_provider.toUpperCase()}</>
                          )}
                        </CardDescription>
                      </div>
                      {getStateBadge(workspace.state)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Workspace ID</p>
                        <p className="font-semibold">{workspace.workspace_id || 'Pending...'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Username</p>
                        <p className="font-semibold">{workspace.username}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="font-semibold">{formatDate(workspace.created_at)}</p>
                      </div>
                    </div>

                    {workspace.error_message && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm text-red-800">{workspace.error_message}</p>
                      </div>
                    )}

                    {/* Assign/Reassign Workspace Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {workspace.applicant_name ? 'Assigned To:' : 'Not Assigned'}
                          </p>
                          {workspace.applicant_name ? (
                            <p className="text-sm text-gray-600">
                              {workspace.applicant_name} - {workspace.job_title}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500">This workspace is not assigned to any applicant</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedWorkspace(workspace);
                            setAssignDialogOpen(true);
                          }}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {workspace.applicant_name ? 'Reassign' : 'Assign'}
                        </Button>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {workspace.state === 'STOPPED' && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              await startWorkspace(workspace.id);
                              toast.success('Workspace starting...');
                              setTimeout(() => fetchWorkspaces(), 2000);
                            } catch (error) {
                              toast.error('Failed to start workspace');
                            }
                          }}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}

                      {workspace.state === 'AVAILABLE' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await stopWorkspace(workspace.id);
                                toast.success('Workspace stopping...');
                                setTimeout(() => fetchWorkspaces(), 2000);
                              } catch (error) {
                                toast.error('Failed to stop workspace');
                              }
                            }}
                          >
                            <Square className="h-4 w-4 mr-2" />
                            Stop
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await restartWorkspace(workspace.id);
                                toast.success('Workspace rebooting...');
                                setTimeout(() => fetchWorkspaces(), 2000);
                              } catch (error) {
                                toast.error('Failed to restart workspace');
                              }
                            }}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Restart
                          </Button>
                        </>
                      )}

                      {workspace.state !== 'TERMINATED' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedItem(workspace);
                            setDeleteType('workspace');
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Terminate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Cloud Credentials Tab */}
        <TabsContent value="credentials" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={credDialogOpen} onOpenChange={setCredDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Cloud Credentials
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Add Cloud Credentials</span>
                    <RouterLink to="/cloud-credentials-guide" target="_blank">
                      <Button variant="ghost" size="sm" type="button">
                        <HelpCircle className="h-4 w-4 mr-1" />
                        Setup Guide
                      </Button>
                    </RouterLink>
                  </DialogTitle>
                  <DialogDescription>
                    Add your AWS or Azure credentials for VDI provisioning
                  </DialogDescription>
                </DialogHeader>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Need help getting these credentials?</p>
                      <p className="mb-2">Click the "Setup Guide" button above for detailed step-by-step instructions.</p>
                      <p className="text-xs">🔒 Your credentials are encrypted before storage and never shared.</p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleCreateCredential} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="credential_name">Credential Name *</Label>
                    <Input
                      id="credential_name"
                      value={credForm.credential_name}
                      onChange={(e) => setCredForm({ ...credForm, credential_name: e.target.value })}
                      placeholder="e.g., My AWS Production"
                      required
                    />
                    <p className="text-xs text-gray-500">A friendly name to identify this credential</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cloud_provider">Cloud Provider *</Label>
                    <Select
                      value={credForm.cloud_provider}
                      onValueChange={(value) => setCredForm({ ...credForm, cloud_provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws">AWS WorkSpaces</SelectItem>
                        <SelectItem value="azure">Azure Virtual Desktop</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Choose your preferred cloud platform for VDI provisioning
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="access_key_plain" className="flex items-center">
                        {credForm.cloud_provider === 'aws' ? 'Access Key ID' : 'Client ID'} *
                      </Label>
                      <Input
                        id="access_key_plain"
                        type="password"
                        value={credForm.access_key_plain}
                        onChange={(e) => setCredForm({ ...credForm, access_key_plain: e.target.value })}
                        placeholder={credForm.cloud_provider === 'aws' ? 'AKIA...' : 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'}
                        required
                      />
                      <p className="text-xs text-gray-500">
                        {credForm.cloud_provider === 'aws' 
                          ? 'From IAM user → Security credentials' 
                          : 'From App Registration → Overview'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secret_key_plain">
                        {credForm.cloud_provider === 'aws' ? 'Secret Access Key' : 'Client Secret'} *
                      </Label>
                      <Input
                        id="secret_key_plain"
                        type="password"
                        value={credForm.secret_key_plain}
                        onChange={(e) => setCredForm({ ...credForm, secret_key_plain: e.target.value })}
                        placeholder="••••••••••••••••••••"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        {credForm.cloud_provider === 'aws'
                          ? 'Shown only once when creating IAM user'
                          : 'From App Registration → Certificates & secrets'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">{credForm.cloud_provider === 'aws' ? 'AWS Region' : 'Azure Location'} *</Label>
                    {credForm.cloud_provider === 'aws' ? (
                      <Select
                        value={credForm.region}
                        onValueChange={(value) => setCredForm({ ...credForm, region: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select AWS region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="us-east-1">US East (N. Virginia) - us-east-1</SelectItem>
                          <SelectItem value="us-west-2">US West (Oregon) - us-west-2</SelectItem>
                          <SelectItem value="eu-west-1">Europe (Ireland) - eu-west-1</SelectItem>
                          <SelectItem value="eu-central-1">Europe (Frankfurt) - eu-central-1</SelectItem>
                          <SelectItem value="ap-southeast-1">Asia Pacific (Singapore) - ap-southeast-1</SelectItem>
                          <SelectItem value="ap-southeast-2">Asia Pacific (Sydney) - ap-southeast-2</SelectItem>
                          <SelectItem value="ap-northeast-1">Asia Pacific (Tokyo) - ap-northeast-1</SelectItem>
                          <SelectItem value="ca-central-1">Canada (Central) - ca-central-1</SelectItem>
                          <SelectItem value="sa-east-1">South America (São Paulo) - sa-east-1</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select
                        value={credForm.region}
                        onValueChange={(value) => setCredForm({ ...credForm, region: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Azure location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eastus">East US</SelectItem>
                          <SelectItem value="eastus2">East US 2</SelectItem>
                          <SelectItem value="westus">West US</SelectItem>
                          <SelectItem value="westus2">West US 2</SelectItem>
                          <SelectItem value="centralus">Central US</SelectItem>
                          <SelectItem value="northeurope">North Europe</SelectItem>
                          <SelectItem value="westeurope">West Europe</SelectItem>
                          <SelectItem value="southeastasia">Southeast Asia</SelectItem>
                          <SelectItem value="australiaeast">Australia East</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <p className="text-xs text-gray-500">
                      {credForm.cloud_provider === 'aws'
                        ? 'AWS region where WorkSpaces service is enabled'
                        : 'Azure location for your resource group'}
                    </p>
                  </div>

                  {credForm.cloud_provider === 'aws' && (
                    <div className="space-y-2">
                      <Label htmlFor="directory_id">Directory ID *</Label>
                      <Input
                        id="directory_id"
                        value={credForm.directory_id}
                        onChange={(e) => setCredForm({ ...credForm, directory_id: e.target.value })}
                        placeholder="e.g., d-xxxxxxxxx"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        From AWS Directory Service → Your directory → Directory ID
                        <a href="https://console.aws.amazon.com/directoryservicev2/" target="_blank" rel="noopener noreferrer" className="text-primary ml-1">
                          (Open Directory Service <ExternalLink className="h-3 w-3 inline" />)
                        </a>
                      </p>
                    </div>
                  )}

                  {credForm.cloud_provider === 'azure' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="tenant_id">Tenant ID *</Label>
                        <Input
                          id="tenant_id"
                          value={credForm.tenant_id}
                          onChange={(e) => setCredForm({ ...credForm, tenant_id: e.target.value })}
                          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          required
                        />
                        <p className="text-xs text-gray-500">
                          From Azure Active Directory → Overview → Tenant ID
                          <a href="https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/Overview" target="_blank" rel="noopener noreferrer" className="text-primary ml-1">
                            (Open Azure AD <ExternalLink className="h-3 w-3 inline" />)
                          </a>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subscription_id">Subscription ID *</Label>
                        <Input
                          id="subscription_id"
                          value={credForm.subscription_id}
                          onChange={(e) => setCredForm({ ...credForm, subscription_id: e.target.value })}
                          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          required
                        />
                        <p className="text-xs text-gray-500">
                          From Azure Portal → Subscriptions → Copy Subscription ID
                          <a href="https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBlade" target="_blank" rel="noopener noreferrer" className="text-primary ml-1">
                            (Open Subscriptions <ExternalLink className="h-3 w-3 inline" />)
                          </a>
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="resource_group">Resource Group *</Label>
                        <Input
                          id="resource_group"
                          value={credForm.resource_group}
                          onChange={(e) => setCredForm({ ...credForm, resource_group: e.target.value })}
                          placeholder="e.g., bugbear-vdi-rg"
                          required
                        />
                        <p className="text-xs text-gray-500">
                          The resource group containing your Virtual Desktop resources
                        </p>
                      </div>
                    </>
                  )}

                  <div className="bg-gray-50 border rounded p-3 text-xs text-gray-700">
                    <p className="font-semibold mb-1">Quick Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Click "Setup Guide" above for detailed instructions</li>
                      <li>AWS: You need an IAM user with WorkSpaces permissions</li>
                      <li>Azure: You need a Service Principal with VDI permissions</li>
                      <li>Use "Test Connection" after saving to verify credentials</li>
                      <li>Your credentials are encrypted and stored securely</li>
                    </ul>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setCredDialogOpen(false);
                      resetCredForm();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Credentials</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {workspaces.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Server className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No workspaces created</h3>
                <p className="text-gray-600 mb-4">
                  Create workspaces for approved applicants.
                </p>
                <Button onClick={() => setWsDialogOpen(true)}>
                  Create Workspace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workspaces.map((workspace) => (
                <Card key={workspace.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{workspace.applicant_name}</CardTitle>
                        <CardDescription>
                          {workspace.job_title} | {workspace.workspace_type} on {workspace.cloud_provider.toUpperCase()}
                        </CardDescription>
                      </div>
                      {getStateBadge(workspace.state)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Workspace ID</p>
                        <p className="font-semibold text-xs">{workspace.workspace_id || 'Pending'}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Username</p>
                        <p className="font-semibold">{workspace.username}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Credential</p>
                        <p className="font-semibold">{workspace.cloud_credential_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="font-semibold">{formatDate(workspace.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {workspace.state === 'STOPPED' && (
                        <Button size="sm" onClick={async () => {
                          try {
                            await startWorkspace(workspace.id);
                            toast.success('Starting workspace...');
                            setTimeout(() => fetchWorkspaces(), 2000);
                          } catch (error) {
                            toast.error('Failed to start workspace');
                          }
                        }}>
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}

                      {workspace.state === 'AVAILABLE' && (
                        <>
                          <Button size="sm" variant="outline" onClick={async () => {
                            try {
                              await stopWorkspace(workspace.id);
                              toast.success('Stopping workspace...');
                              setTimeout(() => fetchWorkspaces(), 2000);
                            } catch (error) {
                              toast.error('Failed to stop workspace');
                            }
                          }}>
                            <Square className="h-4 w-4 mr-2" />
                            Stop
                          </Button>

                          <Button size="sm" variant="outline" onClick={async () => {
                            try {
                              await restartWorkspace(workspace.id);
                              toast.success('Rebooting workspace...');
                              setTimeout(() => fetchWorkspaces(), 2000);
                            } catch (error) {
                              toast.error('Failed to restart workspace');
                            }
                          }}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Restart
                          </Button>
                        </>
                      )}

                      {workspace.state !== 'TERMINATED' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedItem(workspace);
                            setDeleteType('workspace');
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Terminate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Cloud Credentials Tab */}
        <TabsContent value="credentials" className="space-y-4">
          {cloudCredentials.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No cloud credentials added</h3>
                <p className="text-gray-600 mb-4">
                  Add your AWS or Azure credentials to start creating workspaces.
                </p>
                <Button onClick={() => setCredDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Credential
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cloudCredentials.map((cred) => (
                <Card key={cred.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{cred.credential_name}</CardTitle>
                        <CardDescription>
                          {cred.cloud_provider.toUpperCase()} | {cred.region}
                        </CardDescription>
                      </div>
                      <Badge variant={cred.is_active ? 'default' : 'secondary'}>
                        {cred.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Access Key</p>
                        <p className="font-mono text-xs">{cred.access_key_masked}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Secret Key</p>
                        <p className="font-mono text-xs">{cred.secret_key_masked}</p>
                      </div>
                      {cred.directory_id && (
                        <div>
                          <p className="text-gray-600">Directory ID</p>
                          <p className="font-semibold">{cred.directory_id}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600">Added</p>
                        <p className="font-semibold">{formatDate(cred.created_at)}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestCredential(cred.id)}
                      >
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Connection
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedItem(cred);
                          setDeleteType('credential');
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Assign/Reassign Workspace Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={(open) => {
        setAssignDialogOpen(open);
        if (!open) setSelectedWorkspace(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedWorkspace?.applicant_name ? 'Reassign Workspace' : 'Assign Workspace'}
            </DialogTitle>
            <DialogDescription>
              {selectedWorkspace?.applicant_name
                ? 'Select a different applicant to assign this workspace to, or unassign it'
                : 'Select an approved applicant to assign this workspace to'}
            </DialogDescription>
          </DialogHeader>
          {selectedWorkspace && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm font-semibold text-blue-900">Workspace Details:</p>
                <p className="text-sm text-blue-800">
                  {selectedWorkspace.workspace_id || 'Pending'} • {selectedWorkspace.workspace_type} • {selectedWorkspace.cloud_provider.toUpperCase()}
                </p>
                {selectedWorkspace.applicant_name && (
                  <p className="text-sm text-blue-700 mt-1">
                    Currently assigned to: <strong>{selectedWorkspace.applicant_name}</strong> ({selectedWorkspace.job_title})
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assign_application_id">Select Applicant</Label>
                <Select
                  value={selectedWorkspace.application?.id?.toString() || 'none'}
                  onValueChange={(value) => {
                    // Don't close immediately, wait for assignment to complete
                    handleAssignWorkspace(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select applicant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None - Unassign</SelectItem>
                    {approvedApplicants.map((app) => {
                      const isCurrent = selectedWorkspace.applicant_name === app.applicant.email;
                      return (
                        <SelectItem key={app.id} value={app.id.toString()}>
                          {app.applicant.email} - {app.job.title}
                          {isCurrent && ' (Current)'}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {approvedApplicants.length === 0 && (
                  <p className="text-xs text-gray-500">No approved applicants available</p>
                )}
                <p className="text-xs text-gray-500">
                  {selectedWorkspace.applicant_name
                    ? 'You can reassign this workspace to a different applicant. The previous assignment will be removed.'
                    : 'You can assign this workspace to an approved applicant now or later.'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAssignDialogOpen(false);
              setSelectedWorkspace(null);
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteType === 'workspace' ? 'Terminate Workspace?' : 'Delete Credential?'}
            </DialogTitle>
            <DialogDescription>
              {deleteType === 'workspace'
                ? 'This will permanently terminate the workspace. The user will lose access.'
                : 'This will delete the cloud credential. Make sure no workspaces are using it.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deleteType === 'workspace' ? handleDeleteWorkspace : handleDeleteCredential}
            >
              Yes, {deleteType === 'workspace' ? 'Terminate' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
