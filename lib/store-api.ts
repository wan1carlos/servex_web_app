// Store API Service Layer
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bsitport2026.com/servex/api/';

const storeApi = axios.create({
  baseURL: API_BASE + 'store/',
  timeout: 30000,
});

// Helper to get localStorage items
const getLocalStorage = (key: string, defaultValue: any = null) => {
  if (typeof window === 'undefined') return defaultValue;
  const value = localStorage.getItem(key);
  return value;
};

export const servexStoreApi = {
  // Authentication
  login: async (data: { phone: string; password: string }) => {
    const response = await storeApi.post('login', data);
    return response.data;
  },

  signup: async (data: any) => {
    const response = await storeApi.post('signup', data);
    return response.data;
  },

  // Home/Dashboard
  homepage: async (id: string, status: number) => {
    const lid = getLocalStorage('lid');
    const response = await storeApi.get(`homepage?id=${id}&lid=${lid}&status=${status}`);
    return response.data;
  },

  // Order Management
  orderProcess: async (id: string, status: number) => {
    const response = await storeApi.get(`orderProcess?id=${id}&status=${status}`);
    return response.data;
  },

  startRide: async (orderId: string, deliveryBoyId?: string) => {
    const params = deliveryBoyId 
      ? `?order_id=${orderId}&dboy_id=${deliveryBoyId}`
      : `?order_id=${orderId}`;
    const response = await storeApi.get(`startRide${params}`);
    return response.data;
  },

  // Items/Products
  getItem: async (storeId: string) => {
    const lid = getLocalStorage('lid');
    const response = await storeApi.get(`getItem?store_id=${storeId}&lid=${lid}&for_store=true`);
    return response.data;
  },

  changeStatus: async (id: string, status: number) => {
    const response = await storeApi.get(`changeStatus?id=${id}&status=${status}`);
    return response.data;
  },

  editItem: async (data: any) => {
    const response = await storeApi.post('editItem', data);
    return response.data;
  },

  // User Information
  userInfo: async (id: string) => {
    const response = await storeApi.get(`userInfo/${id}`);
    return response.data;
  },

  updateInfo: async (data: any) => {
    const userId = getLocalStorage('store_user_id');
    const response = await storeApi.post(`updateInfo?user_id=${userId}`, data);
    return response.data;
  },

  // Location
  updateLocation: async (data: any) => {
    const response = await storeApi.post('updateLocation', data);
    return response.data;
  },

  upLocation: async (data: any) => {
    // Alias for updateLocation to match mobile app
    const response = await storeApi.post('updateLocation', data);
    return response.data;
  },

  // Password Management
  forgot: async (data: any) => {
    const response = await storeApi.post('forgot', data);
    return response.data;
  },

  verify: async (data: any) => {
    const response = await storeApi.post('verify', data);
    return response.data;
  },

  updatePassword: async (data: any) => {
    const response = await storeApi.post('updatePassword', data);
    return response.data;
  },

  // Store Management
  storeOpen: async (type: number) => {
    const response = await storeApi.get(`storeOpen/${type}`);
    return response.data;
  },

  // Delivery Boy
  getDboy: async (id: string) => {
    const response = await storeApi.get(`getDboy?id=${id}`);
    return response.data;
  },

  // Language
  getLang: async (id: string) => {
    const response = await storeApi.get(`getLang?lang_id=${id}`);
    return response.data;
  },

  lang: async () => {
    const response = await storeApi.get('lang');
    return response.data;
  },

  // Plan Management
  plan: async () => {
    const lid = getLocalStorage('lid');
    const response = await storeApi.get(`plan?lid=${lid}`);
    return response.data;
  },

  myPlan: async () => {
    const lid = getLocalStorage('lid');
    const userId = getLocalStorage('store_user_id');
    const response = await storeApi.get(`myPlan?lid=${lid}&user_id=${userId}`);
    return response.data;
  },

  renew: async (data: any) => {
    const response = await storeApi.post('renew', data);
    return response.data;
  },

  // Pages
  page: async () => {
    const lid = getLocalStorage('lid');
    const response = await storeApi.get(`page?lid=${lid}`);
    return response.data;
  },

  // Count
  getCount: async (id: string) => {
    const response = await storeApi.get(`getCount?id=${id}`);
    return response.data;
  },

  // Payment
  makeStripePayment: async (data: string) => {
    const lid = getLocalStorage('lid');
    const response = await storeApi.get(`makeStripePayment${data}&lid=${lid}`);
    return response.data;
  },
};
