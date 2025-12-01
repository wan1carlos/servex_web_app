'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Star, Clock, MapPin, TrendingUp, Map } from 'lucide-react';
import servexApi from '@/lib/api';
import { useApp } from '@/lib/app-store';
import { useCart } from '@/lib/cart-store';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';

// Dynamic import for map to avoid SSR issues
const StoresMap = dynamic(() => import('@/components/StoresMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-200 rounded-xl flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    </div>
  ),
});

export default function HomePage() {
  const router = useRouter();
  const { setAppText, setSettings, currentAddress, setLocation } = useApp();
  const { initializeCart } = useCart();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('0');
  const [storeType, setStoreType] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    // FORCE CLEAR problematic values that were set incorrectly
    // Remove lid and city_id if they were set to '1'
    const lid = localStorage.getItem('lid');
    const cityId = localStorage.getItem('city_id');
    
    if (lid === '1') {
      localStorage.removeItem('lid');
    }
    if (cityId === '1') {
      localStorage.removeItem('city_id');
    }
    
    initializeCart();
    requestLocation();
    loadData();
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toString();
          const lng = position.coords.longitude.toString();
          localStorage.setItem('current_lat', lat);
          localStorage.setItem('current_lng', lng);
          
          const address = `${lat.substring(0, 7)}, ${lng.substring(0, 8)}`;
          setLocation(lat, lng, address);
          localStorage.setItem('current_add', address);
        },
        (error) => {
          console.log('Location permission denied or unavailable');
        }
      );
    }
  };

  const loadData = async (cateId = '0', type = '0') => {
    try {
      setLoading(true);
      const response = await servexApi.homepage({ cateId, storeType: type });
      
      if (response && response.data) {
        setData(response.data);
        setAppText(response.data.text || {});
        setSettings(response.data.setting || {});
        
        // Store text and settings in localStorage like mobile app does
        localStorage.setItem('app_text', JSON.stringify(response.data.text));
        localStorage.setItem('setting', JSON.stringify(response.data.setting));
      }
    } catch (error: any) {
      console.error('Error loading homepage:', error);
      toast.error('Failed to load stores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    loadData(categoryId, storeType);
  };

  const handleStoreTypeChange = (type: string) => {
    setStoreType(type);
    loadData(selectedCategory, type);
  };

  const filteredStores = data?.store?.filter((store: any) =>
    store.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Location Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-pink-600" />
            <span className="text-sm font-medium">Delivering to:</span>
            <span className="text-sm text-gray-600">{currentAddress}</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowMapModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">View Map</span>
            </button>
            <button 
              onClick={() => router.push('/location')}
              className="text-sm text-pink-600 hover:underline"
            >
              Change
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search stores, restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Store Type Tabs */}
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => handleStoreTypeChange('0')}
            className={`px-6 py-2 rounded-full whitespace-nowrap ${
              storeType === '0'
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleStoreTypeChange('1')}
            className={`px-6 py-2 rounded-full whitespace-nowrap ${
              storeType === '1'
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Restaurants
          </button>
          <button
            onClick={() => handleStoreTypeChange('2')}
            className={`px-6 py-2 rounded-full whitespace-nowrap ${
              storeType === '2'
                ? 'bg-pink-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Grocery
          </button>
        </div>

        {/* Categories */}
        {data?.category && data.category.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Categories</h2>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {data.category.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex flex-col items-center p-4 rounded-lg transition ${
                    selectedCategory === cat.id
                      ? 'bg-blue-50 border-2 border-pink-600'
                      : 'bg-white hover:shadow-md'
                  }`}
                >
                  <img src={cat.img} alt={cat.name} className="w-12 h-12 object-cover rounded-lg mb-2" />
                  <span className="text-xs text-center font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Banner */}
        {data?.banner && data.banner.length > 0 && (
          <div className="mb-8">
            <div className="relative h-48 md:h-64 rounded-xl overflow-hidden">
              <img
                src={data.banner[0].img}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Stores Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {selectedCategory === '0' ? 'All Stores' : 'Filtered Stores'}
          </h2>
          
          {filteredStores.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">🏪</div>
              <p className="text-gray-500 mb-4">No stores found</p>
              <p className="text-sm text-gray-400 mb-4">
                This could be due to:
              </p>
              <ul className="text-sm text-gray-400 space-y-1 mb-6">
                <li>• No stores available in your area</li>
                <li>• API server is temporarily unavailable</li>
                <li>• Network connection issue</li>
              </ul>
              <button
                onClick={() => loadData(selectedCategory, storeType)}
                className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store: any) => (
                <Link
                  key={store.id}
                  href={`/store/${store.id}`}
                  className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={store.img}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                    {!store.open && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <span className="text-white font-bold">CLOSED</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{store.name}</h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{store.rating || '4.5'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{store.delivery_time || '30-40 min'}</span>
                      </div>
                    </div>
                    
                    {store.distance && (
                      <p className="text-sm text-gray-500">📍 {store.distance} km away</p>
                    )}
                    
                    {store.delivery_charges > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        Delivery: ₱{store.delivery_charges}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Trending Section */}
        {data?.trend && data.trend.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-6 h-6 text-pink-600" />
              <h2 className="text-2xl font-bold">Trending Items</h2>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              {data.trend.slice(0, 4).map((item: any) => (
                <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <img src={item.img} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                  <h4 className="font-semibold text-sm">{item.name}</h4>
                  <p className="text-pink-600 font-bold text-lg">₱{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowMapModal(false)}
            ></div>

            {/* Modal content */}
            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Map className="w-6 h-6 text-pink-600" />
                    Nearby Stores
                  </h3>
                  <button
                    onClick={() => setShowMapModal(false)}
                    className="text-gray-400 hover:text-gray-500 text-3xl leading-none"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mt-4" style={{ height: '70vh' }}>
                  <StoresMap
                    stores={data?.store || []}
                    center={{
                      lat: parseFloat(localStorage.getItem('current_lat') || '14.6760'),
                      lng: parseFloat(localStorage.getItem('current_lng') || '121.0437'),
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
