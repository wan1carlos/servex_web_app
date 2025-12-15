'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Clock, CreditCard, Wallet, MessageSquare } from 'lucide-react';
import servexApi from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useCart } from '@/lib/cart-store';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [appText, setAppText] = useState<any>({});
  const [settings, setSettings] = useState<any>({});
  const [deliveryCharges, setDeliveryCharges] = useState(0);
  const [taxValue, setTaxValue] = useState(0);
  const [recalculating, setRecalculating] = useState(false);
  
  // Form state
  const [orderType, setOrderType] = useState('1'); // 1=Delivery, 2=Pickup
  const [orderDate, setOrderDate] = useState('1'); // 1=Today, 2=Later
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('1'); // 1=COD, 2=Stripe, 3=Razor, 5=GCash
  const [useEcash, setUseEcash] = useState(false);
  const [ecashAmount, setEcashAmount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  // Stripe fields
  const [cardNo, setCardNo] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');

  // GCash fields
  const [gcashProof, setGcashProof] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load checkout data from localStorage
      const data = localStorage.getItem('checkout_data');
      const text = localStorage.getItem('app_text');
      const setting = localStorage.getItem('setting');
      
      if (!data) {
        toast.error('No checkout data found');
        router.push('/cart');
        return;
      }

      setCheckoutData(JSON.parse(data));
      if (text) setAppText(JSON.parse(text));
      if (setting) setSettings(JSON.parse(setting));

      // Debug: Log checkout data to see store structure
      const parsedData = JSON.parse(data);
      console.log('Checkout Data:', parsedData);
      console.log('Store from checkout:', parsedData.store || parsedData.data?.[0]);

      // Load user info and addresses
      const userId = localStorage.getItem('user_id');
      if (userId && userId !== 'null') {
        const storeId = JSON.parse(data).data[0]?.store_id || '0';
        const cartNo = localStorage.getItem('cart_no') || '0';
        const response = await servexApi.userInfo(userId, storeId, cartNo);
        
        if (response.data) {
          setUserData(response.data);
          setWalletBalance(parseFloat(response.data.wallet) || 0);
        }
        
        if (response.address) {
          setAddresses(response.address);
          if (response.address.length > 0) {
            setSelectedAddress(response.address[0].id);
          }
        }

        // Store data comes from userInfo response
        if (response.store) {
          console.log('Store data from userInfo:', response.store);
          // Update checkoutData with store info
          setCheckoutData((prev: any) => ({
            ...prev,
            store: response.store
          }));
          // Calculate tax
          if (response.store.tax_value && response.store.tax_value > 0) {
            const parsedData = JSON.parse(data);
            const itemTotal = parsedData.total || 0;
            const calculatedTax = Math.round(itemTotal * response.store.tax_value / 100);
            setTaxValue(calculatedTax);
          }
        }
      }
      
      // Set today's date as minimum
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      
    } catch (error) {
      console.error('Error loading checkout data:', error);
      toast.error('Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    if (!checkoutData) return 0;
    const itemTotal = checkoutData.total || 0;
    if (orderType === '2') { // Pickup - no delivery charges
      return itemTotal + taxValue;
    }
    return itemTotal + deliveryCharges + taxValue;
  };

  const recalculateCharges = async (addressId: string) => {
    if (!addressId || orderType === '2') {
      setDeliveryCharges(0);
      return;
    }

    try {
      setRecalculating(true);
      const address = addresses.find(addr => addr.id == addressId);
      if (!address) return;

      // Store address lat/lng in localStorage for API call
      const oldLat = localStorage.getItem('current_lat');
      const oldLng = localStorage.getItem('current_lng');
      localStorage.setItem('current_lat', address.lat);
      localStorage.setItem('current_lng', address.lng);

      // Fetch cart with new location to get updated delivery charges
      const cartNo = localStorage.getItem('cart_no');
      if (cartNo) {
        const response = await servexApi.getCart(cartNo);
        if (response.data) {
          setDeliveryCharges(response.data.d_charges || 0);
        }
      }

      // Restore original location
      if (oldLat) localStorage.setItem('current_lat', oldLat);
      if (oldLng) localStorage.setItem('current_lng', oldLng);
    } catch (error) {
      console.error('Error recalculating charges:', error);
    } finally {
      setRecalculating(false);
    }
  };

  useEffect(() => {
    if (selectedAddress && addresses.length > 0) {
      recalculateCharges(selectedAddress);
    }
  }, [selectedAddress, orderType]);

  const handleUseEcash = () => {
    const newUseEcash = !useEcash;
    setUseEcash(newUseEcash);
    
    if (newUseEcash) {
      const total = getTotal();
      if (walletBalance >= total) {
        setEcashAmount(total);
        setWalletBalance(walletBalance - total);
      } else {
        setEcashAmount(walletBalance);
        setWalletBalance(0);
      }
    } else {
      setWalletBalance((userData?.wallet || 0));
      setEcashAmount(0);
    }
  };

  const getTotalPayable = () => {
    return Math.max(0, getTotal() - ecashAmount);
  };

  const isFormValid = () => {
    if (orderType === '1' && !selectedAddress) return false;
    if (orderDate === '2' && (!selectedDate || !selectedTime)) return false;
    if (getTotalPayable() > 0 && !paymentMethod) return false;
    if (paymentMethod === '2' && (!cardNo || !expMonth || !expYear || !cvv)) return false;
    if (paymentMethod === '5' && !gcashProof) return false; // GCash requires proof
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Snapshot current cart items to preserve view post-order
      try {
        const cartItems = useCart.getState().items || [];
        localStorage.setItem('last_cart_snapshot', JSON.stringify(cartItems));
      } catch {}

      // Set the address coordinates temporarily for order placement
      const oldLat = localStorage.getItem('current_lat');
      const oldLng = localStorage.getItem('current_lng');
      
      if (orderType === '1' && selectedAddress) {
        const address = addresses.find(addr => addr.id == selectedAddress);
        if (address) {
          localStorage.setItem('current_lat', address.lat);
          localStorage.setItem('current_lng', address.lng);
        }
      }

      // Extract store_id from checkout data
      console.log('===== EXTRACTING STORE_ID =====');
      console.log('checkoutData?.store?.id:', checkoutData?.store?.id);
      console.log('checkoutData?.store_id:', checkoutData?.store_id);
      console.log('localStorage store_id:', localStorage.getItem('store_id'));
      
      const storeId = checkoutData?.store?.id || 
                      checkoutData?.store_id ||
                      localStorage.getItem('store_id') || 
                      '0';
      
      console.log('Final storeId:', storeId);
      
      if (!storeId || storeId === '0') {
        toast.error('Store information is missing. Please try again.');
        return;
      }

      const userId = localStorage.getItem('user_id');
      const cartNo = localStorage.getItem('cart_no');
      
      if (!userId) {
        toast.error('User session expired. Please login again.');
        router.push('/login');
        return;
      }
      
      if (!cartNo) {
        toast.error('Cart information is missing. Please try again.');
        return;
      }

      const orderData: any = {
        payment: paymentMethod,
        cart_no: cartNo,
        payment_id: '0',
        otype: orderType,
        odate: orderDate,
        order_date: orderDate === '2' ? selectedDate : '',
        order_time: orderDate === '2' ? selectedTime : '',
        user_id: userId,
        store_id: storeId,
        address: selectedAddress,
        ecash: ecashAmount,
        comment: comment
      };

      console.log('===== PLACING ORDER =====');
      console.log('Order Data:', orderData);
      console.log('Order Data store_id specifically:', orderData.store_id);
      console.log('Current Lat:', localStorage.getItem('current_lat'));
      console.log('Current Lng:', localStorage.getItem('current_lng'));
      console.log('Checkout Data:', checkoutData);

      // Handle GCash payment proof upload
      if (paymentMethod === '5' && gcashProof) {
        const formData = new FormData();
        Object.keys(orderData).forEach(key => {
          formData.append(key, orderData[key]);
        });
        formData.append('payment_proof', gcashProof);
        
        const response = await servexApi.placeOrder(formData);
        
        if (response.data) {
          localStorage.setItem('order_data', JSON.stringify(response.data));
          // Optional: preserve snapshot for confirmation page consumption
          toast.success('Order placed successfully!');
          router.push(`/order/${response.data.data.id}`);
        }
      } else {
        const response = await servexApi.placeOrder(orderData);
        
        if (response.data) {
          localStorage.setItem('order_data', JSON.stringify(response.data));
          // Optional: preserve snapshot for confirmation page consumption
          toast.success('Order placed successfully!');
          router.push(`/order/${response.data.data.id}`);
        }
      }
      
      // Restore original location after order is placed
      if (oldLat) localStorage.setItem('current_lat', oldLat);
      if (oldLng) localStorage.setItem('current_lng', oldLng);
    } catch (error: any) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      // Restore location on error too
      const oldLat = localStorage.getItem('current_lat');
      const oldLng = localStorage.getItem('current_lng');
      if (oldLat) localStorage.setItem('current_lat', oldLat);
      if (oldLng) localStorage.setItem('current_lng', oldLng);
      
      const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to place order';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !checkoutData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-pink-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{appText.checkout || 'Checkout'}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Order Type & Date */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {appText.order_type || 'Order Type'}
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="1">{appText.delivery || 'Delivery'}</option>
              <option value="2">{appText.pickup || 'Pickup'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {appText.order_date_time || 'When do you want your order?'}
            </label>
            <select
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
            >
              <option value="1">{appText.deliver_today || 'Today'}</option>
              <option value="2">{appText.deliver_later || 'Later'}</option>
            </select>
          </div>

          {orderDate === '2' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {appText.select_date || 'Select Date'}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {appText.select_time || 'Select Time'}
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {appText.comment || 'Any notes about order'}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              placeholder={appText.comment || 'Special instructions...'}
            />
          </div>
        </div>

        {/* Delivery Address */}
        {orderType === '1' && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-pink-600" />
              {appText.persoanl_info || 'Select Address'}
            </h3>

            {addresses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">{appText.address_msg || 'No saved addresses'}</p>
                <button
                  onClick={() => router.push('/address')}
                  className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  {appText.address_add || 'Add Address'}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                      selectedAddress == addr.id
                        ? 'border-pink-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddress == addr.id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{addr.address}</p>
                      {addr.landmark && (
                        <p className="text-sm text-gray-500">Near: {addr.landmark}</p>
                      )}
                    </div>
                  </label>
                ))}
                <button
                  onClick={() => router.push('/address')}
                  className="w-full py-2 text-pink-600 border-2 border-pink-600 rounded-lg hover:bg-blue-50"
                >
                  {appText.address_add || '+ Add New Address'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold mb-4">Order Summary</h3>
          
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{checkoutData.currency}{checkoutData.total || 0}</span>
            </div>
            
            {orderType === '1' && (
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charges</span>
                <span className="font-semibold">
                  {recalculating ? (
                    <span className="text-xs text-gray-400">Calculating...</span>
                  ) : (
                    <span>{checkoutData.currency}{deliveryCharges}</span>
                  )}
                </span>
              </div>
            )}
            
            {taxValue > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">{checkoutData.store?.tax_name || 'VAT'}</span>
                <span className="font-semibold">{checkoutData.currency}{taxValue}</span>
              </div>
            )}
            
            <div className="border-t pt-2 flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-pink-600">{checkoutData.currency}{getTotal()}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold mb-2">
            <span>{appText.payment_method || 'Payment Method'}</span>
          </h3>

          {/* eCash Option */}
          {userData && parseFloat(userData.wallet) > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm mb-2">
                {appText.ecash_desc || 'You have eCash in your Wallet'}{' '}
                <span className="font-bold text-pink-600">
                  {settings.currency || '₱'}{walletBalance.toFixed(2)}
                </span>
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useEcash}
                  onChange={handleUseEcash}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">
                  {appText.use_ecash || 'Use eCash'}
                </span>
              </label>
            </div>
          )}

          {getTotalPayable() > 0 && (
            <div className="space-y-2">
              {/* Cash on Delivery */}
              {(settings.cod === 0 || !settings.cod) && (
                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentMethod === '1'
                      ? 'border-pink-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="1"
                    checked={paymentMethod === '1'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <Wallet className="w-5 h-5" />
                  <span className="flex-1 font-medium">
                    {appText.cod || 'Cash on Delivery'}
                  </span>
                </label>
              )}

              {/* Stripe */}
              {settings.stripe_key && (
                <label
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                    paymentMethod === '2'
                      ? 'border-pink-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="2"
                    checked={paymentMethod === '2'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <CreditCard className="w-5 h-5" />
                  <span className="flex-1 font-medium">
                    {appText.stripe || 'Pay via Bank Cards'}
                  </span>
                </label>
              )}

              {/* Stripe Card Details */}
              {paymentMethod === '2' && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <p className="font-medium text-sm">{appText.stripe_title || 'Enter Card Details'}</p>
                  <input
                    type="text"
                    placeholder={appText.card_no || 'Card Number'}
                    value={cardNo}
                    onChange={(e) => setCardNo(e.target.value.replace(/\D/g, '').slice(0, 16))}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder={appText.exp_month || 'MM'}
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder={appText.exp_year || 'YYYY'}
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder={appText.cvv || 'CVV'}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      className="px-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* GCash QR Payment */}
              {(checkoutData?.store?.gcash_enabled === 1 || 
                checkoutData?.data?.[0]?.gcash_enabled === 1 ||
                settings?.gcash_enabled === 1) && (
                <>
                  <label
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === '5'
                        ? 'border-pink-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="5"
                      checked={paymentMethod === '5'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v10H7V7zm2 2v6h6V9H9z"/>
                    </svg>
                    <span className="flex-1 font-medium">GCash QR Payment</span>
                  </label>

                  {/* GCash QR and Upload Section */}
                  {paymentMethod === '5' && (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                      <div className="text-center">
                        <p className="font-medium text-sm mb-3">Scan QR Code to Pay</p>
                        {(checkoutData?.store?.gcash_qr_image || 
                          checkoutData?.data?.[0]?.gcash_qr_image ||
                          settings?.gcash_qr_image) && (
                          <img 
                            src={`https://bsitport2026.com/servex/${
                              checkoutData?.store?.gcash_qr_image || 
                              checkoutData?.data?.[0]?.gcash_qr_image ||
                              settings?.gcash_qr_image
                            }`}
                            alt="GCash QR Code" 
                            className="max-w-xs mx-auto rounded-lg border-2 border-gray-300"
                          />
                        )}
                      </div>
                      
                      <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Proof of Payment *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setGcashProof(e.target.files?.[0] || null)}
                          className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-pink-600 file:text-white hover:file:bg-pink-700"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Please upload a screenshot of your payment confirmation
                        </p>
                        {gcashProof && (
                          <p className="text-sm text-green-600 mt-2">
                            ✓ File selected: {gcashProof.name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Total Summary */}
          {ecashAmount > 0 && (
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{settings.currency || '₱'}{getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>eCash Used:</span>
                <span>- {settings.currency || '₱'}{ecashAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total Payable:</span>
                <span className="text-pink-600">
                  {settings.currency || '₱'}{getTotalPayable().toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={!isFormValid() || loading}
          className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : appText.book_now || 'Place Order'}
        </button>
      </div>
    </div>
  );
}
