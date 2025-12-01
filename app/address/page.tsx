'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Navigation, MapPin, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import servexApi from '@/lib/api';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

const MapComponent = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-200 rounded-xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    </div>
  ),
});

export default function AddressPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appText, setAppText] = useState<any>({});

  useEffect(() => {
    // Check authentication
    const userId = localStorage.getItem('user_id');
    if (!userId || userId === 'null' || userId === 'undefined') {
      toast.error('Please login first');
      router.push('/login');
      return;
    }

    // Load app text
    const text = localStorage.getItem('app_text');
    if (text) setAppText(JSON.parse(text));

    // Get current location
    handleLocateMe();
  }, []);

  const handleLocateMe = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCurrentLat(lat);
          setCurrentLng(lng);
          
          // Reverse geocode
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              const addr = data.display_name || `${lat}, ${lng}`;
              setAddress(addr);
              setIsLocating(false);
            })
            .catch(() => {
              setAddress(`${lat}, ${lng}`);
              setIsLocating(false);
            });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location');
          setIsLocating(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported');
      setIsLocating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setCurrentLat(lat);
        setCurrentLng(lng);
        setAddress(data[0].display_name);
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching for location');
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setCurrentLat(lat);
    setCurrentLng(lng);
    
    // Reverse geocode
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        const addr = data.display_name || `${lat}, ${lng}`;
        setAddress(addr);
      })
      .catch(() => {
        setAddress(`${lat}, ${lng}`);
      });
  };

  const handleSaveAddress = async () => {
    if (!currentLat || !currentLng) {
      toast.error('Please select a location');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter an address');
      return;
    }

    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');
      
      const addressData = {
        user_id: userId,
        lat: currentLat,
        lng: currentLng,
        address: address,
        landmark: landmark
      };

      const response = await servexApi.saveAddress(addressData);
      
      if (response) {
        toast.success('Address saved successfully!');
        router.back();
      }
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-pink-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{appText.address_add || 'Add New Address'}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Search Box */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
          
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="mt-3 w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Navigation className="w-5 h-5" />
            {isLocating ? 'Locating...' : 'Use My Current Location'}
          </button>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <MapComponent
            lat={currentLat || 14.6760}
            lng={currentLng || 121.0437}
            onLocationSelect={handleMapClick}
          />
        </div>

        {/* Address Form */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-pink-600" />
            {appText.address_details || 'Address Details'}
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {appText.address || 'Address'} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter your complete address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {appText.landmark || 'Landmark'} (Optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter nearby landmark"
            />
          </div>

          <button
            onClick={handleSaveAddress}
            disabled={loading}
            className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : appText.save_address || 'Save Address'}
          </button>
        </div>
      </div>
    </div>
  );
}
