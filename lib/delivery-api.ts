// Delivery API Service Layer
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bsitport2026.com/servex/api/';

const deliveryApi = axios.create({
  baseURL: API_BASE + 'dboy/',
  timeout: 30000,
});

// Add response interceptor to handle errors
deliveryApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Delivery API Error:', error.message);
    
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('Network error detected. Please check your internet connection.');
    }
    
    return Promise.reject(error);
  }
);

// Helper to get localStorage items
const getLocalStorage = (key: string, defaultValue: any = null) => {
  if (typeof window === 'undefined') return defaultValue;
  const value = localStorage.getItem(key);
  return value;
};

export const servexDeliveryApi = {
  // Authentication
  login: async (data: { phone: string; password: string }) => {
    const response = await deliveryApi.post('login', data);
    return response.data;
  },

  // Homepage - Get available orders
  homepage: async (id: string, status: number) => {
    const lid = getLocalStorage('lid');
    const lat = getLocalStorage('current_lat', '0');
    const lng = getLocalStorage('current_lng', '0');
    const response = await deliveryApi.get(
      `homepage?lid=${lid}&dboy_id=${id}&status=${status}&lat=${lat}&lng=${lng}`
    );
    return response.data;
  },

  // Page data
  page: async () => {
    const lid = getLocalStorage('lid');
    const response = await deliveryApi.get(`page?lid=${lid}`);
    return response.data;
  },

  // My orders (delivered/completed)
  my: async (id: string) => {
    const lid = getLocalStorage('lid');
    const response = await deliveryApi.get(`my?id=${id}&lid=${lid}`);
    return response.data;
  },

  // Language
  getLang: async (id: string) => {
    const response = await deliveryApi.get(`getLang?lang_id=${id}`);
    return response.data;
  },

  // User Information
  userInfo: async (id: string) => {
    const response = await deliveryApi.get(`userInfo/${id}`);
    return response.data;
  },

  updateInfo: async (data: any) => {
    const response = await deliveryApi.post('updateInfo', data);
    return response.data;
  },

  // Password Management
  updatePassword: async (data: any) => {
    const response = await deliveryApi.post('updatePassword', data);
    return response.data;
  },

  // Order Management
  startRide: async (id: string, status: number) => {
    const lid = getLocalStorage('lid');
    const response = await deliveryApi.get(`startRide?id=${id}&lid=${lid}&status=${status}`);
    return response.data;
  },

  // Set online/offline status
  setStatus: async (id: string, online: number) => {
    const lat = getLocalStorage('current_lat', '0');
    const lng = getLocalStorage('current_lng', '0');
    const response = await deliveryApi.get(
      `setStatus?id=${id}&online=${online}&lat=${lat}&lng=${lng}`
    );
    return response.data;
  },

  // Accept order
  accept: async (id: string, oid: string) => {
    const lid = getLocalStorage('lid');
    const lat = getLocalStorage('current_lat', '0');
    const lng = getLocalStorage('current_lng', '0');
    const response = await deliveryApi.get(
      `accept?dboy_id=${id}&order_id=${oid}&lat=${lat}&lng=${lng}&lid=${lid}&status=3`
    );
    return response.data;
  },

  // Earnings
  earn: async (id: string) => {
    const response = await deliveryApi.get(`earn?id=${id}`);
    return response.data;
  },
};

export default servexDeliveryApi;
