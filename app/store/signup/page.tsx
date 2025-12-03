'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock, Store, User, MapPin, ArrowLeft, Check, CreditCard, Wallet } from 'lucide-react';
import { servexStoreApi } from '@/lib/store-api';
import toast from 'react-hot-toast';

interface Plan {
  id: number;
  name: string;
  desc: string;
  price: number;
  time: string;
  feat: string[];
  currency: string;
}

interface SettingData {
  stripe_key?: string;
  razor_key?: string;
  bank_transfer?: string;
  currency_code?: string;
  term?: string;
}

export default function StoreSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  
  // Plans and payment
  const [plans, setPlans] = useState<Plan[]>([]);
  const [settings, setSettings] = useState<SettingData>({});
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<number>(0); // 0=Cash, 2=Stripe, 3=Bank, 4=Razor
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Stripe fields
  const [cardNo, setCardNo] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Bank transfer note
  const [bankNote, setBankNote] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await servexStoreApi.plan();
      
      if (response.data) {
        // Parse features if they're stored as strings
        const parsedPlans = response.data.plan.map((plan: any) => ({
          ...plan,
          feat: typeof plan.feat === 'string' ? JSON.parse(plan.feat) : plan.feat
        }));
        setPlans(parsedPlans);
        setSettings(response.data.setting || {});
      }
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlanId(plan.id);
    setSelectedPlan(plan);
    
    // Reset payment method if plan is free
    if (plan.price === 0) {
      setPaymentMethod(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !address || !password) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!selectedPlanId) {
      toast.error('Please select a subscription plan');
      return;
    }
    
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    
    if (selectedPlan && selectedPlan.price > 0) {
      if (paymentMethod === 2 && (!cardNo || !expMonth || !expYear || !cvv)) {
        toast.error('Please fill in all card details');
        return;
      }
      
      if (paymentMethod === 3 && !bankNote) {
        toast.error('Please provide bank transfer details');
        return;
      }
    }

    try {
      setLoading(true);
      
      const signupData = {
        data: {
          name,
          phone,
          address,
          password,
          notes: bankNote
        },
        plan_id: selectedPlanId,
        payment_method: selectedPlan?.price === 0 ? 2 : paymentMethod,
        payment_id: selectedPlan?.price === 0 ? 'Trial_Pack' : '0'
      };
      
      // Note: In production, you would handle Stripe/Razor payments here
      // For now, we'll just send the signup request
      const response = await servexStoreApi.signup(signupData);
      
      if (response.data === 'done') {
        toast.success('Store registered successfully! Please wait for admin approval.');
        router.push('/store/login');
      } else {
        toast.error('Phone number is already registered');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Failed to register store');
    } finally {
      setLoading(false);
    }
  };

  if (loadingPlans) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Link href="/store/login" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Login
          </Link>

          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Store className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center mb-2">Register Your Store</h2>
          <p className="text-gray-600 text-center mb-8">Join our platform and grow your business</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Store Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter store name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter complete store address"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Subscription Plans */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Choose Your Plan *</h3>
              
              <div className="grid gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan)}
                    className={`border-2 rounded-xl p-6 cursor-pointer transition ${
                      selectedPlanId === plan.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
                      <div className="bg-green-600 text-white px-4 py-1 rounded-full font-semibold">
                        {plan.currency}{plan.price}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{plan.desc}</p>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">
                        <Check className="w-4 h-4 inline mr-2 text-green-600" />
                        Time Period: {plan.time}
                      </p>
                      {plan.feat && plan.feat.map((feature: string, idx: number) => (
                        <p key={idx} className="text-sm text-gray-600">
                          <Check className="w-4 h-4 inline mr-2 text-green-600" />
                          {feature}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            {selectedPlan && selectedPlan.price > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                
                <div className="space-y-3">
                  {/* Cash Payment */}
                  <div
                    onClick={() => setPaymentMethod(0)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      paymentMethod === 0
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Wallet className="w-5 h-5 mr-3 text-gray-600" />
                      <span className="font-medium">Pay with Cash</span>
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div
                    onClick={() => setPaymentMethod(3)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                      paymentMethod === 3
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Wallet className="w-5 h-5 mr-3 text-gray-600" />
                      <span className="font-medium">Bank Transfer</span>
                    </div>
                    {settings.bank_transfer && (
                      <div 
                        className="text-sm text-gray-600 ml-8"
                        dangerouslySetInnerHTML={{ __html: settings.bank_transfer }}
                      />
                    )}
                  </div>

                  {/* Stripe */}
                  {settings.stripe_key && (
                    <div
                      onClick={() => setPaymentMethod(2)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        paymentMethod === 2
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-3 text-gray-600" />
                        <span className="font-medium">Pay via Bank Cards</span>
                      </div>
                    </div>
                  )}

                  {/* Razorpay */}
                  {settings.razor_key && (
                    <div
                      onClick={() => setPaymentMethod(4)}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        paymentMethod === 4
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Wallet className="w-5 h-5 mr-3 text-gray-600" />
                        <span className="font-medium">Razorpay</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stripe Card Details */}
                {paymentMethod === 2 && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <p className="font-medium text-sm">Enter Card Details</p>
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={cardNo}
                      onChange={(e) => setCardNo(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      className="w-full px-4 py-2 border rounded-lg"
                      maxLength={16}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="MM"
                        value={expMonth}
                        onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                        className="px-4 py-2 border rounded-lg"
                        maxLength={2}
                      />
                      <input
                        type="text"
                        placeholder="YYYY"
                        value={expYear}
                        onChange={(e) => setExpYear(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="px-4 py-2 border rounded-lg"
                        maxLength={4}
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        className="px-4 py-2 border rounded-lg"
                        maxLength={3}
                      />
                    </div>
                  </div>
                )}

                {/* Bank Transfer Note */}
                {paymentMethod === 3 && (
                  <div>
                    <input
                      type="text"
                      placeholder="Transaction ID or Notes"
                      value={bankNote}
                      onChange={(e) => setBankNote(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label className="text-sm text-gray-600">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="text-green-600 hover:underline font-medium"
                >
                  Terms and Conditions
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Registering...' : 'Register Store'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/store/login" className="text-green-600 hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-2xl font-bold text-gray-900">Terms and Conditions</h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-6 text-gray-700">
              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">1. Introduction</h4>
                <p className="leading-relaxed">
                  Welcome to ServEx Store Partnership Program. These Terms and Conditions ("Agreement") govern your participation as a store partner on the ServEx platform. By registering your store, you agree to be bound by these terms.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">2. Eligibility</h4>
                <p className="leading-relaxed mb-2">To become a store partner, you must:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Be a legally registered business in the Philippines</li>
                  <li>Have all necessary permits and licenses to operate</li>
                  <li>Be located within Malolos, Bulacan or surrounding areas</li>
                  <li>Provide accurate and complete information during registration</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">3. Store Obligations</h4>
                <p className="leading-relaxed mb-2">As a store partner, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Maintain accurate product listings with current prices and availability</li>
                  <li>Honor all orders received through the platform</li>
                  <li>Prepare orders within the specified timeframe</li>
                  <li>Maintain quality standards for all products and services</li>
                  <li>Comply with all applicable food safety and health regulations</li>
                  <li>Respond promptly to customer inquiries and complaints</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">4. Commission and Payments</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>ServEx charges a commission on each order as per your selected subscription plan</li>
                  <li>Payments will be processed according to the agreed payment schedule</li>
                  <li>All prices must include applicable taxes (VAT)</li>
                  <li>Subscription fees are non-refundable once the billing period has started</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">5. Cancellations and Refunds</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You may cancel orders only for valid reasons (out of stock, force majeure)</li>
                  <li>Excessive cancellations may result in suspension or termination</li>
                  <li>Customer refunds will be processed according to ServEx policies</li>
                  <li>You are responsible for refunds due to store errors or quality issues</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">6. Delivery Services</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You may use your own delivery personnel or ServEx delivery partners</li>
                  <li>Delivery charges are calculated based on distance and your settings</li>
                  <li>You are responsible for ensuring timely order preparation</li>
                  <li>ServEx is not liable for delays caused by store preparation time</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">7. Intellectual Property</h4>
                <p className="leading-relaxed">
                  You grant ServEx a non-exclusive license to use your store name, logo, and product images for marketing and promotional purposes on the platform. You retain all ownership rights to your intellectual property.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">8. Data Protection and Privacy</h4>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Both parties will comply with applicable data protection laws</li>
                  <li>Customer data may only be used for order fulfillment</li>
                  <li>You must maintain confidentiality of customer information</li>
                  <li>ServEx will protect your business information per our Privacy Policy</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">9. Suspension and Termination</h4>
                <p className="leading-relaxed mb-2">ServEx may suspend or terminate your account for:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violation of these terms</li>
                  <li>Fraudulent or illegal activities</li>
                  <li>Consistent poor performance or customer complaints</li>
                  <li>Non-payment of fees</li>
                  <li>Closure or sale of your business</li>
                </ul>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">10. Limitation of Liability</h4>
                <p className="leading-relaxed">
                  ServEx provides the platform "as is" and is not liable for indirect, incidental, or consequential damages. Our total liability is limited to the fees paid in the preceding three months.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">11. Modifications</h4>
                <p className="leading-relaxed">
                  ServEx reserves the right to modify these terms with 30 days notice. Continued use of the platform after modifications constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">12. Governing Law</h4>
                <p className="leading-relaxed">
                  This Agreement is governed by the laws of the Republic of the Philippines. Any disputes shall be resolved in the courts of Malolos, Bulacan.
                </p>
              </section>

              <section>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">13. Contact Information</h4>
                <p className="leading-relaxed">
                  For questions about these terms, please contact us at:<br />
                  Email: servex112825@gmail.com<br />
                  Phone: +63 951 982 6577<br />
                  Address: Km. 44, McArthur Highway, Barangay Longos, City of Malolos, Bulacan
                </p>
              </section>

              <p className="text-sm text-gray-500 italic mt-6">
                Last Updated: December 3, 2025
              </p>
            </div>

            <div className="border-t p-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setAcceptedTerms(true);
                  setShowTermsModal(false);
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
