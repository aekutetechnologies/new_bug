import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ExternalLink, Copy } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function CloudCredentialsGuide() {
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cloud Credentials Setup Guide</h1>
          <p className="text-gray-600">
            Step-by-step instructions for obtaining AWS WorkSpaces and Azure Virtual Desktop credentials
          </p>
        </div>

        <Tabs defaultValue="aws" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="aws">AWS WorkSpaces</TabsTrigger>
            <TabsTrigger value="azure">Azure Virtual Desktop</TabsTrigger>
          </TabsList>

          {/* AWS Tab */}
          <TabsContent value="aws" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AWS WorkSpaces Setup</CardTitle>
                <CardDescription>
                  Follow these steps to get your AWS credentials and set up WorkSpaces
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 1: Create AWS Account</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    If you don't have an AWS account, create one at:
                  </p>
                  <a
                    href="https://aws.amazon.com/console/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center text-sm"
                  >
                    https://aws.amazon.com/console/
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>

                {/* Step 2 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 2: Enable AWS WorkSpaces</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Log in to AWS Console</li>
                    <li>Navigate to <strong>WorkSpaces</strong> service</li>
                    <li>Select your preferred region (e.g., us-east-1)</li>
                    <li>Click "Get Started" if it's your first time</li>
                  </ol>
                </div>

                {/* Step 3 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 3: Set Up Directory Service</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    WorkSpaces requires an AWS Directory Service:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Go to <strong>AWS Directory Service</strong></li>
                    <li>Click "Set up directory"</li>
                    <li>Choose "Simple AD" (easiest option)</li>
                    <li>Complete the setup wizard</li>
                    <li>Note your <strong>Directory ID</strong> (e.g., d-xxxxxxxxx)</li>
                  </ol>
                </div>

                {/* Step 4 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 4: Create IAM User for API Access</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Go to <strong>IAM</strong> (Identity and Access Management)</li>
                    <li>Click "Users" → "Add users"</li>
                    <li>Enter username (e.g., workspaces-api-user)</li>
                    <li>Select "Access key - Programmatic access"</li>
                    <li>Click "Next: Permissions"</li>
                  </ol>
                </div>

                {/* Step 5 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 5: Attach WorkSpaces Permissions</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Attach this policy to the IAM user:
                  </p>
                  <div className="bg-gray-50 p-4 rounded border relative">
                    <pre className="text-xs overflow-x-auto">
{`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "workspaces:*",
        "ds:DescribeDirectories",
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets"
      ],
      "Resource": "*"
    }
  ]
}`}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(JSON.stringify({
                        Version: "2012-10-17",
                        Statement: [{
                          Effect: "Allow",
                          Action: ["workspaces:*", "ds:DescribeDirectories", "ec2:DescribeVpcs", "ec2:DescribeSubnets"],
                          Resource: "*"
                        }]
                      }, null, 2))}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Step 6 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 6: Get Access Keys</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Complete the user creation</li>
                    <li>On the final screen, you'll see:
                      <ul className="list-disc list-inside ml-6 mt-1">
                        <li><strong>Access key ID</strong> (e.g., AKIAIOSFODNN7EXAMPLE)</li>
                        <li><strong>Secret access key</strong> (only shown once!)</li>
                      </ul>
                    </li>
                    <li><strong className="text-red-600">Download the CSV or copy both values immediately!</strong></li>
                  </ol>
                </div>

                {/* Step 7 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 7: Get WorkSpace Bundles</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    To find available bundle IDs:
                  </p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <code className="text-xs">
                      aws workspaces describe-workspace-bundles --region us-east-1
                    </code>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Common bundle IDs: wsb-clj85qzj1 (Ubuntu), wsb-2bs6k5lgn (Windows)
                  </p>
                </div>

                {/* Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="font-semibold mb-2">Information You Need:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✅ <strong>Credential Name:</strong> Any friendly name (e.g., "My AWS Production")</li>
                    <li>✅ <strong>Access Key ID:</strong> From IAM user (Step 6)</li>
                    <li>✅ <strong>Secret Access Key:</strong> From IAM user (Step 6)</li>
                    <li>✅ <strong>Region:</strong> Where you set up WorkSpaces (e.g., us-east-1)</li>
                    <li>✅ <strong>Directory ID:</strong> From Directory Service (Step 3)</li>
                  </ul>
                </div>

                {/* External Resources */}
                <div>
                  <h4 className="font-semibold mb-2">Helpful Links:</h4>
                  <div className="space-y-2">
                    <a
                      href="https://docs.aws.amazon.com/workspaces/latest/adminguide/getting-started.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center text-sm"
                    >
                      AWS WorkSpaces Getting Started Guide
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    <a
                      href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center text-sm"
                    >
                      Creating IAM Users
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    <a
                      href="https://docs.aws.amazon.com/directoryservice/latest/admin-guide/what_is.html"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center text-sm"
                    >
                      AWS Directory Service Documentation
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Azure Tab */}
          <TabsContent value="azure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Azure Virtual Desktop Setup</CardTitle>
                <CardDescription>
                  Follow these steps to get your Azure credentials and set up Virtual Desktop
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 1: Create Azure Account</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    If you don't have an Azure account:
                  </p>
                  <a
                    href="https://portal.azure.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center text-sm"
                  >
                    https://portal.azure.com/
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>

                {/* Step 2 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 2: Create Resource Group</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Log in to Azure Portal</li>
                    <li>Click "Resource groups" → "Create"</li>
                    <li>Enter a name (e.g., "bugbear-vdi-rg")</li>
                    <li>Select region (e.g., "East US")</li>
                    <li>Click "Review + create"</li>
                  </ol>
                </div>

                {/* Step 3 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 3: Set Up Azure Virtual Desktop</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Search for "Azure Virtual Desktop" in portal</li>
                    <li>Create a host pool</li>
                    <li>Configure virtual machines</li>
                    <li>Set up user access</li>
                  </ol>
                </div>

                {/* Step 4 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 4: Create Service Principal (App Registration)</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Go to <strong>Azure Active Directory</strong></li>
                    <li>Click "App registrations" → "New registration"</li>
                    <li>Enter name (e.g., "Bugbear-VDI-API")</li>
                    <li>Click "Register"</li>
                    <li>Note the <strong>Application (client) ID</strong></li>
                    <li>Note the <strong>Directory (tenant) ID</strong></li>
                  </ol>
                </div>

                {/* Step 5 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 5: Create Client Secret</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>In your app registration, go to "Certificates & secrets"</li>
                    <li>Click "New client secret"</li>
                    <li>Add description and set expiration</li>
                    <li>Click "Add"</li>
                    <li><strong className="text-red-600">Copy the secret VALUE immediately</strong> (shown only once!)</li>
                  </ol>
                </div>

                {/* Step 6 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 6: Assign Permissions</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    Grant the service principal access to manage Virtual Desktops:
                  </p>
                  <div className="bg-gray-50 p-3 rounded border">
                    <code className="text-xs block mb-2">
                      az role assignment create \<br/>
                      &nbsp;&nbsp;--assignee &lt;client-id&gt; \<br/>
                      &nbsp;&nbsp;--role "Desktop Virtualization Contributor" \<br/>
                      &nbsp;&nbsp;--scope /subscriptions/&lt;subscription-id&gt;/resourceGroups/&lt;resource-group&gt;
                    </code>
                  </div>
                </div>

                {/* Step 7 */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Step 7: Get Subscription ID</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>In Azure Portal, click "Subscriptions"</li>
                    <li>Find your subscription</li>
                    <li>Copy the <strong>Subscription ID</strong></li>
                  </ol>
                </div>

                {/* Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="font-semibold mb-2">Information You Need:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✅ <strong>Credential Name:</strong> Any friendly name</li>
                    <li>✅ <strong>Client ID:</strong> From App Registration (Step 4)</li>
                    <li>✅ <strong>Client Secret:</strong> From Certificates & secrets (Step 5)</li>
                    <li>✅ <strong>Tenant ID:</strong> From App Registration (Step 4)</li>
                    <li>✅ <strong>Subscription ID:</strong> From Subscriptions (Step 7)</li>
                    <li>✅ <strong>Resource Group:</strong> From Step 2</li>
                    <li>✅ <strong>Location:</strong> Azure region (e.g., eastus)</li>
                  </ul>
                </div>

                {/* External Resources */}
                <div>
                  <h4 className="font-semibold mb-2">Helpful Links:</h4>
                  <div className="space-y-2">
                    <a
                      href="https://learn.microsoft.com/en-us/azure/virtual-desktop/getting-started"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center text-sm"
                    >
                      Azure Virtual Desktop Documentation
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    <a
                      href="https://learn.microsoft.com/en-us/azure/active-directory/develop/howto-create-service-principal-portal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center text-sm"
                    >
                      Create Service Principal
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                    <a
                      href="https://learn.microsoft.com/en-us/cli/azure/role/assignment"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center text-sm"
                    >
                      Azure Role Assignments
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Reference Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Quick Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">AWS WorkSpaces Fields:</h4>
                <ul className="space-y-1 text-sm">
                  <li><strong>Access Key ID:</strong> 20 characters (AKIA...)</li>
                  <li><strong>Secret Access Key:</strong> 40 characters</li>
                  <li><strong>Region:</strong> us-east-1, us-west-2, etc.</li>
                  <li><strong>Directory ID:</strong> d-xxxxxxxxx format</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Azure Virtual Desktop Fields:</h4>
                <ul className="space-y-1 text-sm">
                  <li><strong>Client ID:</strong> GUID format</li>
                  <li><strong>Client Secret:</strong> Generated value</li>
                  <li><strong>Tenant ID:</strong> GUID format</li>
                  <li><strong>Subscription ID:</strong> GUID format</li>
                  <li><strong>Resource Group:</strong> Your RG name</li>
                  <li><strong>Location:</strong> eastus, westus, etc.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Note */}
        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">🔒 Security Note</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li>✅ Your credentials are <strong>encrypted</strong> before being stored in our database</li>
              <li>✅ Secret keys are never displayed after initial entry</li>
              <li>✅ Only you can access your cloud credentials</li>
              <li>✅ Use the "Test Connection" button to verify credentials before saving</li>
              <li>⚠️ Never share your access keys or secret keys with anyone</li>
              <li>⚠️ Rotate keys periodically for security</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


