'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Minus, Plus, Trash2, Tag, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart-store';
import { useAuth } from '@/lib/auth-store';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cartData, items, loadCart, updateCartItem, isLoading } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.error('Please login to view your cart');
      router.push('/login');
      return;
    }
    
    loadCart();
  }, [isAuthenticated, loadCart, router]);

  const handleUpdateQuantity = async (cartId: string, type: number) => {
    await updateCartItem(cartId, type);
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!cartData || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add items to get started</p>
        <Link
          href="/home"
          className="inline-block bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex gap-4">
                  <img
                    src={item.img}
                    alt={item.item}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.item}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Price: {cartData.currency}{item.price} | Qty: {item.qty} {item.qtyName}
                    </p>
                    
                    {item.addon && item.addon.length > 0 && (
                      <div className="text-sm text-gray-500 mb-2">
                        {item.addon.map((addon, idx) => (
                          <div key={idx}>
                            + {addon.name} - {cartData.currency}{addon.price}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 0)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold">{item.qty}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 0)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{cartData.currency}{cartData.item_total || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-semibold">{cartData.currency}{cartData.d_charges || 0}</span>
                </div>
                
                {cartData.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-semibold">-{cartData.currency}{cartData.discount}</span>
                  </div>
                )}
                
                {cartData.tax_value > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{cartData.tax_name || 'Tax'}</span>
                    <span className="font-semibold">{cartData.currency}{cartData.tax_value}</span>
                  </div>
                )}
                
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-pink-600">{cartData.currency}{cartData.total || 0}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  // Save checkout data to localStorage like mobile app does
                  const checkoutData = {
                    data: items,
                    total: cartData.total,
                    d_charges: cartData.d_charges,
                    discount: 0,
                    currency: cartData.currency
                  };
                  localStorage.setItem('checkout_data', JSON.stringify(checkoutData));
                  router.push('/checkout');
                }}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 mb-3"
              >
                Proceed to Checkout
              </button>
              
              <Link
                href="/home"
                className="block w-full text-center border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
              >
                Continue Shopping
              </Link>
              
              {/* Coupon Section */}
              <div className="mt-6">
                <button className="w-full flex items-center justify-center space-x-2 text-pink-600 border border-pink-600 py-2 rounded-lg hover:bg-blue-50">
                  <Tag className="w-4 h-4" />
                  <span>Apply Coupon</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
