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
  const [menuOpen, setMenuOpen] = useState(false);

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

    // Start location tracking when rider is online
    let locationInterval: NodeJS.Timeout | null = null;
    let watchId: number | null = null;

    const startLocationTracking = () => {
      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser.');
        return;
      }

      // Get initial location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          localStorage.setItem('current_lat', latitude.toString());
          localStorage.setItem('current_lng', longitude.toString());
          console.log('Initial location set:', latitude, longitude);
        },
        (error) => {
          console.error('Error getting initial location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      // Watch position for continuous updates
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          localStorage.setItem('current_lat', latitude.toString());
          localStorage.setItem('current_lng', longitude.toString());
          console.log('Location updated:', latitude, longitude);
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      // Send location updates to server every 10 seconds
      locationInterval = setInterval(async () => {
        if (userId && online) {
          try {
            await servexDeliveryApi.setStatus(userId, 1);
            console.log('Location sent to server');
          } catch (error) {
            console.error('Error sending location to server:', error);
          }
        }
      }, 10000);
    };

    const stopLocationTracking = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (locationInterval) {
        clearInterval(locationInterval);
        locationInterval = null;
      }
    };

    // Start tracking if online
    if (online) {
      startLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [isAuthenticated, router, online, userId]);

  useEffect(() => {
    setLocalOnline(online);
  }, [online]);

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
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                Servex
              </h1>
            </div>

            {/* Online/Offline Toggle */}
            <div className="flex items-center gap-2 sm:gap-3 border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
              <span className={`text-xs sm:text-sm font-medium ${localOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {localOnline ? text.d_active || 'Active' : text.d_offline || 'Offline'}
              </span>
              <button
                onClick={handleStatusToggle}
                className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                  localOnline ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    localOnline ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* User Info with Profile Picture */}
          {user && (
            <div className="mt-3 sm:mt-4 flex items-center gap-3">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {user.image ? (
                  <img 
                    src={`https://bsitport2026.com/servex/upload/dboy/${user.image}`}
                    alt={user.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-green-600"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-600">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* User Details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Welcome back,</p>
                <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{user.name}</p>
                {(user.vehicle_type || user.vehicle_number) && (
                  <div className="flex items-center gap-2 mt-1">
                    {user.vehicle_type && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        {user.vehicle_type}
                      </span>
                    )}
                    {user.vehicle_number && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-mono">
                        {user.vehicle_number}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Settings Button */}
              <button
                onClick={() => router.push('/delivery/setting')}
                className="flex-shrink-0 p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Settings"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Slide-out Menu */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-transparent z-40"
            onClick={() => setMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 left-0 h-full w-64 sm:w-80 bg-white shadow-xl z-50 transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 space-y-2">
                <button
                  onClick={() => {
                    router.push('/delivery/setting');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">Settings</span>
                </button>

                <button
                  onClick={() => {
                    router.push('/delivery/my');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span className="font-medium">My Orders</span>
                </button>

                <button
                  onClick={() => {
                    router.push('/delivery/earn');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Earnings</span>
                </button>

                <button
                  onClick={() => {
                    router.push('/delivery/account');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">Account</span>
                </button>
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content */}
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm sm:text-base text-gray-600 font-medium">{text.d_no_order || 'No orders available'}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 px-4">
                  {localOnline 
                    ? 'New orders will appear here when available' 
                    : 'Turn on active status to receive orders'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
                      {/* Store Name */}
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{order.store}</h3>

                      {/* Order Details */}
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-700">{text.d_order_id || 'Order ID'}:</span>
                          <span className="text-gray-600">#{order.id}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-700">{text.d_user || 'User'}:</span>
                          <span className="text-gray-600 truncate ml-2">{order.user.name}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-700">{text.d_phone || 'Phone'}:</span>
                          <a href={`tel:${order.user.phone}`} className="text-green-600 hover:underline">
                            {order.user.phone}
                          </a>
                        </div>

                        <div className="pt-2 border-t border-gray-100">
                          <span className="font-semibold text-gray-700 block mb-1">{text.d_address || 'Address'}:</span>
                          <p className="text-gray-600 text-xs sm:text-sm line-clamp-2">{order.user.address}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2">
                        {order.st > 1 ? (
                          <button
                            onClick={() => handleViewDetail(order)}
                            className="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-green-700 transition-colors"
                          >
                            {text.d_view_detail || 'View Detail'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAccept(order)}
                            className="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:bg-green-700 transition-colors"
                          >
                            {text.d_accept || 'Accept Order'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-white text-green-600 border border-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Refresh Orders'}
          </button>
        </div>
      </main>
    </div>
  );
}
