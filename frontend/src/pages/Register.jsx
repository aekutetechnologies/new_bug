import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  const [step, setStep] = useState(1); // 1: form, 2: verification
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirm: '',
    user_type: '',
    first_name: '',
    last_name: '',
    company_name: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUserTypeChange = (value) => {
    setFormData({
      ...formData,
      user_type: value,
    });
  };

  const handleSendCode = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.user_type) {
      toast.error('Please select a user type');
      return;
    }

    if (['org_seeker', 'org_provider'].includes(formData.user_type) && !formData.company_name) {
      toast.error('Company name is required for organizations');
      return;
    }

    if (!formData.email) {
      toast.error('Email is required');
      return;
    }

    try {
      setSendingCode(true);
      await authService.sendVerificationCode(formData.email, 'signup');
      toast.success('Verification code sent to your email!');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.email?.[0] || 'Failed to send verification code');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      await register({ ...formData, verification_code: verificationCode });
      toast.success('Registration successful!');
      navigate('/jobs');
    } catch (err) {
      const errorMsg = err.response?.data?.verification_code?.[0] || error || 'Registration failed';
      toast.error(errorMsg);
    }
  };

  const handleResendCode = async () => {
    try {
      setSendingCode(true);
      await authService.sendVerificationCode(formData.email, 'signup');
      toast.success('Verification code resent!');
    } catch (err) {
      toast.error('Failed to resend verification code');
    } finally {
      setSendingCode(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
              Join Bugbear to find your next opportunity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user_type">I am a *</Label>
                <Select value={formData.user_type} onValueChange={handleUserTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Job Seeker</SelectItem>
                    <SelectItem value="org_seeker">Organization Job Seeker</SelectItem>
                    <SelectItem value="org_provider">Organization Job Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {['org_seeker', 'org_provider'].includes(formData.user_type) && (
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
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
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirm">Confirm Password *</Label>
                <Input
                  id="password_confirm"
                  name="password_confirm"
                  type="password"
                  value={formData.password_confirm}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && (
                <div className="text-red-500 text-sm">
                  {typeof error === 'string' ? error : JSON.stringify(error)}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={sendingCode}>
                {sendingCode ? 'Sending code...' : 'Send Verification Code'}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600">
                    We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verification_code">Verification Code</Label>
                  <Input
                    id="verification_code"
                    name="verification_code"
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="text-center text-2xl tracking-widest"
                    required
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendCode}
                  disabled={sendingCode}
                >
                  {sendingCode ? 'Sending...' : 'Resend Code'}
                </Button>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating account...' : 'Verify & Create Account'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

