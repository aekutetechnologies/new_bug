import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: code, 3: new password
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    code: '',
    new_password: '',
    new_password_confirm: '',
  });
  const [sendingCode, setSendingCode] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/jobs');
    } catch (err) {
      toast.error(error || 'Login failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your Bugbear Jobs account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* <div className="text-center">
                <Button variant="outline" className="w-full" type="button">
                  Sign in with Google
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  (Google SSO - requires setup)
                </p>
              </div> */}

              <div className="text-center text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Forgot Password Dialog */}
        <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                {forgotPasswordStep === 1 && 'Enter your email to receive a verification code'}
                {forgotPasswordStep === 2 && 'Enter the verification code sent to your email'}
                {forgotPasswordStep === 3 && 'Enter your new password'}
              </DialogDescription>
            </DialogHeader>

            {forgotPasswordStep === 1 && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    setSendingCode(true);
                    await authService.forgotPassword(forgotPasswordData.email);
                    toast.success('Verification code sent to your email!');
                    setForgotPasswordStep(2);
                  } catch (err) {
                    toast.error('Failed to send verification code');
                  } finally {
                    setSendingCode(false);
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="forgot_email">Email</Label>
                  <Input
                    id="forgot_email"
                    type="email"
                    value={forgotPasswordData.email}
                    onChange={(e) =>
                      setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })
                    }
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setForgotPasswordOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={sendingCode}>
                    {sendingCode ? 'Sending...' : 'Send Code'}
                  </Button>
                </DialogFooter>
              </form>
            )}

            {forgotPasswordStep === 2 && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setForgotPasswordStep(3);
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="forgot_code">Verification Code</Label>
                  <Input
                    id="forgot_code"
                    type="text"
                    maxLength={6}
                    value={forgotPasswordData.code}
                    onChange={(e) =>
                      setForgotPasswordData({
                        ...forgotPasswordData,
                        code: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      try {
                        setSendingCode(true);
                        await authService.forgotPassword(forgotPasswordData.email);
                        toast.success('Code resent!');
                      } catch (err) {
                        toast.error('Failed to resend code');
                      } finally {
                        setSendingCode(false);
                      }
                    }}
                    disabled={sendingCode}
                  >
                    Resend Code
                  </Button>
                  <Button type="submit">Verify</Button>
                </DialogFooter>
              </form>
            )}

            {forgotPasswordStep === 3 && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (forgotPasswordData.new_password !== forgotPasswordData.new_password_confirm) {
                    toast.error('Passwords do not match');
                    return;
                  }
                  try {
                    await authService.resetPassword(
                      forgotPasswordData.email,
                      forgotPasswordData.code,
                      forgotPasswordData.new_password,
                      forgotPasswordData.new_password_confirm
                    );
                    toast.success('Password reset successfully!');
                    setForgotPasswordOpen(false);
                    setForgotPasswordStep(1);
                    setForgotPasswordData({
                      email: '',
                      code: '',
                      new_password: '',
                      new_password_confirm: '',
                    });
                  } catch (err) {
                    toast.error(err.response?.data?.code?.[0] || 'Failed to reset password');
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={forgotPasswordData.new_password}
                    onChange={(e) =>
                      setForgotPasswordData({
                        ...forgotPasswordData,
                        new_password: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_password_confirm">Confirm New Password</Label>
                  <Input
                    id="new_password_confirm"
                    type="password"
                    value={forgotPasswordData.new_password_confirm}
                    onChange={(e) =>
                      setForgotPasswordData({
                        ...forgotPasswordData,
                        new_password_confirm: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForgotPasswordStep(2)}
                  >
                    Back
                  </Button>
                  <Button type="submit">Reset Password</Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

