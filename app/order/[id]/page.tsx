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

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appText, setAppText] = useState<any>({});

  useEffect(() => {
    const text = localStorage.getItem('app_text');
    if (text) setAppText(JSON.parse(text));
    
    loadOrderData();
    
    // Refresh order data every 15 seconds
    const interval = setInterval(() => {
      loadOrderData();
    }, 15000);

    return () => clearInterval(interval);
  }, [params.id]);

  const loadOrderData = async () => {
    try {
      const response = await servexApi.orderDetail(params.id as string);
      
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

        {/* Map */}
        {orderData.order && (orderData.order.lat || orderData.order.slat) && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              {appText.track_order || 'Track Order'}
            </h3>
            
            {/* Map Legend */}
            <div className="mb-3 flex flex-wrap gap-3 text-sm">
              {orderData.order.slat && orderData.order.slng && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">Store</span>
                </div>
              )}
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
                <div className="w-8 h-1 bg-blue-400"></div>
                <span className="text-gray-600">Route</span>
              </div>
            </div>
            
            <MapComponent
              storeLat={orderData.order.slat}
              storeLng={orderData.order.slng}
              deliveryLat={orderData.order.lat}
              deliveryLng={orderData.order.lng}
              riderLat={orderData.lat}
              riderLng={orderData.lng}
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
