import { useEffect, useState } from 'react';
import { workspaceService } from '../../services/workspaceService';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { Server, Copy, Download, ExternalLink, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export default function SeekerWorkspace() {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState({});

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await workspaceService.getSeekerWorkspaces();
      setWorkspaces(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const getConnectionDetails = async (workspaceId) => {
    try {
      const connection = await workspaceService.getWorkspaceConnection(workspaceId);
      return connection;
    } catch (error) {
      toast.error('Failed to get connection details');
      return null;
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
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

    return (
      <Badge className={colors[state] || 'bg-gray-100 text-gray-800'}>
        {state}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Workspaces</h1>
          <p className="text-gray-600">Access your assigned VDI workspaces</p>
        </div>
        <Button onClick={loadWorkspaces} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Server className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No workspaces assigned yet</h3>
            <p className="text-gray-600 mb-4">
              Workspaces will appear here once your job applications are approved and a workspace is assigned.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {workspaces.map((workspace) => (
            <Card key={workspace.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{workspace.job_title || 'Workspace'}</CardTitle>
                    <CardDescription className="mt-1">
                      Workspace for {workspace.job_title}
                    </CardDescription>
                  </div>
                  {getStateBadge(workspace.state)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Workspace Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Workspace Type</p>
                    <p className="font-semibold capitalize">{workspace.workspace_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cloud Provider</p>
                    <p className="font-semibold uppercase">{workspace.cloud_provider}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Workspace ID</p>
                    <p className="font-semibold font-mono text-xs">{workspace.workspace_id || 'Pending...'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-semibold">{formatDate(workspace.created_at)}</p>
                  </div>
                </div>

                {/* Connection Details */}
                {(workspace.state === 'AVAILABLE' || workspace.registration_code || workspace.password) && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Server className="h-4 w-4 mr-2" />
                      Connection Details
                    </h4>
                    
                    <div className="space-y-3">
                      {/* Registration Code */}
                      {workspace.registration_code && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Registration Code</p>
                          <div className="flex items-center space-x-2 bg-white p-3 rounded border">
                            <code className="text-sm font-mono flex-1">{workspace.registration_code}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(workspace.registration_code, 'Registration code')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Username */}
                      {workspace.username && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Username</p>
                          <div className="flex items-center space-x-2 bg-white p-3 rounded border">
                            <code className="text-sm font-mono flex-1">{workspace.username}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(workspace.username, 'Username')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Password */}
                      {workspace.password && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Password</p>
                          <div className="flex items-center space-x-2 bg-white p-3 rounded border">
                            <code className="text-sm font-mono flex-1">
                              {passwordVisible[workspace.id] ? workspace.password : '••••••••'}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setPasswordVisible(prev => ({
                                  ...prev,
                                  [workspace.id]: !prev[workspace.id]
                                }));
                              }}
                              title={passwordVisible[workspace.id] ? 'Hide password' : 'Show password'}
                            >
                              {passwordVisible[workspace.id] ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(workspace.password, 'Password')}
                              title="Copy password"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Connection String */}
                      {workspace.connection_string && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Connection String</p>
                          <div className="flex items-center space-x-2 bg-white p-3 rounded border">
                            <code className="text-sm font-mono flex-1 overflow-x-auto break-all">
                              {workspace.connection_string}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(workspace.connection_string, 'Connection string')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Download Client Button */}
                      <div className="flex space-x-2 mt-4">
                        {workspace.cloud_provider === 'aws' && (
                          <Button 
                            size="sm"
                            onClick={() => window.open('https://clients.amazonworkspaces.com/', '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download WorkSpaces Client
                          </Button>
                        )}
                        {workspace.cloud_provider === 'azure' && (
                          <Button 
                            size="sm"
                            onClick={() => window.open('https://aka.ms/avdclient', '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Download Azure Virtual Desktop Client
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {(workspace.state === 'AVAILABLE' || workspace.registration_code || workspace.password) && (
                  <div className="bg-gray-50 rounded p-4">
                    <h4 className="font-semibold mb-2">How to Connect:</h4>
                    {workspace.cloud_provider === 'aws' ? (
                      <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                        <li>Download and install AWS WorkSpaces client from the link above</li>
                        {workspace.registration_code && (
                          <li>Copy the registration code from the connection details above</li>
                        )}
                        {workspace.connection_string && (
                          <li>Copy the connection string from the connection details above</li>
                        )}
                        <li>Open WorkSpaces client and enter the registration code or connection string</li>
                        {workspace.username && (
                          <li>Use your username: <strong>{workspace.username}</strong> (copied above)</li>
                        )}
                        {workspace.password && (
                          <li>Enter your password: <strong>{workspace.password}</strong> (copied above)</li>
                        )}
                      </ol>
                    ) : (
                      <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                        <li>Download and install Azure Virtual Desktop client from the link above</li>
                        {workspace.registration_code && (
                          <li>Copy the registration code from the connection details above</li>
                        )}
                        {workspace.connection_string && (
                          <li>Copy the connection string from the connection details above</li>
                        )}
                        {workspace.username && (
                          <li>Use your username: <strong>{workspace.username}</strong> (copied above)</li>
                        )}
                        {workspace.password && (
                          <li>Enter your password: <strong>{workspace.password}</strong> (copied above)</li>
                        )}
                      </ol>
                    )}
                  </div>
                )}

                {workspace.state === 'PENDING' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <p className="text-sm text-yellow-800">
                      ⏳ Workspace is being provisioned. This may take 5-10 minutes.
                      Please refresh this page periodically to check the status.
                    </p>
                  </div>
                )}

                {workspace.state === 'STOPPED' && (
                  <div className="bg-gray-50 border border-gray-200 rounded p-4">
                    <p className="text-sm text-gray-700">
                      This workspace is currently stopped. Contact your employer to start it.
                    </p>
                  </div>
                )}

                {workspace.error_message && (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-sm text-red-800">
                      <strong>Error:</strong> {workspace.error_message}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
