'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import servexDeliveryApi from '@/lib/delivery-api';
import toast from 'react-hot-toast';

interface Language {
  id: string;
  name: string;
  img: string;
}

export default function DeliveryLangPage() {
  const router = useRouter();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLid, setSelectedLid] = useState('0');
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState<any>(null);

  useEffect(() => {
    // Get current language ID
    const currentLid = localStorage.getItem('lid');
    if (currentLid) {
      setSelectedLid(currentLid);
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await servexDeliveryApi.getLang(selectedLid);

      if (response.data) {
        setLanguages(response.data);
      }

      if (response.text) {
        setText(response.text);
      }

      if (response.setting) {
        localStorage.setItem('setting', JSON.stringify(response.setting));
      }
    } catch (error) {
      console.error('Error loading languages:', error);
      toast.error('Failed to load languages');
    } finally {
      setLoading(false);
    }
  };

  const handleSetLanguage = async () => {
    try {
      setLoading(true);
      const response = await servexDeliveryApi.getLang(selectedLid);

      if (response.text) {
        localStorage.setItem('app_text', JSON.stringify(response.text));
      }

      if (response.data) {
        localStorage.setItem('lang_data', JSON.stringify(response.data));
      }

      localStorage.setItem('lid', selectedLid);

      toast.success('Language updated successfully!');

      // Check if user is logged in
      const userId = localStorage.getItem('delivery_user_id');
      if (userId && userId !== 'null') {
        router.push('/delivery/home');
      } else {
        router.push('/delivery/login');
      }
    } catch (error) {
      console.error('Error setting language:', error);
      toast.error('Failed to set language');
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        </div>

        {/* Language Selection */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {text.lang_title || 'Select Language'}
            </h1>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="space-y-3 mb-8">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLid(lang.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      selectedLid === lang.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={lang.img}
                        alt={lang.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-flag.png';
                        }}
                      />
                    </div>
                    <span className="flex-1 text-left font-medium text-gray-900">
                      {lang.name}
                    </span>
                    {selectedLid === lang.id && (
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleSetLanguage}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : text.update_lang || 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
