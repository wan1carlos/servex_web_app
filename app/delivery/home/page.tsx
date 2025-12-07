'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryAuth } from '@/lib/delivery-auth-store';
import servexDeliveryApi from '@/lib/delivery-api';
import toast from 'react-hot-toast';

interface Order {
  id: string;
  store: string;
  user: {
    name: string;
    phone: string;
    address: string;
  };
  st: number;
  [key: string]: any;
}

export default function DeliveryHomePage() {
  const router = useRouter();
  const { user, userId, isAuthenticated, online, setOnlineStatus, logout } = useDeliveryAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState<any>(null);
  const [localOnline, setLocalOnline] = useState(online);

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
  }, [isAuthenticated, router]);

  useEffect(() => {
    setLocalOnline(online);
  }, [online]);

  const loadData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await servexDeliveryApi.homepage(userId, 3);
      
      if (response.data) {
        setOrders(response.data);
      }
      
      if (response.text) {
        setText(response.text);
        localStorage.setItem('app_text', JSON.stringify(response.text));
      }

      if (response.dboy) {
        setLocalOnline(response.dboy.online === 1);
        setOnlineStatus(response.dboy.online === 1);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!userId) return;

    const newStatus = !localOnline;
    setLocalOnline(newStatus);
    setOnlineStatus(newStatus);

    try {
      await servexDeliveryApi.setStatus(userId, newStatus ? 1 : 0);
    } catch (error) {
      console.error('Error updating status:', error);
      setLocalOnline(!newStatus);
      setOnlineStatus(!newStatus);
      toast.error('Failed to update status');
    }
  };

  const handleAccept = async (order: Order) => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await servexDeliveryApi.accept(userId, order.id);

      if (response.data && response.data !== 'error') {
        // Store the accepted order data with updated status
        const acceptedOrder = { ...order, st: 3 };
        localStorage.setItem('delivery_order_data', JSON.stringify(acceptedOrder));
        
        toast.success('Order accepted successfully!');
        router.push(`/delivery/detail?id=${order.id}`);
      } else {
        toast.error('This order is already assigned to somebody else.');
        await loadData();
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error('Failed to accept order');
      setLoading(false);
    }
  };

  const handleViewDetail = (order: Order) => {
    localStorage.setItem('delivery_order_data', JSON.stringify(order));
    router.push(`/delivery/detail?id=${order.id}`);
  };

  const handleLogout = () => {
    logout();
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {text.d_home_title || 'Delivery Dashboard'}
              </h1>
            </div>

            {/* Online/Offline Toggle */}
            <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2">
              <span className={`text-sm font-medium ${localOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {localOnline ? text.d_active || 'Active' : text.d_offline || 'Offline'}
              </span>
              <button
                onClick={handleStatusToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  localOnline ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    localOnline ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* User Info */}
          {user && (
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/delivery/my')}
                  className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  My Orders
                </button>
                <button
                  onClick={() => router.push('/delivery/earn')}
                  className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  Earnings
                </button>
                <button
                  onClick={() => router.push('/delivery/account')}
                  className="px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  Account
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-600 font-medium">{text.d_no_order || 'No orders available'}</p>
                <p className="text-gray-500 text-sm mt-2">
                  {localOnline 
                    ? 'New orders will appear here when available' 
                    : 'Turn on active status to receive orders'}
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 space-y-4">
                    {/* Store Name */}
                    <h3 className="text-xl font-bold text-gray-900">{order.store}</h3>

                    {/* Order Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">{text.d_order_id || 'Order ID'}:</span>
                      </div>
                      <div className="text-gray-600">{order.id}</div>

                      <div>
                        <span className="font-semibold text-gray-700">{text.d_user || 'User'}:</span>
                      </div>
                      <div className="text-gray-600">{order.user.name}</div>

                      <div>
                        <span className="font-semibold text-gray-700">{text.d_phone || 'Phone'}:</span>
                      </div>
                      <div>
                        <a href={`tel:${order.user.phone}`} className="text-green-600 hover:underline">
                          {order.user.phone}
                        </a>
                      </div>

                      <div>
                        <span className="font-semibold text-gray-700">{text.d_address || 'Address'}:</span>
                      </div>
                      <div className="text-gray-600">{order.user.address}</div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4">
                      {order.st > 1 ? (
                        <button
                          onClick={() => handleViewDetail(order)}
                          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          {text.d_view_detail || 'View Detail'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAccept(order)}
                          className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                          {text.d_accept || 'Accept Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-6 py-3 bg-white text-green-600 border border-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Orders'}
          </button>
        </div>
      </main>
    </div>
  );
}
