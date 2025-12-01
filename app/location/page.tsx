'use client';

import { useEffect, useState, useRef } from 'react';
import { MapPin, Search, Navigation, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Import Leaflet dynamically to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/LocationMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-200 rounded-xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    </div>
  ),
});

export default function LocationPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [currentLat, setCurrentLat] = useState<number | null>(null);
  const [currentLng, setCurrentLng] = useState<number | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load saved location if exists
    const savedLat = localStorage.getItem('current_lat');
    const savedLng = localStorage.getItem('current_lng');
    const savedAddress = localStorage.getItem('current_add');

    if (savedLat && savedLng && savedLat !== 'null' && savedLng !== 'null') {
      setCurrentLat(parseFloat(savedLat));
      setCurrentLng(parseFloat(savedLng));
      if (savedAddress) setAddress(savedAddress);
    }
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
          
          // Reverse geocode to get address
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
          alert('Unable to get your location. Please enable location services.');
          setIsLocating(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setIsLocating(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=ph`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setCurrentLat(lat);
        setCurrentLng(lng);
        setAddress(data[0].display_name);
        setShowSuggestions(false);
        setSuggestions([]);
      } else {
        alert('Location not found. Please try a different search.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching for location');
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search if query is too short
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      console.log('Searching for:', value);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&countrycodes=ph&limit=5&addressdetails=1`
        );
        const data = await response.json();
        console.log('Search results:', data);
        setSuggestions(data || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Search suggestions error:', error);
      }
    }, 300);
  };

  const handleSuggestionClick = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    setCurrentLat(lat);
    setCurrentLng(lng);
    setAddress(suggestion.display_name);
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
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

  const handleSaveLocation = () => {
    if (!currentLat || !currentLng) {
      alert('Please select a location first');
      return;
    }

    // Save to localStorage like mobile app does
    localStorage.setItem('current_lat', currentLat.toString());
    localStorage.setItem('current_lng', currentLng.toString());
    localStorage.setItem('current_add', address);
    
    // Redirect to home
    router.push('/home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-pink-600 text-white p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Select Location</h1>
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
                placeholder="Search Philippines (e.g., Barasoain Church Malolos, SM Manila, Quezon City)"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                autoComplete="off"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-80 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.place_id}-${index}`}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-pink-50 border-b border-gray-100 last:border-b-0 transition flex items-start gap-3"
                    >
                      <MapPin className="w-5 h-5 text-pink-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {suggestion.name || suggestion.display_name.split(',')[0]}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {suggestion.display_name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {/* Loading indicator */}
              {searchQuery.length >= 2 && suggestions.length === 0 && showSuggestions && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                  Searching...
                </div>
              )}
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
            {isLocating ? 'Locating...' : 'Locate Me'}
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

        {/* Address Details */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-pink-600" />
            Your Address
          </h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Enter your address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Near Landmark (Optional)
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
            onClick={handleSaveLocation}
            className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-semibold"
          >
            Save Location
          </button>
        </div>
      </div>
    </div>
  );
}
