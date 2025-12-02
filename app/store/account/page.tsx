'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStoreAuth } from '@/lib/store-auth-store';
import { servexStoreApi } from '@/lib/store-api';
import { 
  ArrowLeft, 
  Store, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  Lock,
  Save,
  Loader2,
  Package,
  Settings,
  Truck,
  ShoppingBag,
  DollarSign,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function StoreAccount() {
  const router = useRouter();
  const { checkAuth, storeData: authStoreData, logout } = useStoreAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'items'>('profile');
  
  // Profile data
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  
  // Delivery charges
  const [fixKm, setFixKm] = useState('');
  const [fixAmount, setFixAmount] = useState('');
  const [perKm, setPerKm] = useState('');
  const [maxKm, setMaxKm] = useState('');
  
  // Store status
  const [storeOpen, setStoreOpen] = useState(false);
  
  // GCash settings
  const [gcashEnabled, setGcashEnabled] = useState(false);
  const [gcashQrImage, setGcashQrImage] = useState<File | null>(null);
  const [currentGcashQr, setCurrentGcashQr] = useState('');
  
  // Store items
  const [items, setItems] = useState<any[]>([]);
  
  // Orders history
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!checkAuth()) {
      router.replace('/store/login');
      return;
    }

    loadAccountData();
    loadStoreItems();
  }, []);

  const loadAccountData = async () => {
    setLoading(true);
    try {
      const storeId = localStorage.getItem('store_user_id');
      if (!storeId) return;

      const response = await servexStoreApi.userInfo(storeId);
      
      if (response.data) {
        const data = response.data;
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setFixKm(data.fix_km || '');
        setFixAmount(data.fix_amount || '');
        setPerKm(data.per_km || '');
        setMaxKm(data.max_km || '');
        setStoreOpen(data.open === 0); // 0 = open, 1 = closed (inverted in API)
        
        // Load GCash settings
        setGcashEnabled(data.gcash_enabled === 1);
        setCurrentGcashQr(data.gcash_qr_image || '');
      }
      
      if (response.order) {
        setOrders(response.order || []);
      }
    } catch (error) {
      console.error('Error loading account data:', error);
      toast.error('Failed to load account data');
    } finally {
      setLoading(false);
    }
  };

  const loadStoreItems = async () => {
    try {
      const storeId = localStorage.getItem('store_user_id');
      if (!storeId) return;

      const response = await servexStoreApi.getItem(storeId);
      
      // The API returns data: {store: {...}, cate: [...], item: [...]}
      // We need to access response.data.item
      if (response && response.data && response.data.item && Array.isArray(response.data.item)) {
        setItems(response.data.item);
      } else {
        console.warn('No items found in response:', response);
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Get the original data from localStorage to preserve all fields
      const storeId = localStorage.getItem('store_user_id');
      const response = await servexStoreApi.userInfo(storeId || '');
      const originalData = response.data || {};
      
      // Merge with our updates, preserving all original fields
      const updateData: any = {
        ...originalData, // Include all original fields (like email, id, etc.)
        name,
        phone,
        address,
        fix_km: fixKm || '0',
        fix_amount: fixAmount || '0',
        per_km: perKm || '0',
        max_km: maxKm || '0',
      };
      
      if (password && password.trim()) {
        updateData.password = password;
      }

      console.log('Sending update data:', updateData);
      const updateResponse = await servexStoreApi.updateInfo(updateData);
      console.log('Update response:', updateResponse);

      if (updateResponse.data === 'error') {
        toast.error('Failed to update profile');
        return;
      }

      // Update local storage with the response data if available
      if (updateResponse.res) {
        localStorage.setItem('store_user_data', JSON.stringify(updateResponse.res));
      }

      toast.success('Profile updated successfully');
      setPassword(''); // Clear password field after save
      
      // Reload account data to reflect changes
      await loadAccountData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStoreStatus = async () => {
    try {
      const storeId = localStorage.getItem('store_user_id');
      
      // Optimistically update UI
      const newStoreOpenState = !storeOpen;
      setStoreOpen(newStoreOpenState);
      
      // Send opposite value to API: if we want to open (newStoreOpenState=true), send 0
      // If we want to close (newStoreOpenState=false), send 1
      const apiValue = newStoreOpenState ? 0 : 1;
      await servexStoreApi.storeOpen(`${apiValue}?user_id=${storeId}` as any);
      
      toast.success(`Store is now ${newStoreOpenState ? 'OPEN' : 'CLOSED'}`);
    } catch (error) {
      console.error('Error toggling store status:', error);
      // Revert on error
      setStoreOpen(!storeOpen);
      toast.error('Failed to update store status');
    }
  };

  const handleSaveGcashSettings = async () => {
    try {
      setSaving(true);
      
      const formData = new FormData();
      if (gcashQrImage) {
        formData.append('gcash_qr', gcashQrImage);
      }
      formData.append('gcash_enabled', gcashEnabled ? '1' : '0');
      
      const response = await servexStoreApi.updateGcashSettings(formData);
      
      if (response.data === 'done') {
        toast.success('GCash settings updated successfully');
        setGcashQrImage(null); // Clear file input
        await loadAccountData(); // Reload to get new image path
      } else {
        toast.error('Failed to update GCash settings');
      }
    } catch (error) {
      console.error('Error updating GCash settings:', error);
      toast.error('Failed to update GCash settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleItemStatus = async (itemId: string, currentStatus: number) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await servexStoreApi.changeStatus(itemId, newStatus);
      
      // Update local state
      setItems(items.map(item => 
        item.id === itemId ? { ...item, status: newStatus } : item
      ));
      
      toast.success(`Item ${newStatus === 0 ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Error updating item status:', error);
      toast.error('Failed to update item status');
    }
  };

  if (!authStoreData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold">Store Settings</h1>
            <p className="text-sm text-gray-500">Manage your store</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Store Header */}
        <div className="bg-gradient-to-br from-green-500 to-blue-600 text-white rounded-2xl p-8 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Store className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{authStoreData.name}</h2>
                <p className="text-sm opacity-90">{authStoreData.email}</p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <button
                onClick={handleToggleStoreStatus}
                className={`relative inline-flex items-center h-10 w-20 rounded-full transition-colors ${
                  storeOpen ? 'bg-white' : 'bg-white bg-opacity-30'
                }`}
              >
                <span
                  className={`inline-block w-8 h-8 transform rounded-full transition-transform ${
                    storeOpen ? 'translate-x-11 bg-green-600' : 'translate-x-1 bg-gray-400'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${
                storeOpen ? 'text-white' : 'text-white text-opacity-70'
              }`}>
                {storeOpen ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-1 flex space-x-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'profile'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition ${
              activeTab === 'items'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Items ({items.length})</span>
            </div>
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-6">Update Account Setting</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Title
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter store name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter store address"
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold mb-4">Delivery Charges</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter KM for Fix Delivery Charges
                    </label>
                    <input
                      type="number"
                      value={fixKm}
                      onChange={(e) => setFixKm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Amount for Fix Charges
                    </label>
                    <input
                      type="number"
                      value={fixAmount}
                      onChange={(e) => setFixAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder=""
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount will be charged after fix KM
                    </label>
                    <input
                      type="number"
                      value={perKm}
                      onChange={(e) => setPerKm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder=""
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Delivery Area in KM
                    </label>
                    <input
                      type="number"
                      value={maxKm}
                      onChange={(e) => setMaxKm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold mb-4">Change Password</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold mb-4">GCash Payment Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="gcash-enabled"
                      checked={gcashEnabled}
                      onChange={(e) => setGcashEnabled(e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="gcash-enabled" className="text-sm font-medium text-gray-700">
                      Enable GCash QR Payment
                    </label>
                  </div>

                  {currentGcashQr && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">Current GCash QR Code:</p>
                      <img 
                        src={`https://bsitport2026.com/servex/${currentGcashQr}`}
                        alt="Current GCash QR" 
                        className="w-48 h-48 object-contain border rounded-lg"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {currentGcashQr ? 'Change GCash QR Code' : 'Upload GCash QR Code'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setGcashQrImage(e.target.files?.[0] || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload your GCash QR code image (JPG, PNG)
                    </p>
                    {gcashQrImage && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ New file selected: {gcashQrImage.name}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={handleSaveGcashSettings}
                    disabled={saving}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving GCash Settings...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Save GCash Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving ? 'Saving...' : 'Submit'}
              </button>
            </div>
          </div>
        )}

        {/* Items Tab */}
        {activeTab === 'items' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold mb-6">Store Items</h3>
            {!Array.isArray(items) || items.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No items found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      {item.img && (
                        <img
                          src={item.img}
                          alt={item.item}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.item}</h4>
                        <p className="text-sm text-gray-600">{item.currency}{item.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleItemStatus(item.id, item.status)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        item.status === 0
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.status === 0 ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
