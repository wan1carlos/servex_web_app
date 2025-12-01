'use client';

import { useState } from 'react';
import servexApi from '@/lib/api';

export default function ApiTestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testHomepage = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ensure localStorage is set
      localStorage.setItem('lid', '1');
      localStorage.setItem('city_id', '1');
      localStorage.setItem('current_lat', '14.5995');
      localStorage.setItem('current_lng', '120.9842');
      
      const response = await servexApi.homepage({ cateId: '0', storeType: '0' });
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      console.error('API Test Error:', err);
      setResult(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  const testCity = async () => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('lid', '1');
      const response = await servexApi.city();
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setResult(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  const testPages = async () => {
    setLoading(true);
    setError(null);
    try {
      localStorage.setItem('lid', '1');
      const response = await servexApi.page();
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      setResult(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Current LocalStorage Values:</h2>
        <div className="bg-gray-50 p-4 rounded text-sm space-y-1 font-mono">
          <div>lid: {localStorage.getItem('lid') || 'not set'}</div>
          <div>city_id: {localStorage.getItem('city_id') || 'not set'}</div>
          <div>user_id: {localStorage.getItem('user_id') || 'not set'}</div>
          <div>cart_no: {localStorage.getItem('cart_no') || 'not set'}</div>
          <div>current_lat: {localStorage.getItem('current_lat') || 'not set'}</div>
          <div>current_lng: {localStorage.getItem('current_lng') || 'not set'}</div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h2 className="text-xl font-bold">Test API Endpoints:</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={testHomepage}
            disabled={loading}
            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 disabled:opacity-50"
          >
            Test Homepage API
          </button>
          <button
            onClick={testCity}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Test City API
          </button>
          <button
            onClick={testPages}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Test Pages API
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <div className="animate-spin w-8 h-8 border-4 border-pink-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-6">
          <h3 className="font-bold text-red-900 mb-2">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-lg mb-4">API Response:</h3>
          <pre className="bg-gray-50 p-4 rounded overflow-auto text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
