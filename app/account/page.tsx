'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, ShoppingBag, MapPin, Home, LogOut, Wallet, Gift } from 'lucide-react';
import servexApi from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function AccountPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [appText, setAppText] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const userId = localStorage.getItem('user_id');
    
    if (!userId || userId === 'null' || userId === 'undefined') {
      toast.error('Please login to access this page');
      router.push('/login');
      return;
    }

    loadData();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');
      const response = await servexApi.userInfo(userId as string);
      
      if (response.data) {
        setUserData(response.data);
        localStorage.setItem('user_data', JSON.stringify(response.data));
        
        // Load app text
        const text = localStorage.getItem('app_text');
        if (text) {
          setAppText(JSON.parse(text));
        }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

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
          
          <div className="flex flex-wrap gap-2">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="font-semibold">
                {appText.ecash || 'eCash'}: ₱{userData?.wallet || '0'}
              </span>
            </div>
            
            {userData?.rcode && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span className="font-semibold">
                  {appText.ref_code || 'Referral Code'}: {userData.rcode}
                </span>
              </div>
            )}
          </div>
          
          {userData?.rcode && (
            <p className="text-sm text-white/80 mt-3">
              {appText.ref_code_desc || 'Share your referral code to earn eCash'}
            </p>
          )}
        </div>
      </div>

      {/* Menu Section */}
      <div className="bg-white rounded-t-[2rem] px-4 pt-6 pb-20 min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-600 mb-4">
            {appText.account_title || 'My Account'}
          </h3>

          <div className="space-y-2">
            {/* Account Settings */}
            <button
              onClick={() => router.push('/settings')}
              className="w-full flex items-center gap-4 p-4 bg-white hover:bg-gray-50 rounded-xl shadow-sm transition"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-pink-600" />
              </div>
              <span className="flex-1 text-left font-medium">
                {appText.account_title || 'Account Settings'}
              </span>
              <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
            </button>

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
        </div>
      </div>
    </div>
  );
}
