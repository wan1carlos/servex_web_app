'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User as UserIcon, Phone, Eye, EyeOff, Send } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '09',
    password: '',
    otp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    // If already logged in, send to home dashboard
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, router]);

  const validateGmail = (email: string) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateGmail(formData.email)) {
      toast.error('Please use a valid Gmail address');
      return;
    }

    console.log('Sending OTP for email:', formData.email);
    setOtpLoading(true);
    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      console.log('OTP send response status:', response.status);
      const data = await response.json();
      console.log('OTP send response data:', data);

      if (data.success) {
        toast.success(`OTP sent to your Gmail! Check your inbox.`);
        setOtpSent(true);
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      toast.error('Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!validateGmail(formData.email)) {
      toast.error('Please use a valid Gmail address');
      return;
    }

    if (!otpSent) {
      toast.error('Please send OTP first');
      return;
    }

    if (!formData.otp) {
      toast.error('Please enter the OTP');
      return;
    }

    // Validate Philippine mobile number
    if (!formData.phone.startsWith('09')) {
      toast.error('Mobile number must start with 09');
      return;
    }

    if (formData.phone.length !== 11) {
      toast.error('Mobile number must be exactly 11 digits');
      return;
    }

    if (!/^\d+$/.test(formData.phone)) {
      toast.error('Mobile number must contain only digits');
      return;
    }

    setLoading(true);

    // First verify OTP
    try {
      console.log('Verifying OTP before signup...');
      const otpResponse = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });

      const otpData = await otpResponse.json();
      console.log('OTP verification response:', otpData);

      if (!otpData.success) {
        toast.error(otpData.error || 'Invalid OTP');
        setLoading(false);
        return;
      }

      toast.success('OTP verified! Creating your account...');
    } catch (otpError) {
      console.error('OTP verification error:', otpError);
      toast.error('Failed to verify OTP');
      setLoading(false);
      return;
    }

    // OTP verified, now proceed with signup
    const signupData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    };
    const result = await signup(signupData);
    setLoading(false);

    if (result.success) {
      toast.success('Account created successfully!');
      // Always go to home dashboard to browse stores
      router.replace('/home');
    } else {
      toast.error(result.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
          <p className="text-gray-600 text-center mb-8">Join ServEx today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gmail Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="yourname@gmail.com"
                    disabled={otpSent}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={otpLoading || !formData.email || otpSent}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {otpLoading ? 'Sending...' : otpSent ? 'Sent' : 'Send OTP'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Only Gmail addresses are accepted. OTP will be sent to verify your email.
              </p>
            </div>

            {otpSent && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP Code
                </label>
                <input
                  type="text"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                />
              <p className="text-xs text-gray-500 mt-1">
                Check your Gmail inbox and spam folder for the verification code. The code expires in 5 minutes.
              </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    // Ensure it always starts with 09 and limit to 11 digits
                    if (value.startsWith('09') && value.length <= 11) {
                      setFormData({ ...formData, phone: value });
                    } else if (value.length < 2) {
                      setFormData({ ...formData, phone: '09' });
                    }
                  }}
                  onKeyDown={(e) => {
                    // Prevent deletion if cursor is at position 0 or 1 (the "09" part)
                    const input = e.target as HTMLInputElement;
                    if ((e.key === 'Backspace' || e.key === 'Delete') && input.selectionStart !== null && input.selectionStart <= 2) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="09XX XXX XXXX"
                  maxLength={11}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Must start with 09 and be 11 digits</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-pink-600 font-semibold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
