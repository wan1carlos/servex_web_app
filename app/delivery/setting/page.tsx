'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryAuth } from '@/lib/delivery-auth-store';
import servexDeliveryApi from '@/lib/delivery-api';
import toast from 'react-hot-toast';

export default function DeliverySettingPage() {
  const router = useRouter();
  const { userId, isAuthenticated } = useDeliveryAuth();
  const [text, setText] = useState<any>(null);
  const [setting, setSetting] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_type: '',
    vehicle_number: '',
    license_number: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/delivery/login');
      return;
    }

    // Load language text
    const appText = localStorage.getItem('app_text');
    if (appText) {
      setText(JSON.parse(appText));
    }

    // Load settings
    const settingData = localStorage.getItem('setting');
    if (settingData) {
      setSetting(JSON.parse(settingData));
    }

    // Load user data
    loadUserData();
  }, [isAuthenticated, router, userId]);

  const loadUserData = async () => {
    if (!userId) return;

    try {
      const response = await servexDeliveryApi.userInfo(userId);
      if (response.data) {
        setUserData(response.data);
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          email: response.data.email || '',
          vehicle_type: response.data.vehicle_type || '',
          vehicle_number: response.data.vehicle_number || '',
          license_number: response.data.license_number || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;

    try {
      setLoading(true);
      
      // Try with regular JSON first (without image)
      if (!selectedImage) {
        const updateData = {
          id: userId,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          vehicle_type: formData.vehicle_type,
          vehicle_number: formData.vehicle_number,
          license_number: formData.license_number,
        };
        
        console.log('Sending update data:', updateData);
        const response = await servexDeliveryApi.updateInfo(updateData);
        console.log('Update response:', response);

        if (response.data || response.ResponseCode === '200' || response.ResponseMsg === 'success') {
          toast.success('Rider details updated successfully!');
          setIsEditing(false);
          await loadUserData();
        } else {
          toast.error(response.ResponseMsg || 'Failed to update rider details');
        }
      } else {
        // Use FormData for image upload
        const formDataToSend = new FormData();
        formDataToSend.append('id', userId);
        formDataToSend.append('name', formData.name);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('vehicle_type', formData.vehicle_type);
        formDataToSend.append('vehicle_number', formData.vehicle_number);
        formDataToSend.append('license_number', formData.license_number);
        formDataToSend.append('profile_image', selectedImage);
        
        console.log('Sending FormData with image');
        const response = await servexDeliveryApi.updateInfo(formDataToSend);
        console.log('Update response:', response);

        if (response.data || response.ResponseCode === '200' || response.ResponseMsg === 'success') {
          toast.success('Rider details updated successfully!');
          setIsEditing(false);
          setSelectedImage(null);
          setImagePreview(null);
          await loadUserData();
        } else {
          toast.error(response.ResponseMsg || 'Failed to update rider details');
        }
      }
    } catch (error: any) {
      console.error('Error updating rider details:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.ResponseMsg || 'Failed to update rider details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        email: userData.email || '',
        vehicle_type: userData.vehicle_type || '',
        vehicle_number: userData.vehicle_number || '',
        license_number: userData.license_number || '',
      });
    }
    setSelectedImage(null);
    setImagePreview(null);
    setIsEditing(false);
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
              {text.settings || 'Settings'}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Rider Details Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{text.d_rider_details || 'Rider Details'}</h3>
                  <p className="text-sm text-gray-600">{text.d_manage_profile || 'Manage your profile information'}</p>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {text.edit || 'Edit'}
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveDetails} className="space-y-4">
                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center gap-4 pb-4 border-b border-gray-200">
                  <div className="relative">
                    {imagePreview || userData?.image ? (
                      <img
                        src={imagePreview || `https://bsitport2026.com/servex/upload/dboy/${userData.image}`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4 border-green-600"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-600">
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <label
                      htmlFor="image-upload"
                      className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-gray-600">Click the camera icon to change profile picture</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {text.d_name || 'Full Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {text.d_phone || 'Phone Number'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {text.email || 'Email Address'}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700 mb-2">
                      {text.d_vehicle_type || 'Vehicle Type'}
                    </label>
                    <select
                      id="vehicle_type"
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select Vehicle Type</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Bicycle">Bicycle</option>
                      <option value="Car">Car</option>
                      <option value="Scooter">Scooter</option>
                      <option value="Van">Van</option>
                    </select>
                  </div>

                  {/* Vehicle Number */}
                  <div>
                    <label htmlFor="vehicle_number" className="block text-sm font-medium text-gray-700 mb-2">
                      {text.d_vehicle_number || 'Vehicle/Plate Number'}
                    </label>
                    <input
                      type="text"
                      id="vehicle_number"
                      name="vehicle_number"
                      value={formData.vehicle_number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* License Number */}
                  <div>
                    <label htmlFor="license_number" className="block text-sm font-medium text-gray-700 mb-2">
                      {text.d_license_number || 'License Number'}
                    </label>
                    <input
                      type="text"
                      id="license_number"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {text.cancel || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    {loading ? (text.saving || 'Saving...') : (text.save || 'Save Changes')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{text.d_name || 'Full Name'}</p>
                    <p className="font-medium text-gray-900">{userData?.name || 'Not provided'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{text.d_phone || 'Phone Number'}</p>
                    <p className="font-medium text-gray-900">{userData?.phone || 'Not provided'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{text.email || 'Email Address'}</p>
                    <p className="font-medium text-gray-900">{userData?.email || 'Not provided'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{text.d_vehicle_type || 'Vehicle Type'}</p>
                    <p className="font-medium text-gray-900">{userData?.vehicle_type || 'Not provided'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{text.d_vehicle_number || 'Vehicle Number'}</p>
                    <p className="font-medium text-gray-900">{userData?.vehicle_number || 'Not provided'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">{text.d_license_number || 'License Number'}</p>
                    <p className="font-medium text-gray-900">{userData?.license_number || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Account Settings */}
          <button
            onClick={() => router.push('/delivery/account')}
            className="w-full bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">{text.account || 'Account'}</h3>
                  <p className="text-sm text-gray-600">{text.manage_account || 'Manage your account settings'}</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* App Info */}
          {setting && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">{text.app_info || 'App Information'}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                {setting.app_name && (
                  <p><span className="font-medium">App Name:</span> {setting.app_name}</p>
                )}
                {setting.app_version && (
                  <p><span className="font-medium">Version:</span> {setting.app_version}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
