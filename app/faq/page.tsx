'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is ServeX?",
    answer: "ServeX is a hyperlocal ordering and delivery platform that connects customers, local businesses, and delivery riders within Malolos and nearby areas. It allows users to discover nearby shops, place orders online, and have them delivered to their location.",
    category: "General"
  },
  {
    question: "How does ServeX work for customers?",
    answer: "Customers create an account, browse local businesses and products, place an order, choose a payment method (COD or supported digital payments), then track the delivery in real time until it arrives.",
    category: "General"
  },
  {
    question: "What types of businesses are on ServeX?",
    answer: "ServeX supports a wide range of local businesses such as restaurants, bakeries, groceries, and small business stores that operate within Malolos and surrounding barangays.",
    category: "General"
  },
  {
    question: "How do I become a ServeX customer?",
    answer: "Simply sign up on the ServeX website or app, complete your profile with accurate address and contact details, then you can start browsing and placing orders immediately.",
    category: "Customer"
  },
  {
    question: "What payment methods do you accept?",
    answer: "ServeX currently supports Cash on Delivery (COD) and selected digital payment options (such as GCash QR code), depending on what is enabled by each business and our payment partners.",
    category: "Customer"
  },
  {
    question: "How does real-time order tracking work?",
    answer: "Once your order is confirmed and assigned to a rider, you can see the status updates (preparing, Driver Assigned, on the way, delivered) and view the rider's approximate location on a map until the order arrives.",
    category: "Customer"
  },
  {
    question: "How are delivery fees calculated?",
    answer: "Delivery fees are based on factors such as distance between the business and your address, and sometimes time of day or promotional discounts. The total delivery fee is always shown before you confirm your order.",
    category: "Customer"
  },
  {
    question: "How long will my delivery take?",
    answer: "Delivery times depend on the business preparation time, rider availability, and distance. An estimated delivery time is shown during checkout, and you can monitor updates in real time.",
    category: "Customer"
  },
  {
    question: "Can I cancel or change my order after placing it?",
    answer: "Order changes or cancellations are only possible within a short time window and may depend on whether the business has already started preparing your order or a rider has been dispatched. Please check your order status and contact support as soon as possible.",
    category: "Customer"
  },
  {
    question: "What happens if my order is wrong, delayed, or missing items?",
    answer: "If there is an issue with your order, you can report it through the order details page or contact our support team. We coordinate with the business and rider to resolve the issue, which may include replacement, partial refund, or other appropriate action.",
    category: "Customer"
  },
  {
    question: "How do ratings and reviews work?",
    answer: "After each completed order, customers can rate the business and rider and leave feedback. These ratings help improve service quality and help other users make informed choices.",
    category: "Customer"
  },
  {
    question: "Is my personal data safe with ServeX?",
    answer: "Yes. ServeX follows security best practices and complies with the Data Privacy Act of the Philippines. Your personal information is stored securely and used only for legitimate service-related purposes.",
    category: "Privacy & Security"
  },
  {
    question: "How can a business join ServeX?",
    answer: "Local business owners can apply through the \"Partner with ServeX\" section, submit basic business details and documents, and wait for verification. Once approved, they receive access to a dashboard to manage their storefront, products, and orders.",
    category: "Business"
  },
  {
    question: "What are the benefits for business owners?",
    answer: "ServeX helps local businesses gain online visibility, receive more orders, manage deliveries efficiently, and access basic sales analytics, without needing their own IT team or expensive marketing channels.",
    category: "Business"
  },
  {
    question: "How can I sign up as a delivery rider?",
    answer: "Interested riders can apply via the \"Apply as a Rider\" page, upload required documents, and attend verification or orientation as required. Approved riders receive access to the rider app to accept and complete delivery tasks.",
    category: "Rider"
  },
  {
    question: "What do riders need to start delivering?",
    answer: "Riders typically need a valid ID, mobile phone with internet access, a registered vehicle (if required), and the necessary local permits or documents as defined by ServeX policies.",
    category: "Rider"
  },
  {
    question: "Is ServeX available outside Malolos?",
    answer: "ServeX is currently focused on Malolos and nearby areas. Expansion to other cities will be announced on our website and official social media channels.",
    category: "General"
  },
  {
    question: "How does ServeX make money?",
    answer: "ServeX generates revenue primarily through affordable subscription plans for business owners. Partners pay a monthly fee for unlimited orders, premium visibility, and advanced analytics—keeping costs predictable and low for local merchants while ensuring platform sustainability.",
    category: "Business"
  },
  {
    question: "Who do I contact for support?",
    answer: "You can reach our support team through the \"Contact Us\" section on the website/app, where you can submit concerns about orders, payments, accounts, or technical issues.",
    category: "Support"
  },
  {
    question: "I found a bug or have a suggestion. What should I do?",
    answer: "We welcome feedback. Use the feedback form or support channel in the app/website to report bugs or suggest improvements, and our team will review them for future updates.",
    category: "Support"
  }
];

const categories = ["All", "General", "Customer", "Business", "Rider", "Privacy & Security", "Support"];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <HelpCircle className="w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-blue-100">Find answers to common questions about ServeX</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                selectedCategory === category
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results Count */}
        {searchTerm && (
          <p className="text-gray-600 mb-4">
            Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for "{searchTerm}"
          </p>
        )}

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-pink-300 transition"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition"
                >
                  <div className="flex-1 pr-4">
                    <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full mb-2">
                      {faq.category}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  </div>
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-pink-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 py-5 bg-gray-50 border-t-2 border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
