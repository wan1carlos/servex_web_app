'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Clock, Check, X, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';
import servexApi from '@/lib/api';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view orders');
      router.push('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await servexApi.my(user.id);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    const statuses: { [key: number]: { label: string; color: string } } = {
      0: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      1: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
      2: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
      3: { label: 'Preparing', color: 'bg-purple-100 text-purple-800' },
      4: { label: 'On the Way', color: 'bg-indigo-100 text-indigo-800' },
      5: { label: 'Delivered', color: 'bg-green-600 text-white' },
      6: { label: 'Completed', color: 'bg-green-600 text-white' },
    };
    const statusInfo = statuses[status] || statuses[0];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => router.push('/home')}
              className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">{order.store_name || order.store}</h3>
                      <p className="text-sm text-gray-600">
                        Order #{order.id} • {order.order_date || order.date} {order.order_time && `at ${order.order_time}`}
                      </p>
                    </div>
                    {getStatusBadge(order.st || order.status)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="text-sm">
                        <p className="text-gray-600">Total Amount</p>
                        <p className="font-bold text-lg">₱{order.total}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-gray-600">Items</p>
                        <p className="font-semibold">{order.items?.length || 0} items</p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => router.push(`/order/${order.id}`)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                      >
                        View Details
                      </button>
                      {(order.st === 5 || order.st === 6) && order.hasRating === 0 && (
                        <button
                          onClick={() => router.push(`/rate/${order.id}`)}
                          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium flex items-center space-x-1"
                        >
                          <Star className="w-4 h-4" />
                          <span>Rate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
