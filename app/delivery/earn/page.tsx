'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryAuth } from '@/lib/delivery-auth-store';
import servexDeliveryApi from '@/lib/delivery-api';
import toast from 'react-hot-toast';

interface EarningData {
  total_earn: string;
  today_earn: string;
  this_month: string;
  orders: Array<{
    id: string;
    date: string;
    amount: string;
    store: string;
  }>;
  currency: string;
}

export default function DeliveryEarnPage() {
  const router = useRouter();
  const { userId, isAuthenticated } = useDeliveryAuth();
  const [data, setData] = useState<EarningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState<any>(null);

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
      const response = await servexDeliveryApi.earn(userId);

      if (response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error loading earnings:', error);
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
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
              {text.d_earnings || 'My Earnings'}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Earnings */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium opacity-90">{text.d_total_earn || 'Total Earnings'}</p>
                </div>
                <p className="text-3xl font-bold">
                  {data.currency}{data.total_earn || '0'}
                </p>
              </div>

              {/* Today's Earnings */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-600">{text.d_today_earn || "Today's Earnings"}</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {data.currency}{data.today_earn || '0'}
                </p>
              </div>

              {/* This Month */}
              <div className="bg-white rounded-lg p-6 shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-600">{text.d_month_earn || 'This Month'}</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {data.currency}{data.this_month || '0'}
                </p>
              </div>
            </div>

            {/* Recent Deliveries */}
            {data.orders && data.orders.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">
                    {text.d_recent_deliveries || 'Recent Deliveries'}
                  </h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {data.orders.map((order) => (
                    <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{order.store}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Order #{order.id}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{order.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            +{data.currency}{order.amount}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Earnings Yet */}
            {(!data.orders || data.orders.length === 0) && parseFloat(data.total_earn || '0') === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-600 font-medium">{text.d_no_earnings || 'No earnings yet'}</p>
                <p className="text-gray-500 text-sm mt-2">Start accepting orders to see your earnings here</p>
              </div>
            )}

            {/* Refresh Button */}
            <div className="text-center">
              <button
                onClick={loadData}
                disabled={loading}
                className="px-6 py-3 bg-white text-green-600 border border-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Failed to load earnings data</p>
          </div>
        )}
      </main>
    </div>
  );
}
