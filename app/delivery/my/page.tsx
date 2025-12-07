'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryAuth } from '@/lib/delivery-auth-store';
import servexDeliveryApi from '@/lib/delivery-api';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  store: string;
  date: string;
  total: string;
  currency: string;
  st: number;
  [key: string]: any;
}

export default function DeliveryMyOrdersPage() {
  const router = useRouter();
  const { userId, isAuthenticated } = useDeliveryAuth();
  const [orders, setOrders] = useState<Order[]>([]);
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
      const response = await servexDeliveryApi.homepage(userId, 5);

      if (response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
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
              {text.d_my_orders || 'My Deliveries'}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 font-medium">{text.d_no_order || 'No deliveries yet'}</p>
                <p className="text-gray-500 text-sm mt-2">Your completed deliveries will appear here</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{order.store}</h3>
                        <p className="text-sm text-gray-600 mt-1">{order.date}</p>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Delivered
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">{text.d_order_id || 'Order ID'}:</span>
                      </div>
                      <div className="text-gray-600">#{order.id}</div>

                      <div>
                        <span className="font-semibold text-gray-700">{text.d_total_amount || 'Amount'}:</span>
                      </div>
                      <div className="text-gray-900 font-semibold">
                        {order.currency}{order.total}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Refresh Button */}
        {!loading && orders.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={loadData}
              className="px-6 py-3 bg-white text-green-600 border border-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
