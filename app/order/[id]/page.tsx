'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, Package, CheckCircle } from 'lucide-react';
import servexApi from '@/lib/api';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('@/components/OrderMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-200 rounded-xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  ),
});

// Helper function to safely parse coordinates
const parseCoordinate = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
  return !isNaN(parsed) && isFinite(parsed) ? parsed : undefined;
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appText, setAppText] = useState<any>({});

  useEffect(() => {
    const text = localStorage.getItem('app_text');
    if (text) setAppText(JSON.parse(text));
    
    if (!params?.id) {
      setLoading(false);
      return;
    }

    loadOrderData(params.id);

    const interval = setInterval(() => {
      loadOrderData(params.id as string);
    }, 2000);

    return () => clearInterval(interval);
  }, [params?.id]);

  const loadOrderData = async (orderId: string) => {
    try {
      const response = await servexApi.orderDetail(orderId);
      
      if (response.data) {
        setOrderData(response.data);
        
        // If order is cancelled, redirect to home
        if (response.data.st == 2) {
          toast.error(appText.order_cancel_text || 'Order has been cancelled');
          router.push('/home');
        }
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = () => {
    if (!orderData) return '';
    
    switch (orderData.st) {
      case 0:
        return appText.order_placed_text || 'Your order has been placed successfully';
      case 1:
        return appText.order_confirmed_text || 'Your order has been confirmed';
      case 2:
        return appText.order_cancel_text || 'Order has been cancelled';
      case 3:
        return appText.delivery_assign_text || 'Delivery partner has been assigned';
      case 4:
        return appText.order_on_way || 'Your order is on the way';
      case 5:
        return 'Order has been delivered successfully!';
      case 6:
        return 'Order completed';
      default:
        return orderData.status || 'Processing...';
    }
  };

  const getStatusIcon = () => {
    if (!orderData) return <CheckCircle className="w-6 h-6" />;
    
    switch (orderData.st) {
      case 5:
      case 6:
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 2:
        return <CheckCircle className="w-6 h-6 text-red-500" />;
      default:
        return <CheckCircle className="w-6 h-6" />;
    }
  };

  const getStatusColor = () => {
    if (!orderData) return 'from-blue-600 to-purple-600';
    
    switch (orderData.st) {
      case 5:
      case 6:
        return 'from-green-600 to-emerald-600';
      case 2:
        return 'from-red-600 to-pink-600';
      default:
        return 'from-blue-600 to-purple-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Order not found</p>
          <button
            onClick={() => router.push('/home')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">
            {appText.order_from || 'Order from'} {orderData.store}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Order Status */}
        <div className={`bg-gradient-to-br ${getStatusColor()} text-white rounded-xl p-6 shadow-lg`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              {getStatusIcon()}
            </div>
            <h2 className="text-2xl font-bold">{orderData.status}</h2>
          </div>
          
          <p className="text-white/90 mb-4">{getStatusText()}</p>
          
          {/* Debug info - remove this later */}
          <p className="text-xs text-white/50 mb-4">Status Code: {orderData.st}</p>
          
          <div className="flex flex-wrap gap-2">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="font-semibold">
                {appText.order_no || 'Order'} #{orderData.id}
              </span>
            </div>
            
            <button
              onClick={() => router.push('/orders')}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30"
            >
              {appText.order_detail || 'View Details'}
            </button>
            
            {orderData.dboy_phone && (
              <a
                href={`tel:${orderData.dboy_phone}`}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                {appText.call || 'Call'} {orderData.dboy}
              </a>
            )}
          </div>
        </div>

        {/* Rider Details Section */}
        {orderData.dboy && (orderData.st === 3 || orderData.st === 4) && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              {orderData.dboy_image ? (
                <img 
                  src={`https://bsitport2026.com/servex/upload/dboy/${orderData.dboy_image}`}
                  alt={orderData.dboy}
                  className="w-10 h-10 rounded-full object-cover border-2 border-green-600"
                />
              ) : (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <span>{appText.rider_details || 'Delivery Rider Details'}</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Rider Name */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {appText.rider_name || 'Rider Name'}
                </p>
                <p className="font-semibold text-gray-900">{orderData.dboy}</p>
              </div>

              {/* Phone Number */}
              {orderData.dboy_phone && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {appText.phone || 'Phone Number'}
                  </p>
                  <a href={`tel:${orderData.dboy_phone}`} className="font-semibold text-blue-600 hover:text-blue-700">
                    {orderData.dboy_phone}
                  </a>
                </div>
              )}

              {/* Vehicle Type */}
              {orderData.vehicle_type && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    {appText.vehicle_type || 'Vehicle Type'}
                  </p>
                  <p className="font-semibold text-gray-900">{orderData.vehicle_type}</p>
                </div>
              )}

              {/* Vehicle Number */}
              {orderData.vehicle_number && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {appText.vehicle_number || 'Vehicle/Plate Number'}
                  </p>
                  <p className="font-semibold text-gray-900">{orderData.vehicle_number}</p>
                </div>
              )}

              {/* License Number */}
              {orderData.license_number && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    {appText.license_number || 'License Number'}
                  </p>
                  <p className="font-semibold text-gray-900">{orderData.license_number}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map */}
        {orderData.order && (orderData.order.lat || orderData.order.slat) && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {appText.track_order || 'Track Order'}
            </h3>
            
            {/* Map Legend */}
            <div className="mb-3 flex flex-wrap gap-3 text-sm">
              {/* Only show store marker before rider picks up from store (status < 4) */}
              {orderData.order.slat && orderData.order.slng && (!orderData.st || orderData.st < 4) && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Store</span>
                </div>
              )}
              {/* Show rider marker when order is accepted (status 3 or 4) */}
              {(orderData.st === 3 || orderData.st === 4) && orderData.lat && orderData.lng && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">Rider</span>
                </div>
              )}
              {orderData.order.lat && orderData.order.lng && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">Your Location</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-1 ${(orderData.st === 3 || orderData.st === 4) ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                <span className="text-gray-600">Route</span>
              </div>
            </div>
            
            {/* Debug: Log coordinates */}
            {console.log('Map Props Debug:', {
              storeLat: parseCoordinate(orderData.order.slat),
              storeLng: parseCoordinate(orderData.order.slng),
              deliveryLat: parseCoordinate(orderData.order.lat),
              deliveryLng: parseCoordinate(orderData.order.lng),
              riderLat: parseCoordinate(orderData.lat),
              riderLng: parseCoordinate(orderData.lng),
              orderStatus: orderData.st,
              rawRiderLat: orderData.lat,
              rawRiderLng: orderData.lng
            })}
            
            <MapComponent
              storeLat={parseCoordinate(orderData.order.slat)}
              storeLng={parseCoordinate(orderData.order.slng)}
              deliveryLat={parseCoordinate(orderData.order.lat)}
              deliveryLng={parseCoordinate(orderData.order.lng)}
              riderLat={parseCoordinate(orderData.lat)}
              riderLng={parseCoordinate(orderData.lng)}
              orderStatus={orderData.st}
            />
            {orderData.tm && orderData.st == 4 && (
              <p className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {appText.eta || 'ETA'}: {orderData.tm}
              </p>
            )}
          </div>
        )}

        {/* WhatsApp Contact */}
        {orderData.chat == 1 && orderData.wno && (
          <a
            href={`https://wa.me/${orderData.wno}?text=Hi *${orderData.store}* My Order id is ${orderData.id}, i would like to know about my order.`}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-green-600 text-white p-4 rounded-xl shadow-sm hover:bg-green-700 transition"
          >
            <div className="flex items-center justify-center gap-3">
              <MessageCircle className="w-6 h-6" />
              <span className="font-semibold">Chat on WhatsApp</span>
            </div>
          </a>
        )}

        {/* Back to Home Button */}
        <button
          onClick={() => router.push('/home')}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
        >
          {appText.go_back || 'Go Back to Home'}
        </button>
      </div>
    </div>
  );
}
