'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStoreAuth } from '@/lib/store-auth-store';
import { servexStoreApi } from '@/lib/store-api';
import { 
  Store, 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  LogOut,
  User,
  Package,
  Clock,
  Truck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderData {
  id: string;
  name: string;
  address: string;
  total: string;
  currency: string;
  status: number;
  otp: number;
  date: string;
  time: string;
  phone: string;
}

interface Overview {
  total: number;
  complete: number;
}

export default function StoreDashboard() {
  const router = useRouter();
  const { isAuthenticated, storeData, logout, checkAuth } = useStoreAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'new' | 'complete' | 'cancel'>('new');
  const [data, setData] = useState<OrderData[]>([]);
  const [completeOrders, setCompleteOrders] = useState<OrderData[]>([]);
  const [cancelOrders, setCancelOrders] = useState<OrderData[]>([]);
  const [overview, setOverview] = useState<Overview>({ total: 0, complete: 0 });
  const [text, setText] = useState<any>(null);

  useEffect(() => {
    if (!checkAuth()) {
      router.replace('/store/login');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storeId = localStorage.getItem('store_user_id');
      if (!storeId) {
        router.replace('/store/login');
        return;
      }

      const response = await servexStoreApi.homepage(storeId, 0);
      
      console.log('Dashboard API response:', response);
      
      setData(response.data || []);
      setCompleteOrders(response.complete || []);
      setCancelOrders(response.cancel || []);
      setOverview(response.overview || { total: 0, complete: 0 });
      setText(response.text || {});
      
      if (response.text) {
        localStorage.setItem('app_text', JSON.stringify(response.text));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/');
  };

  const viewOrderDetail = (order: OrderData) => {
    localStorage.setItem('odata', JSON.stringify(order));
    localStorage.setItem('store_data', JSON.stringify(storeData));
    router.push(`/store/order/${order.id}`);
  };

  const getStatusText = (status: number) => {
    const statusTexts: { [key: number]: { text: string; color: string } } = {
      0: { text: 'New Order', color: 'text-orange-600' },
      1: { text: 'Confirmed', color: 'text-green-600' },
      3: { text: 'Delivery Assigned', color: 'text-blue-600' },
      4: { text: 'On the Way', color: 'text-purple-600' },
    };
    return statusTexts[status] || { text: 'Unknown', color: 'text-gray-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentOrders = activeTab === 'new' ? data : activeTab === 'complete' ? completeOrders : cancelOrders;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Store className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{storeData?.name || 'Store Dashboard'}</h1>
              <p className="text-sm text-gray-500">Store Management Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => router.push('/store/account')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Account"
            >
              <User className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-2xl p-8 mb-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Order Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <div className="text-3xl font-bold mb-1 text-gray-800 text-center">{overview.total}</div>
              <div className="text-sm text-gray-600 text-center">Total Orders</div>
            </div>
            <div className="bg-white rounded-xl p-6">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <div className="text-3xl font-bold mb-1 text-gray-800 text-center">{overview.complete}</div>
              <div className="text-sm text-gray-600 text-center">Complete Orders</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-1 flex space-x-2">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'new'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>New Orders ({data.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('complete')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'complete'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Completed ({completeOrders.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('cancel')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'cancel'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <XCircle className="w-4 h-4" />
              <span>Cancelled ({cancelOrders.length})</span>
            </div>
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {currentOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          ) : (
            currentOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => viewOrderDetail(order)}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xl font-bold text-gray-900">#{order.id}</span>
                      <span className={`text-sm font-medium ${getStatusText(order.status).color}`}>
                        {getStatusText(order.status).text}
                      </span>
                      {order.otp === 1 ? (
                        <span className="text-xs bg-red-500 text-white px-3 py-1 rounded-full flex items-center space-x-1 font-medium">
                          <Truck className="w-3 h-3" />
                          <span>Delivery</span>
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full font-medium">
                          Pickup
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-gray-600">
                      <p className="font-medium">{order.name}</p>
                      <p className="text-sm">{order.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {order.currency}{order.total}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.date} {order.time}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
