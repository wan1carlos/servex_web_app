'use client';

import Link from 'next/link';
import { ArrowRight, Store, Clock, Shield, Bike } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home if user is already logged in
    const userId = localStorage.getItem('user_id');
    if (userId && userId !== 'null' && userId !== 'undefined') {
      router.replace('/home');
    }
  }, [router]);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Malolos' #1 On-Demand Delivery Service
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Order from your favorite Malolos stores and restaurants. Serving Sumapang Bayan, Atlag, Barasoain, and all barangays in Malolos, Bulacan!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/home"
                  className="bg-white text-pink-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 transition"
                >
                  <span>Start Ordering</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/about"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-pink-600 flex items-center justify-center transition"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-50"></div>
                <img 
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop" 
                  alt="Delivery Service" 
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120">
            <path fill="#ffffff" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Malolos Chooses ServEx
            </h2>
            <p className="text-xl text-gray-600">
              Your trusted local delivery partner in Bulacan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <Store className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Local Malolos Stores</h3>
              <p className="text-gray-600">
                Support your favorite Malolos businesses - from SM City Malolos to local eateries and sari-sari stores.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">30-Min Delivery</h3>
              <p className="text-gray-600">
                Fast delivery across Malolos - from Barasoain Church area to Capitol Centrum in 30 minutes or less!
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Secure Payment</h3>
              <p className="text-gray-600">
                Multiple payment options with secure checkout and data protection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">200+</div>
              <div className="text-gray-600">Malolos Partner Stores</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">15K+</div>
              <div className="text-gray-600">Happy Bulakeños</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">30K+</div>
              <div className="text-gray-600">Deliveries in Malolos</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">4.9</div>
              <div className="text-gray-600">Local Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-pink-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Choose Local Store</h3>
              <p className="text-gray-600">
                Browse Malolos favorites - from SM City food court to your neighborhood turo-turo and restaurants.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-pink-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Place Order</h3>
              <p className="text-gray-600">
                Add items to cart, apply coupons, and checkout with your preferred payment method.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-pink-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Delivered to Your Barangay</h3>
              <p className="text-gray-600">
                Track your order and get it delivered anywhere in Malolos - Sumapang Bayan, Atlag, or any barangay!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Store Partner Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                FOR STORE OWNERS
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Grow Your Business with ServEx
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join Malolos' leading delivery platform and reach more customers in your barangay and beyond. Manage orders, track deliveries, and grow your revenue with our easy-to-use store dashboard.
              </p>
              <ul className="space-y-4 mb-8 text-gray-700">
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg">Real-time order management dashboard</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg">Reach customers across all Malolos barangays</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg">Flexible delivery options - your riders or ours</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg">Easy setup with ongoing support</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/store/signup"
                  className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-700 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 transition"
                >
                  <Store className="w-5 h-5" />
                  <span>Apply as Store Partner</span>
                </Link>
                <Link 
                  href="/store/login"
                  className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-green-600 hover:text-white flex items-center justify-center space-x-2 transition"
                >
                  <span>Store Login</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 rounded-3xl blur-3xl opacity-30"></div>
                <img 
                  src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?w=600&h=600&fit=crop" 
                  alt="Store Management" 
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Rider Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-30"></div>
                <img 
                  src="https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&h=600&fit=crop" 
                  alt="Delivery Rider" 
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                FOR DELIVERY RIDERS
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                Earn Flexible Income as a Delivery Rider
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Join our growing team of delivery riders in Malolos. Set your own schedule, earn competitive rates, and be part of Bulacan's leading delivery platform.
              </p>
              <ul className="space-y-4 mb-8 text-gray-700">
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg">Flexible working hours - work when you want</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg">Competitive per-delivery rates plus tips</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg">Weekly payouts directly to your account</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-lg">Motorcycle or bicycle - all welcome</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/contact"
                  className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 shadow-lg transform hover:scale-105 transition justify-center"
                >
                  <Bike className="w-5 h-5 mr-2" />
                  <span>Apply as a Rider</span>
                </Link>
                <Link 
                  href="/delivery/login"
                  className="inline-flex items-center border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-600 hover:text-white transition justify-center"
                >
                  <span>Rider Login</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Proud to Serve Malolos, Bulacan!
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of Bulakeños enjoying convenient delivery from local Malolos stores!
          </p>
          <Link 
            href="/signup"
            className="inline-block bg-white text-pink-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 shadow-lg transform hover:scale-105 transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>
    </div>
  );
}

