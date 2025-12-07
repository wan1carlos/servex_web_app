'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryAuth } from '@/lib/delivery-auth-store';
import servexDeliveryApi from '@/lib/delivery-api';

interface PageData {
  title: string;
  description: string;
  [key: string]: any;
}

export default function DeliveryContactPage() {
  const router = useRouter();
  const { isAuthenticated } = useDeliveryAuth();
  const [data, setData] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState<any>(null);

  useEffect(() => {
    // Load language text
    const appText = localStorage.getItem('app_text');
    if (appText) {
      setText(JSON.parse(appText));
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await servexDeliveryApi.page();

      if (response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Error loading contact data:', error);
    } finally {
      setLoading(false);
    }
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
              {text.contact || 'Contact & Support'}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {data && data.length > 0 ? (
              data.map((page, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{page.title}</h2>
                  <div 
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: page.description }}
                  />
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {text.contact_us || 'Contact Us'}
                </h3>
                <p className="text-gray-600">
                  {text.contact_desc || 'For support and inquiries, please contact our team.'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
