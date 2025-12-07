'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryAuth } from '@/lib/delivery-auth-store';
import servexDeliveryApi from '@/lib/delivery-api';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  name: string;
  phone: string;
  email: string;
  [key: string]: any;
}

interface OrderStats {
  total: number;
  delivered: number;
  [key: string]: any;
}

export default function DeliveryAccountPage() {
  const router = useRouter();
  const { userId, isAuthenticated, logout } = useDeliveryAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState<any>(null);
  const [action, setAction] = useState(0);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/delivery/login');
      return;
    }

    // Load language text
    const appText = localStorage.getItem('app_text');
    if (appText) {
      setText(JSON.parse(appText));
    }

    loadData();
  }, [isAuthenticated, router, userId]);

  const loadData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await servexDeliveryApi.userInfo(userId);

      if (response.data) {
        setUserData(response.data);
      }

      if (response.order) {
        setOrderStats(response.order);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load account information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !userId) {
      toast.error('Please enter a password');
      return;
    }

    try {
      setLoading(true);
      const updateData = {
        id: userId,
        password: password,
      };

      const response = await servexDeliveryApi.updateInfo(updateData);

      if (response.data) {
        setUserData(response.data);
        setPassword('');
        setAction(0);
        toast.success('Password updated successfully!');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/delivery/login');
  };

  if (!text) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {text.account || 'Account'}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {loading && !userData ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : userData ? (
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-green-600 text-3xl font-bold">
                    {userData.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{userData.name}</h2>
                    <p className="text-green-100">{text.d_delivery_partner || 'Delivery Partner'}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">{text.phone || 'Phone'}</label>
                    <p className="text-gray-900 font-medium mt-1">{userData.phone}</p>
                  </div>
                  {userData.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">{text.email || 'Email'}</label>
                      <p className="text-gray-900 font-medium mt-1">{userData.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Statistics */}
            {orderStats && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {text.d_order_stats || 'Order Statistics'}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{orderStats.total || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">{text.d_total_orders || 'Total Orders'}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{orderStats.delivered || 0}</p>
                    <p className="text-sm text-gray-600 mt-1">{text.d_delivered || 'Delivered'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Change Password Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {text.change_password || 'Change Password'}
                </h3>
                {action === 0 && (
                  <button
                    onClick={() => setAction(1)}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    {text.edit || 'Edit'}
                  </button>
                )}
              </div>

              {action === 1 ? (
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      {text.new_password || 'New Password'}
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter new password"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAction(0);
                        setPassword('');
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      {text.cancel || 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Updating...' : text.update || 'Update'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-600">
                  {text.password_info || 'Click edit to change your password'}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/delivery/home')}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {text.back_to_home || 'Back to Home'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                {text.logout || 'Logout'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Failed to load account information</p>
          </div>
        )}
      </main>
    </div>
  );
}
