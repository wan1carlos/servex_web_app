'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStoreAuth } from '@/lib/store-auth-store';
import { servexStoreApi } from '@/lib/store-api';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  MapPin, 
  DollarSign, 
  CreditCard,
  Calendar,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Loader2,
  Truck
} from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem {
  qty: string;
  type: string;
  item: string;
  price: string;
  addon?: Array<{ addon: string; price: string }>;
}

interface OrderDetail {
  id: string;
  name: string;
  phone: string;
  address: string;
  total: string;
  payable: string;
  currency: string;
  status: number;
  otp: number;
  date: string;
  time: string;
  order_date?: string;
  pay: number;
  ecash?: number;
  notes?: string;
  payment_proof?: string;
  items: OrderItem[];
}

export default function StoreOrderDetail() {
  const router = useRouter();
  const params = useParams();
  const { checkAuth } = useStoreAuth();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [text, setText] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ status: number; text: string } | null>(null);

  useEffect(() => {
    if (!checkAuth()) {
      router.replace('/store/login');
      return;
    }

    // Load order data from localStorage
    const odata = localStorage.getItem('odata');
    const sdata = localStorage.getItem('store_data');
    const appText = localStorage.getItem('app_text');

    if (odata) {
      const parsedOrder = JSON.parse(odata);
      console.log('Order Data:', parsedOrder);
      console.log('Payment Method:', parsedOrder.pay);
      console.log('Payment Proof:', parsedOrder.payment_proof);
      setOrderData(parsedOrder);
    }
    if (sdata) {
      setStoreData(JSON.parse(sdata));
    }
    if (appText) {
      setText(JSON.parse(appText));
    }
  }, []);

  const handleOrderAction = async (status: number) => {
    const actionTexts: { [key: number]: string } = {
      1: 'confirm this order',
      2: 'cancel this order',
    };

    setConfirmAction({ status, text: actionTexts[status] });
    setShowConfirmModal(true);
  };

  const executeOrderAction = async () => {
    if (!confirmAction) return;

    setShowConfirmModal(false);
    setLoading(true);
    try {
      const response = await servexStoreApi.orderProcess(orderData!.id, confirmAction.status);
      
      if (confirmAction.status === 2) {
        toast.success('Order cancelled successfully');
      } else if (confirmAction.status === 1) {
        toast.success('Order confirmed successfully');
      }
      
      // Update order status
      if (orderData) {
        setOrderData({ ...orderData, status: response.data });
      }
      
      setTimeout(() => {
        router.push('/store/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Failed to process order');
    } finally {
      setLoading(false);
      setConfirmAction(null);
    }
  };

  const getPaymentMethod = (payType: number, ecash?: number, payable?: string) => {
    if (payType === 1) return 'Cash on Delivery';
    if (payType === 2 || payType === 3) return 'Online Payment';
    if (payType === 4) {
      if (payable && parseFloat(payable) > 0) {
        return `Partial E-Cash Payment`;
      }
      return 'Paid with E-Cash';
    }
    if (payType === 5) return 'GCash QR Payment';
    return 'Unknown';
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Order Details</h1>
            <p className="text-sm text-gray-500">Order #{orderData.id}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold">#{orderData.id}</h2>
              <p className="text-sm opacity-90">
                <Calendar className="w-4 h-4 inline mr-1" />
                {orderData.date} | <Clock className="w-4 h-4 inline mr-1" />{orderData.time}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90 mb-1">Total Amount</div>
              <div className="text-3xl font-bold">{orderData.currency}{orderData.total}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {orderData.otp === 1 ? (
              <span className="bg-red-500 px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                <Truck className="w-4 h-4" />
                <span>Delivery</span>
              </span>
            ) : (
              <span className="bg-blue-500 px-4 py-2 rounded-full text-sm font-medium">
                Pickup
              </span>
            )}
            {orderData.order_date && (
              <span className="bg-white px-4 py-2 rounded-full text-sm text-gray-800 font-medium">
                {orderData.order_date}
              </span>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Package className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold">Order Items</h3>
          </div>
          <div className="space-y-4">
            {orderData.items.map((item, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.qty} {item.type} {item.item}
                    </p>
                    {item.addon && item.addon.length > 0 && (
                      <div className="mt-2 ml-4 space-y-1">
                        {item.addon.map((addon, addonIndex) => (
                          <p key={addonIndex} className="text-sm text-gray-600">
                            + {addon.addon} - {orderData.currency}{addon.price}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold">{orderData.currency}{item.price}</span>
                </div>
              </div>
            ))}
          </div>
          {orderData.notes && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-1">Customer Notes:</p>
              <p className="text-sm text-gray-600">{orderData.notes}</p>
            </div>
          )}
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Customer Information</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Customer Name</p>
                <p className="font-medium">{orderData.name}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <a href={`tel:${orderData.phone}`} className="font-medium text-blue-600 hover:underline">
                  {orderData.phone}
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Delivery Address</p>
                <p className="font-medium">{orderData.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{orderData.currency}{orderData.total}</span>
            </div>
            {orderData.ecash && orderData.ecash > 0 && (
              <div className="flex justify-between text-green-600">
                <span>E-Cash Used</span>
                <span className="font-medium">-{orderData.ecash}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <span className="font-semibold">Total Payable</span>
              <span className="text-2xl font-bold text-green-600">
                {orderData.currency}{orderData.payable}
              </span>
            </div>
            <div className="flex items-center space-x-2 pt-2 text-sm">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Payment Method: <span className="font-medium">{getPaymentMethod(orderData.pay, orderData.ecash, orderData.payable)}</span>
              </span>
            </div>

            {/* Show GCash Payment Proof - Debug info */}
            {orderData.pay === 5 && (
              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 font-medium mb-3">Payment Proof:</p>
                {orderData.payment_proof ? (
                  <>
                    <img 
                      src={`https://bsitport2026.com/servex/${orderData.payment_proof}`}
                      alt="Payment Proof" 
                      className="w-full max-w-md rounded-lg border-2 border-gray-300"
                      onError={(e) => {
                        console.error('Failed to load image:', orderData.payment_proof);
                        console.error('Attempted URL:', `https://bsitport2026.com/servex/${orderData.payment_proof}`);
                        const img = e.target as HTMLImageElement;
                        const errorMsg = document.createElement('p');
                        errorMsg.className = 'text-sm text-red-500 mt-2';
                        errorMsg.textContent = `Unable to load image: ${orderData.payment_proof}`;
                        img.parentElement?.appendChild(errorMsg);
                        img.style.display = 'none';
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-1">Path: {orderData.payment_proof}</p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500 italic">No payment proof uploaded yet</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {orderData.status === 0 && (
          <div className="flex space-x-4">
            <button
              onClick={() => handleOrderAction(2)}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  <span>Cancel Order</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleOrderAction(1)}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirm Order</span>
                </>
              )}
            </button>
          </div>
        )}

        {orderData.status === 1 && storeData?.delivery_by === 1 && orderData.otp === 1 && (
          <button
            onClick={() => router.push(`/store/assign-delivery/${orderData.id}`)}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center space-x-2"
          >
            <Truck className="w-5 h-5" />
            <span>Assign Delivery Boy</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Action</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {confirmAction.text}?
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={executeOrderAction}
                className={`flex-1 py-3 rounded-lg font-semibold text-white transition ${
                  confirmAction.status === 2
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {confirmAction.status === 2 ? 'Cancel Order' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
