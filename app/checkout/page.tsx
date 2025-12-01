'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Clock, CreditCard, Wallet, MessageSquare } from 'lucide-react';
import servexApi from '@/lib/api';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [appText, setAppText] = useState<any>({});
  const [settings, setSettings] = useState<any>({});
  
  // Form state
  const [orderType, setOrderType] = useState('1'); // 1=Delivery, 2=Pickup
  const [orderDate, setOrderDate] = useState('1'); // 1=Today, 2=Later
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [comment, setComment] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('1'); // 1=COD, 2=Stripe, 3=Razor, etc
  const [useEcash, setUseEcash] = useState(false);
  const [ecashAmount, setEcashAmount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  // Stripe fields
  const [cardNo, setCardNo] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');

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
    if (orderType === '2') { // Pickup - no delivery charges
      return checkoutData.total - (checkoutData.d_charges || 0);
    }
    return checkoutData.total;
  };

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
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!isFormValid()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        payment: paymentMethod,
        cart_no: localStorage.getItem('cart_no'),
        payment_id: '0',
        otype: orderType,
        odate: orderDate,
        order_date: orderDate === '2' ? selectedDate : '',
        order_time: orderDate === '2' ? selectedTime : '',
        user_id: localStorage.getItem('user_id'),
        address: selectedAddress,
        ecash: ecashAmount,
        comment: comment
      };

      const response = await servexApi.placeOrder(orderData);
      
      if (response.data) {
        localStorage.setItem('order_data', JSON.stringify(response.data));
        toast.success('Order placed successfully!');
        router.push(`/order/${response.data.data.id}`);
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
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

        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-bold mb-2 flex items-center justify-between">
            <span>{appText.payment_method || 'Payment Method'}</span>
            <span className="text-lg text-pink-600">
              {settings.currency || '₱'}{getTotal().toFixed(2)}
            </span>
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
