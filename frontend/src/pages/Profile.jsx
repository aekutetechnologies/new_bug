import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { User, Lock, Settings, Trash2 } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    website: '',
    company_name: '',
    skills: [],
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    new_password_confirm: '',
    verification_code: '',
  });
  const [passwordStep, setPasswordStep] = useState(1); // 1: form, 2: verification
  const [sendingPasswordCode, setSendingPasswordCode] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
      setProfileForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        company_name: data.company_name || '',
        skills: data.skills || [],
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updated = await userService.partialUpdateProfile(profileForm);
      setProfile(updated);
      updateUser(updated);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordCode = async (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.new_password_confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (!passwordForm.old_password) {
      toast.error('Please enter your current password');
      return;
    }

    try {
      setSendingPasswordCode(true);
      await userService.sendVerificationCode(profile?.email || user?.email);
      toast.success('Verification code sent to your email!');
      setPasswordStep(2);
    } catch (error) {
      toast.error('Failed to send verification code');
    } finally {
      setSendingPasswordCode(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordForm.verification_code) {
      toast.error('Please enter the verification code');
      return;
    }

    setLoading(true);

    try {
      await userService.changePassword(passwordForm);
      toast.success('Password changed successfully!');
      setPasswordForm({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
        verification_code: '',
      });
      setPasswordStep(1);
    } catch (error) {
      const errorMsg =
        error.response?.data?.verification_code?.[0] ||
        error.response?.data?.old_password?.[0] ||
        'Failed to change password';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);

    try {
      const response = await userService.uploadAvatar(formData);
      toast.success('Avatar uploaded successfully!');
      loadProfile();
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);

    try {
      await userService.deleteAccount();
      toast.success('Account deleted successfully');
      logout();
      navigate('/');
    } catch (error) {
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">
              <User className="h-4 w-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>

                  {user?.user_type !== 'individual' && (
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <Input
                        id="company_name"
                        value={profileForm.company_name}
                        onChange={(e) => setProfileForm({ ...profileForm, company_name: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                      placeholder="City, State/Country"
                    />
                  </div>

                  {user?.user_type === 'org_provider' && (
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={profileForm.website}
                        onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatar">Profile Picture</Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Updating...' : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                {passwordStep === 1 ? (
                  <form onSubmit={handleSendPasswordCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="old_password">Current Password</Label>
                      <Input
                        id="old_password"
                        type="password"
                        value={passwordForm.old_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_password_confirm">Confirm New Password</Label>
                      <Input
                        id="new_password_confirm"
                        type="password"
                        value={passwordForm.new_password_confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirm: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" disabled={sendingPasswordCode}>
                      {sendingPasswordCode ? 'Sending Code...' : 'Send Verification Code'}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600">
                        We've sent a 6-digit verification code to <strong>{profile?.email || user?.email}</strong>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="verification_code">Verification Code</Label>
                      <Input
                        id="verification_code"
                        type="text"
                        maxLength={6}
                        value={passwordForm.verification_code}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            verification_code: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        placeholder="000000"
                        className="text-center text-2xl tracking-widest"
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={async () => {
                          try {
                            setSendingPasswordCode(true);
                            await userService.sendVerificationCode(profile?.email || user?.email);
                            toast.success('Code resent!');
                          } catch (error) {
                            toast.error('Failed to resend code');
                          } finally {
                            setSendingPasswordCode(false);
                          }
                        }}
                        disabled={sendingPasswordCode}
                      >
                        Resend Code
                      </Button>
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? 'Changing Password...' : 'Change Password'}
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setPasswordStep(1)}
                    >
                      Back
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Account Type</h3>
                  <Badge>{user?.user_type}</Badge>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>

                  <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove your data from our servers.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading}>
                          {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
