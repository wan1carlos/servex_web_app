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
    order_total?: string;
  }>;
  currency: string;
}

interface DebugInfo {
  apiResponseCount: number;
  ordersFound: number;
  rawResponses: any[];
}

export default function DeliveryEarnPage() {
  const router = useRouter();
  const { userId, isAuthenticated } = useDeliveryAuth();
  const [data, setData] = useState<EarningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDebug, setShowDebug] = useState(false);

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
      console.log('===== FETCHING ALL DELIVERED ORDERS =====');
      
      let allOrders: any[] = [];
      const rawResponses: any[] = [];
      
      // Declare earnData outside the try block so it's accessible later
      let earnData: any = {};
      
      // Fetch from multiple sources to get ALL delivered orders
      try {
        // Try earn endpoint first - this has the aggregate totals
        const earnResponse = await servexDeliveryApi.earn(userId);
        console.log('Earn Response:', JSON.stringify(earnResponse, null, 2));
        rawResponses.push({ source: 'earn', data: earnResponse });
        
        // Store the earn response for later use
        earnData = earnResponse.data || {};
      } catch (error: any) {
        console.warn('Earn endpoint error:', error.message);
      }
      
      // Try to fetch ALL completed/delivered orders from homepage with status 5 (completed)
      try {
        const completedResponse = await servexDeliveryApi.homepage(userId, 5);
        console.log('Completed Orders (Status 5) Response:', JSON.stringify(completedResponse, null, 2));
        rawResponses.push({ source: 'homepage-status-5', data: completedResponse });
        
        if (completedResponse.data) {
          let completedOrders: any[] = [];
          
          // Handle different response structures
          if (Array.isArray(completedResponse.data)) {
            completedOrders = completedResponse.data;
          } else if (completedResponse.data.orders && Array.isArray(completedResponse.data.orders)) {
            completedOrders = completedResponse.data.orders;
          } else if (completedResponse.data.data && Array.isArray(completedResponse.data.data)) {
            completedOrders = completedResponse.data.data;
          }
          
          const mappedOrders = completedOrders.map((order: any) => {
            // Extract delivery charge - it's in user.d_charges!
            const dcharge = (order.user && order.user.d_charges) ||
                          order.d_charges ||
                          order.delivery_charge || 
                          order.dcharge || 
                          order.d_charge || 
                          order.deliveryCharge || 
                          order.dboy_charge || 
                          order.delivery_boy_charge || 
                          order.del_charge || 
                          order.delcharge ||
                          order.delivery_cost ||
                          order.delivery_fee ||
                          order.delivery_price ||
                          order.rider_charge ||
                          order.rider_fee ||
                          '0';
            
            console.log(`Mapping Order ${order.id}:`, {
              delivery_charge: dcharge,
              from_user_object: order.user?.d_charges,
              raw_order: order
            });
            
            return {
              id: order.id,
              date: order.order_date || order.created_at || order.delivery_date || order.date,
              amount: dcharge,
              store: order.store_name || order.shop_name || order.store || 'Store',
              order_total: order.total || order.order_total || order.amount
            };
          });
          
          // Merge, avoiding duplicates
          const existingIds = new Set(allOrders.map(o => o.id));
          mappedOrders.forEach((order: any) => {
            if (!existingIds.has(order.id)) {
              allOrders.push(order);
            }
          });
        }
      } catch (error: any) {
        console.warn('Homepage status 5 endpoint error:', error.message);
      }
      // Try to fetch from my endpoint (completed deliveries)
      try {
        const myResponse = await servexDeliveryApi.my(userId);
        console.log('My Orders Response:', JSON.stringify(myResponse, null, 2));
        rawResponses.push({ source: 'my', data: myResponse });
        console.log('My Orders Response:', JSON.stringify(myResponse, null, 2));
        
        if (myResponse.data && Array.isArray(myResponse.data)) {
          const myOrders = myResponse.data.map((order: any) => {
            const dcharge = (order.user && order.user.d_charges) ||
                          order.d_charges ||
                          order.delivery_charge || 
                          order.dcharge || 
                          order.d_charge || 
                          order.deliveryCharge || 
                          order.dboy_charge || 
                          order.delivery_boy_charge || 
                          order.del_charge || 
                          order.delcharge ||
                          order.delivery_cost ||
                          order.delivery_fee ||
                          order.delivery_price ||
                          order.rider_charge ||
                          order.rider_fee ||
                          '0';
            
            console.log(`My Orders - Order ${order.id}:`, {
              delivery_charge: dcharge,
              from_user_object: order.user?.d_charges,
              raw_order: order
            });
            
            return {
              id: order.id,
              date: order.order_date || order.created_at || order.delivery_date || order.date,
              amount: dcharge,
              store: order.store_name || order.shop_name || order.store || 'Store',
              order_total: order.total || order.order_total || order.amount
            };
          });
          
          // Merge, avoiding duplicates
          const existingIds = new Set(allOrders.map(o => o.id));
          myOrders.forEach((order: any) => {
            if (!existingIds.has(order.id)) {
              allOrders.push(order);
            }
          });
        }
      } catch (myError: any) {
        console.warn('My orders endpoint error:', myError.message);
      }
      
      console.log('===== ALL ORDERS COLLECTED =====');
      console.log('Total Orders Found:', allOrders.length);
      console.log('Raw Orders Data:', JSON.stringify(allOrders, null, 2));
      
      // Filter out invalid orders
      // Remove Order #3 with incorrect ₱265800 charge and any unrealistic delivery charges
      allOrders = allOrders.filter((order: any) => {
        const deliveryCharge = parseFloat(order.amount || '0');
        
        // Remove Order #3 specifically
        if (order.id === '3') {
          console.log(`❌ Filtered out Order #3 (incorrect delivery charge: ₱${deliveryCharge})`);
          return false;
        }
        
        // Filter out unrealistic delivery charges (> ₱5000)
        if (deliveryCharge > 5000) {
          console.log(`❌ Filtered out Order #${order.id} (unrealistic delivery charge: ₱${deliveryCharge})`);
          return false;
        }
        
        return true;
      });
      
      console.log('Orders after filtering:', allOrders.length);
      
      // If no orders found, log all raw responses for debugging
      if (allOrders.length === 0) {
        console.error('⚠️ NO ORDERS FOUND! Check the API responses above to see what data is being returned.');
      }
      
      // Calculate ALL earnings from actual delivery charges in orders
      const now = new Date();
      const today = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentMonth = now.getMonth(); // 0-11
      const currentYear = now.getFullYear();
      
      console.log(`Current Date: ${today}`);
      console.log(`Current Month: ${currentMonth + 1}/${currentYear}`);
      
      // Calculate earnings from actual delivery charges
      let totalEarnings = 0;
      let monthEarnings = 0;
      let todayEarnings = 0;
      
      console.log('===== CALCULATING EARNINGS FROM DELIVERY CHARGES =====');
      
      // Calculate from individual orders
      allOrders.forEach((order: any) => {
        const deliveryCharge = parseFloat(order.amount || '0');
        
        console.log(`Order ${order.id}:`, {
          deliveryCharge,
          date: order.date,
          rawOrder: order
        });
        
        // Add to total earnings
        totalEarnings += deliveryCharge;
        
        // Check if order is from today (format: "09-Dec-2025 | 05:22:AM")
        if (order.date) {
          const orderDateStr = order.date.split(' ')[0]; // Get "09-Dec-2025"
          const todayFormatted = now.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }).replace(/ /g, '-'); // Format as "09-Dec-2025"
          
          console.log(`Comparing dates - Order: ${orderDateStr}, Today: ${todayFormatted}`);
          
          if (orderDateStr === todayFormatted) {
            todayEarnings += deliveryCharge;
            console.log(`✓ Added to today's earnings: ${deliveryCharge}`);
          }
          
          // Check if order is from this month
          try {
            // Parse the date "09-Dec-2025"
            const dateParts = orderDateStr.split('-');
            if (dateParts.length === 3) {
              const orderDay = parseInt(dateParts[0]);
              const orderMonthStr = dateParts[1];
              const orderYear = parseInt(dateParts[2]);
              
              // Convert month name to number
              const monthMap: { [key: string]: number } = {
                'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
              };
              const orderMonth = monthMap[orderMonthStr];
              
              if (orderMonth === currentMonth && orderYear === currentYear) {
                monthEarnings += deliveryCharge;
                console.log(`✓ Added to this month's earnings: ${deliveryCharge}`);
              }
            }
          } catch (dateError) {
            console.warn(`Could not parse date for order ${order.id}:`, orderDateStr);
          }
        }
      });
      
      // Sort orders from newest to oldest
      const sortedOrders = allOrders.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA; // Newest first (descending)
      });
      
      const earningsData = {
        total_earn: totalEarnings.toFixed(2),
        today_earn: todayEarnings.toFixed(2),
        this_month: monthEarnings.toFixed(2),
        orders: sortedOrders,
        currency: '₱',
      };
      
      console.log('===== FINAL EARNINGS SUMMARY =====');
      console.log('Total Orders Processed:', earningsData.orders.length);
      console.log('💰 Total Earnings: ₱' + totalEarnings.toFixed(2));
      console.log('📅 Today Earnings: ₱' + todayEarnings.toFixed(2));
      console.log('📊 Month Earnings: ₱' + monthEarnings.toFixed(2));
      console.log('=====================================');
      
      setData(earningsData);
      setDebugInfo({
        apiResponseCount: rawResponses.length,
        ordersFound: allOrders.length,
        rawResponses: rawResponses
      });
      
      if (allOrders.length === 0) {
        toast.error('No delivered orders found. Click "Show Debug Info" button to see API responses.');
        console.error('❌ No orders were returned from any API endpoint. Check your delivery boy ID and order status.');
      } else {
        console.log(`✅ Successfully loaded ${allOrders.length} orders`);
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
                  {data.currency}{data.total_earn || '0.00'}
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
                  {data.currency}{data.today_earn || '0.00'}
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
                  {data.currency}{data.this_month || '0.00'}
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
                          <p className="text-xs text-gray-500 mb-1">Delivery Charge</p>
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
                <p className="text-gray-600 font-medium">No earnings yet</p>
                <p className="text-gray-500 text-sm mt-2">Start accepting orders to see your earnings here</p>
              </div>
            )}

            {/* Debug Info Panel */}
            {debugInfo && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Debug Information</h2>
                  <button
                    onClick={() => setShowDebug(!showDebug)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showDebug ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p>API Response Count: <span className="font-semibold">{debugInfo.apiResponseCount}</span></p>
                  <p>Orders Found: <span className="font-semibold">{debugInfo.ordersFound}</span></p>
                </div>
                
                {showDebug && (
                  <div className="mt-4">
                    <div className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
                      <pre className="text-xs">{JSON.stringify(debugInfo.rawResponses, null, 2)}</pre>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      💡 Tip: Check the console (F12) for detailed order field information
                    </p>
                  </div>
                )}
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
