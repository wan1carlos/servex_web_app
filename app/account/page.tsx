'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, MapPin, Home, LogOut, Save, User as UserIcon, Phone, Mail, MessageSquare, Settings } from 'lucide-react';
import servexApi from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function AccountPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [appText, setAppText] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'overview' | 'edit'>('overview');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    whatsapp_no: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userId = localStorage.getItem('user_id');
    
    if (!userId || userId === 'null' || userId === 'undefined') {
      toast.error('Please login to access this page.');
      router.push('/login');
      return;
    }

    loadData();
  };

  const loadData = async () => {
    try {
      const userStr = localStorage.getItem('user_data');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserData(user);
        setFormData({
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || '',
          whatsapp_no: user.whatsapp_no || ''
        });
      }

      const text = localStorage.getItem('app_text');
      if (text) {
        setAppText(JSON.parse(text));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      toast.success('Logged out successfully');
      router.push('/home');
      setTimeout(() => window.location.reload(), 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');

      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('phone', formData.phone);
      formDataObj.append('email', formData.email);
      formDataObj.append('whatsapp_no', formData.whatsapp_no);

      const response = await servexApi.updateInfo(userId as string, formDataObj);

      if (response.msg === 'done') {
        toast.success('Profile updated successfully!');
        const existing = JSON.parse(localStorage.getItem('user_data') || '{}');
        const updated = { ...existing, ...formData };
        localStorage.setItem('user_data', JSON.stringify(updated));
        setUserData(updated);
        setView('overview');
      } else {
        toast.error(response.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600">
      {/* Header */}
      <div className="bg-transparent text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Account Header */}
      <div className="px-4 pb-8 text-white">
        <div className="max-w-7xl mx-auto">
          <p className="text-white/80 mb-1">Welcome</p>
          <h1 className="text-4xl font-bold mb-4">{userData?.name || 'User'}</h1>
          
          {/* User Info Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white/60 text-xs">Email</p>
                  <p className="text-white font-medium">{userData?.email || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white/60 text-xs">Phone</p>
                  <p className="text-white font-medium">{userData?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="bg-white rounded-t-[2rem] px-4 pt-6 pb-20 min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          {view === 'overview' ? (
                        <>
                          <h3 className="text-lg font-semibold text-gray-600 mb-4">
                            {appText.account_title || 'My Account'}
                          </h3>
                          <div className="space-y-2">
                            {/* My Orders */}
                            <button
                              onClick={() => router.push('/orders')}
                              className="w-full flex items-center gap-4 p-4 bg-white hover:bg-gray-50 rounded-xl shadow-sm transition"
                            >
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-green-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">
                                {appText.my || 'My Orders'}
                              </span>
                              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                            </button>

                            {/* Change Location */}
                            <button
                              onClick={() => router.push('/location')}
                              className="w-full flex items-center gap-4 p-4 bg-white hover:bg-gray-50 rounded-xl shadow-sm transition"
                            >
                              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-orange-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">
                                {appText.change_location || 'Change Location'}
                              </span>
                              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                            </button>

                            {/* Back to Home */}
                            <button
                              onClick={() => router.push('/home')}
                              className="w-full flex items-center gap-4 p-4 bg-white hover:bg-gray-50 rounded-xl shadow-sm transition"
                            >
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Home className="w-5 h-5 text-pink-600" />
                              </div>
                              <span className="flex-1 text-left font-medium">
                                {appText.back_home || 'Back to Home'}
                              </span>
                              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                            </button>

                            {/* Logout */}
                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-4 p-4 bg-white hover:bg-red-50 rounded-xl shadow-sm transition"
                            >
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-red-600" />
                              </div>
                              <span className="flex-1 text-left font-medium text-red-600">
                                {appText.logout || 'Logout'}
                              </span>
                              <ArrowLeft className="w-5 h-5 text-red-400 rotate-180" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-600">Edit Profile</h3>
                            <button onClick={() => setView('overview')} className="text-sm text-pink-600 font-medium">Back</button>
                          </div>
                          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                            {/* Name */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                  <UserIcon className="w-4 h-4" />
                                  Name <span className="text-red-500">*</span>
                                </div>
                              </label>
                              <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="Enter your name"
                                required
                              />
                            </div>

                            {/* Phone */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4" />
                                  Phone <span className="text-red-500">*</span>
                                </div>
                              </label>
                              <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="Enter your phone number"
                                required
                              />
                            </div>

                            {/* Email */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4" />
                                  Email <span className="text-red-500">*</span>
                                </div>
                              </label>
                              <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="Enter your email"
                                required
                              />
                            </div>

                            {/* WhatsApp */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                  <MessageSquare className="w-4 h-4" />
                                  WhatsApp Number (Optional)
                                </div>
                              </label>
                              <input
                                type="tel"
                                value={formData.whatsapp_no}
                                onChange={(e) => setFormData({ ...formData, whatsapp_no: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="Enter your WhatsApp number"
                              />
                            </div>

                            {/* Submit Button */}
                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <Save className="w-5 h-5" />
                              {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                          </form>
                        </>
                      )}
        </div>
      </div>
    </div>
  );
}
