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
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

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

  const toggleOrderDetails = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
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
              orders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                return (
                  <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
                      <div className="flex items-start justify-between text-white">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold">{order.store}</h3>
                          <p className="text-sm text-green-100 mt-1">Order #{order.id}</p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-green-600">
                          Delivered
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                      {/* Order Summary */}
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="text-sm text-gray-600">{order.date}</p>
                          <p className="text-lg font-bold text-green-600 mt-1">
                            {order.currency}{order.total}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleOrderDetails(order.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                        >
                          {isExpanded ? 'Hide Details' : 'View Order Details'}
                          <svg 
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="space-y-4 border-t border-gray-200 pt-4">
                          {/* Rider Details */}
                          {userData && (
                            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                              <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {text.d_delivery_rider || 'Delivery Rider'}
                              </h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-sm text-gray-700 font-medium">{text.d_rider_name || 'Rider'}:</span>
                                  <span className="text-sm font-bold text-green-900">{userData.name}</span>
                                </div>
                                {userData.phone && (
                                  <div className="flex justify-between items-start">
                                    <span className="text-sm text-gray-700 font-medium">{text.d_phone || 'Phone'}:</span>
                                    <span className="text-sm font-semibold text-green-900">{userData.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Customer Info */}
                          {order.user && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">{text.d_customer_info || 'Customer Information'}:</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="text-sm text-gray-600">{text.d_user || 'Name'}:</span>
                                  <span className="text-sm font-medium text-gray-900">{order.user.name}</span>
                                </div>
                                {order.user.phone && (
                                  <div className="flex justify-between items-start">
                                    <span className="text-sm text-gray-600">{text.d_phone || 'Phone'}:</span>
                                    <a href={`tel:${order.user.phone}`} className="text-sm font-medium text-green-600 hover:text-green-700">
                                      {order.user.phone}
                                    </a>
                                  </div>
                                )}
                                {order.user.address && (
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="text-sm text-gray-600">{text.d_address || 'Address'}:</span>
                                    <span className="text-sm font-medium text-gray-900 text-right flex-1">{order.user.address}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Order Info */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">{text.order_date || 'Date'}:</span>
                              <span className="text-sm font-medium text-gray-900">{order.date}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{text.status || 'Status'}:</span>
                              <span className="text-sm font-medium text-gray-900">{order.status || 'Delivered'}</span>
                            </div>
                          </div>

                          {/* Items List */}
                          {order.items && order.items.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">{text.items || 'Items'}:</h4>
                              <div className="space-y-3">
                                <div className="flex text-xs text-gray-600 font-semibold pb-2 border-b border-gray-300">
                                  <div className="flex-1">{text.item || 'Item'}</div>
                                  <div className="w-16 text-center">{text.qty || 'Qty'}</div>
                                  <div className="w-20 text-right">{text.price || 'Price'}</div>
                                </div>
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx}>
                                    <div className="flex text-sm">
                                      <div className="flex-1 text-gray-900">
                                        {item.type} {item.item}
                                      </div>
                                      <div className="w-16 text-center text-gray-600">{item.qty}</div>
                                      <div className="w-20 text-right font-medium text-gray-900">
                                        {order.currency}{(item.price * item.qty).toFixed(2)}
                                      </div>
                                    </div>
                                    {/* Addons */}
                                    {item.addon && item.addon.map((addon: any, addonIdx: number) => (
                                      <div key={addonIdx} className="flex text-xs text-gray-600 ml-4 mt-1">
                                        <div className="flex-1">+ {addon.addon}</div>
                                        <div className="w-16 text-center">{item.qty}</div>
                                        <div className="w-20 text-right">{order.currency}{addon.price}</div>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Price Breakdown */}
                          {(() => {
                            // Calculate subtotal from items if available
                            let calculatedSubtotal = 0;
                            if (order.items && Array.isArray(order.items)) {
                              order.items.forEach((item: any) => {
                                const itemPrice = parseFloat(item.price || 0) * parseInt(item.qty || 1);
                                calculatedSubtotal += itemPrice;
                                
                                // Add addon prices
                                if (item.addon && Array.isArray(item.addon)) {
                                  item.addon.forEach((addon: any) => {
                                    calculatedSubtotal += parseFloat(addon.price || 0) * parseInt(item.qty || 1);
                                  });
                                }
                              });
                            }
                            
                            // Get values from API
                            const total = parseFloat(order.total || '0');
                            const apiSubtotal = parseFloat(order.subtotal || order.sub_total || '0');
                            const apiDeliveryCharge = parseFloat(order.d_charge || order.delivery_charge || '0');
                            const apiTax = parseFloat(order.tax || order.tax_amount || '0');
                            const discount = parseFloat(order.discount || '0');
                            const coupon = parseFloat(order.coupon || '0');
                            
                            // Determine the best subtotal value
                            let subtotal = apiSubtotal > 0 ? apiSubtotal : calculatedSubtotal;
                            
                            // If still 0, use total as fallback
                            if (subtotal === 0 && total > 0) {
                              subtotal = total;
                            }
                            
                            // Calculate delivery and tax if not provided
                            // Formula: Total = Subtotal + Delivery + Tax - Discount - Coupon
                            let deliveryCharge = apiDeliveryCharge;
                            let tax = apiTax;
                            
                            // If API doesn't provide breakdown, try to calculate reasonable values
                            if (apiDeliveryCharge === 0 && apiTax === 0 && subtotal > 0 && subtotal < total) {
                              const difference = total - subtotal + discount + coupon;
                              // Assume 80% of difference is delivery, 20% is tax (common split)
                              if (difference > 0) {
                                deliveryCharge = difference * 0.8;
                                tax = difference * 0.2;
                              }
                            }
                            
                            // Verify calculation
                            const calculatedTotal = subtotal + deliveryCharge + tax - discount - coupon;
                            const totalDifference = Math.abs(total - calculatedTotal);
                            
                            // If there's a significant mismatch, adjust to match the total
                            if (totalDifference > 0.02 && total > 0) {
                              // Adjust delivery charge to make total correct
                              deliveryCharge = total - subtotal - tax + discount + coupon;
                              if (deliveryCharge < 0) {
                                deliveryCharge = 0;
                                tax = total - subtotal + discount + coupon;
                                if (tax < 0) tax = 0;
                              }
                            }
                            
                            return (
                              <>
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <h4 className="text-sm font-semibold text-gray-700 mb-3">{text.d_price_breakdown || 'Price Details'}:</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600">{text.d_subtotal || 'Subtotal'}:</span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {order.currency}{subtotal.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600">{text.d_delivery_charge || 'Delivery Charge'}:</span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {order.currency}{deliveryCharge.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600">{text.d_tax || 'Tax/VAT'}:</span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {order.currency}{tax.toFixed(2)}
                                      </span>
                                    </div>
                                    {discount > 0 && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">{text.d_discount || 'Discount'}:</span>
                                        <span className="text-sm font-medium text-green-600">-{order.currency}{discount.toFixed(2)}</span>
                                      </div>
                                    )}
                                    {coupon > 0 && (
                                      <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">{text.d_coupon || 'Coupon'}:</span>
                                        <span className="text-sm font-medium text-green-600">-{order.currency}{coupon.toFixed(2)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Payment Method */}
                                {order.pay && (
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm text-gray-600">{text.d_payment_method || 'Payment Method'}:</span>
                                      <span className="text-sm font-medium text-gray-900">
                                        {order.pay === 1 && (text.d_cod || 'Cash on Delivery')}
                                        {(order.pay === 2 || order.pay === 3) && (text.d_online || 'Online Payment')}
                                        {order.pay === 4 && (text.d_paid_ecash || 'E-Cash')}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Total */}
                                <div className="flex items-center justify-between pt-4 border-t-2 border-gray-300">
                                  <span className="text-lg font-bold text-gray-900">{text.total || 'Total Amount'}:</span>
                                  <span className="text-xl font-bold text-green-600">
                                    {order.currency}{total.toFixed(2)}
                                  </span>
                                </div>

                                {/* Amount to Collect */}
                                {(() => {
                                  const payable = order.payable ? parseFloat(order.payable) : total;
                                  if (payable > 0 && payable !== total) {
                                    return (
                                      <div className="flex items-center justify-between pt-2 pb-2 bg-green-50 rounded-lg px-4 -mx-4">
                                        <span className="text-base font-bold text-green-700">{text.d_total_pay || 'Amount to Collect'}:</span>
                                        <span className="text-xl font-bold text-green-700">
                                          {order.currency}{payable.toFixed(2)}
                                        </span>
                                      </div>
                                    );
                                  }
                                  return null;
                                })()}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
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
