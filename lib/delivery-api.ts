// Delivery API Service Layer
import axios from 'axios';
import { normalizeAxiosError } from './error-utils';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bsitport2026.com/servex/api/';

const deliveryApi = axios.create({
  baseURL: API_BASE + 'dboy/',
  timeout: 30000,
});

// Add response interceptor to handle errors
deliveryApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress 404 errors for the 'my' endpoint (it may not be available)
    const isMyEndpoint = (error as any)?.config?.url?.includes('my?');
    const is404 = (error as any)?.response?.status === 404;
    
    if (isMyEndpoint && is404) {
      // Silently handle 404 for 'my' endpoint
      return Promise.reject(error);
    }
    
    const errMsg = typeof (error as any)?.message === 'string' ? (error as any).message : String(error);
    const status = (error as any)?.response?.status;
    // Use warn to avoid Next.js overlay spamming the UI for expected API errors
    console.warn('Delivery API Error:', status ? `HTTP ${status}` : errMsg);
    
    const errCode = (error as any)?.code;
    if (errCode === 'ERR_NETWORK' || errMsg === 'Network Error') {
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
    // Use base language to avoid backend 500 when s_data is missing
    const lid = '0';
    const lat = getLocalStorage('current_lat', '0');
    const lng = getLocalStorage('current_lng', '0');
    try {
      const response = await deliveryApi.get(
        `homepage?lid=${lid}&dboy_id=${id}&status=${status}&lat=${lat}&lng=${lng}`
      );
      return response.data;
    } catch (error) {
      throw normalizeAxiosError(error);
    }
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
    // Check if data is FormData (for image upload)
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    
    const response = await deliveryApi.post('updateInfo', data, config);
    return response.data;
  },

  // Password Management
  updatePassword: async (data: any) => {
    const response = await deliveryApi.post('updatePassword', data);
    return response.data;
  },

  // Order Management
  startRide: async (id: string, status: number) => {
    // Use base language
    const lid = '0';
    try {
      const response = await deliveryApi.get(`startRide?id=${id}&lid=${lid}&status=${status}`);
      return response.data;
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  // Set online/offline status
  setStatus: async (id: string, online: number) => {
    const lat = getLocalStorage('current_lat', '0');
    const lng = getLocalStorage('current_lng', '0');
    // Ensure base language to avoid backend index issues if needed
    const lid = '0';
    try {
      const response = await deliveryApi.get(
        `setStatus?id=${id}&online=${online}&lat=${lat}&lng=${lng}&lid=${lid}`
      );
      return response.data;
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  // Accept order
  accept: async (id: string, oid: string) => {
    // Use base language to avoid backend 500 when s_data is missing
    const lid = '0';
    const lat = getLocalStorage('current_lat', '0');
    const lng = getLocalStorage('current_lng', '0');
    try {
      const response = await deliveryApi.get(
        `accept?dboy_id=${id}&order_id=${oid}&lat=${lat}&lng=${lng}&lid=${lid}&status=3`
      );
      return response.data;
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },

  // Earnings
  earn: async (id: string) => {
    // Use base language
    const lid = '0';
    try {
      const response = await deliveryApi.get(`earn?id=${id}&lid=${lid}`);
      return response.data;
    } catch (error) {
      throw normalizeAxiosError(error);
    }
  },
};

export default servexDeliveryApi;
