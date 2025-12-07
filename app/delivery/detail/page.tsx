'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDeliveryAuth } from '@/lib/delivery-auth-store';
import servexDeliveryApi from '@/lib/delivery-api';
import toast from 'react-hot-toast';

interface OrderItem {
  qty: string;
  type: string;
  item: string;
  addon: Array<{ addon: string }>;
}

interface OrderData {
  id: string;
  store: string;
  date: string;
  slat: string;
  slng: string;
  items: OrderItem[];
  user: {
    name: string;
    phone: string;
    address: string;
    lat: string;
    lng: string;
  };
  currency: string;
  total: string;
  pay: number;
  payable: string;
  st: number;
  [key: string]: any;
}

export default function DeliveryDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, isAuthenticated } = useDeliveryAuth();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [status, setStatus] = useState(3);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: number } | null>(null);

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

    // Load order data from localStorage or fetch from API
    const storedOrder = localStorage.getItem('delivery_order_data');
    if (storedOrder) {
      const order = JSON.parse(storedOrder);
      setOrderData(order);
      setStatus(order.st);
    }
  }, [isAuthenticated, router]);

  const handleStartRide = async (orderId: string, statusType: number) => {
    try {
      setLoading(true);
      const response = await servexDeliveryApi.startRide(orderId, statusType);

      if (statusType === 5) {
        toast.success(text.d_order_delivered || 'Order delivered successfully!');
        router.push('/delivery/home');
      } else {
        toast.success(text.d_order_start || 'Ride started!');
        setStatus(4);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const handleConfirm = (orderId: string, statusType: number) => {
    setConfirmAction({ id: orderId, status: statusType });
    setShowConfirm(true);
  };

  const executeConfirm = () => {
    if (confirmAction) {
      handleStartRide(confirmAction.id, confirmAction.status);
    }
  };

  if (!text || !orderData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const getPaymentMethodText = () => {
    if (orderData.pay === 1) return text.d_cod || 'Cash on Delivery';
    if (orderData.pay === 2 || orderData.pay === 3) return text.d_online || 'Online Payment';
    if (orderData.pay === 4) {
      if (parseFloat(orderData.payable) > 0) {
        return `${parseFloat(orderData.total) - parseFloat(orderData.payable)} ${text.d_ecash_paid || 'paid via eWallet'}`;
      }
      return text.d_paid_ecash || 'Paid via eWallet';
    }
    return 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
                {text.d_view_detail || 'Order Detail'}
              </h1>
            </div>
            <span className="text-gray-600 font-medium">#{orderData.id}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Store Info */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{orderData.store}</h2>
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-600">{orderData.date}</p>
              <a
                href={`http://maps.google.com/?q=${orderData.slat},${orderData.slng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:underline"
              >
                {text.d_show_dir || 'Show Direction'}
              </a>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              {text.d_order_item || 'Order Items'}
            </h3>
            <div className="space-y-4">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.qty} {item.type} {item.item}
                    </p>
                    {item.addon && item.addon.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.addon.map((addon, addonIndex) => (
                          <p key={addonIndex} className="text-sm text-gray-600">
                            + {addon.addon}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other Info */}
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              {text.d_other_info || 'Other Information'}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <span className="font-semibold text-gray-700">{text.d_user || 'User'}:</span>
                <span className="text-gray-600">{orderData.user.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <span className="font-semibold text-gray-700">{text.d_phone || 'Phone'}:</span>
                <a href={`tel:${orderData.user.phone}`} className="text-green-600 hover:underline">
                  {orderData.user.phone}
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <span className="font-semibold text-gray-700">{text.d_address || 'Address'}:</span>
                <div>
                  <p className="text-gray-600">{orderData.user.address}</p>
                  <a
                    href={`http://maps.google.com/?q=${orderData.user.lat},${orderData.user.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:underline"
                  >
                    {text.d_view_detail || 'View on Map'}
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <span className="font-semibold text-gray-700">{text.d_total_amount || 'Total Amount'}:</span>
                <span className="text-gray-600">{orderData.currency}{orderData.total}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <span className="font-semibold text-gray-700">{text.d_payment_method || 'Payment Method'}:</span>
                <span className="text-gray-600">{getPaymentMethodText()}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <span className="font-semibold text-gray-700">{text.d_total_pay || 'Amount to Collect'}:</span>
                <span className="font-bold text-gray-900">{orderData.currency}{orderData.payable}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {status === 3 && (
                <button
                  onClick={() => handleConfirm(orderData.id, 4)}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {text.d_start_ride || 'Start Ride'}
                </button>
              )}

              {status === 4 && (
                <button
                  onClick={() => handleConfirm(orderData.id, 5)}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
                >
                  {text.d_complete_ride || 'Complete Ride'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {text.d_confirm || 'Confirm'}
            </h3>
            <p className="text-gray-600 mb-6">
              {confirmAction?.status === 5 
                ? text.complete_order_confirm || 'Are you sure you want to complete this order?'
                : text.start_order_confirm || 'Are you sure you want to start this delivery?'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Processing...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
