'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Clock, MapPin, Search, Plus } from 'lucide-react';
import servexApi from '@/lib/api';
import { useCart } from '@/lib/cart-store';
import { useAuth } from '@/lib/auth-store';
import { toast } from 'react-hot-toast';

export default function StorePage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const { addToCart } = useCart();
  const { userId } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('0');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (params?.id) {
      loadStore(params.id);
    }
  }, [params?.id]);

  const loadStore = async (storeId: string) => {
    try {
      setLoading(true);
      const response = await servexApi.item(storeId);
      setData(response.data);
    } catch (error) {
      console.error('Error loading store:', error);
      toast.error('Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (item: any) => {
    // Check if item is out of stock (using !item.stock like mobile app)
    if (!item.stock) {
      toast.error('Sorry! This item is out of stock.');
      return;
    }

    // Check if user is logged in
    const userId = localStorage.getItem('user_id');
    if (!userId || userId === 'null' || userId === 'undefined') {
      toast.error('Please login to add items to cart');
      // Redirect to login page after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    const result = await addToCart({
      item_id: item.id,
      price: parseFloat(item.price),
      item_size_id: '0',
      addon: [],
    });

    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(result.message || 'Failed to add to cart');
    }
  };

  const filteredItems = data?.item?.filter((item: any) => {
    const matchesCategory = selectedCategory === '0' || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">Store not found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Store Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-start gap-6">
            <img
              src={data.store.img}
              alt={data.store.name}
              className="w-32 h-32 object-cover rounded-xl shadow-md"
            />
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{data.store.name}</h1>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{data.store.rating || '4.5'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{data.store.delivery_time || '30-40 min'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>Delivery: ₱{data.store.delivery_charges}</span>
                </div>
              </div>
              
              {!data.store.open && (
                <div className="inline-block bg-red-100 text-red-700 px-4 py-1 rounded-full text-sm font-semibold">
                  Currently Closed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Categories */}
        {data.category && data.category.length > 0 && (
          <div className="mb-8">
            <div className="flex space-x-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory('0')}
                className={`px-6 py-2 rounded-full whitespace-nowrap ${
                  selectedCategory === '0'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                All
              </button>
              {data.category.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-2 rounded-full whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item: any) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  {!item.stock && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">Out of Stock</span>
                    </div>
                  )}
                  {item.veg && (
                    <div className="absolute top-2 left-2 w-6 h-6 border-2 border-green-600 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-blue-600">₱{item.price}</span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!data.store.open || !item.stock}
                      className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
