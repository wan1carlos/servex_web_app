// API Service Layer
import axios from 'axios';
import type { User, Store, Category, Item, CartData, Order, Address, Language, City } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://bsitport2026.com/servex/api/';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Add response interceptor to handle errors without noisy overlay logs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const backendMsg = error?.response?.data?.message || error?.response?.data?.error;
    const endpoint = error?.config?.url;
    // Use warn to avoid React Dev Overlay aggressive error capture
    console.warn('API request failed:', {
      status,
      endpoint,
      message: error?.message,
      backend: backendMsg,
    });

    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('Network issue detected. Check your connection.');
    }
    return Promise.reject(error);
  }
);

// Helper to get localStorage items
const getLocalStorage = (key: string, defaultValue: any = null) => {
  if (typeof window === 'undefined') return defaultValue;
  const value = localStorage.getItem(key);
  // Return the actual value, even if it's null - matching mobile app behavior
  // The mobile app sends "null" as a string when value is null
  return value;
};

// Helper to build query params
const buildParams = (params: Record<string, any>) => {
  const filtered = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
  return new URLSearchParams(filtered).toString();
};

export const servexApi = {
  // Authentication
  login: async (email: string, password: string) => {
    const response = await api.post('login', { email, password });
    return response.data;
  },

  signup: async (data: { name: string; email: string; phone: string; password: string }) => {
    const response = await api.post('signup', data);
    return response.data;
  },

  forgot: async (email: string) => {
    const response = await api.post('forgot', { email });
    return response.data;
  },

  verify: async (email: string, otp: string) => {
    const response = await api.post('verify', { email, otp });
    return response.data;
  },

  updatePassword: async (email: string, password: string) => {
    const response = await api.post('updatePassword', { email, password });
    return response.data;
  },

  // User
  userInfo: async (userId: string, storeId: string = '0', cartNo: string = '0') => {
    const url = `userInfo?id=${userId}&store_id=${storeId}&cart_no=${cartNo}`;
    const response = await api.get(url);
    return response.data;
  },

  updateInfo: async (userId: string, data: FormData) => {
    const response = await api.post(`updateInfo?id=${userId}`, data);
    return response.data;
  },

  // Order
  placeOrder: async (data: any) => {
    const lat = localStorage.getItem('current_lat') || '0';
    const lng = localStorage.getItem('current_lng') || '0';
    const response = await api.post(`order?lat=${lat}&lng=${lng}`, data);
    return response.data;
  },

  // Address
  saveAddress: async (data: any) => {
    const response = await api.post('saveAddress', data);
    return response.data;
  },

  // Homepage & Discovery - matches mobile app exactly
  homepage: async (params?: {
    cateId?: string;
    storeType?: string;
  }) => {
    // Get values exactly like mobile app - even if null
    const lid = localStorage.getItem('lid');
    const user_id = localStorage.getItem('user_id');
    const city_id = localStorage.getItem('city_id');
    const cate_id = params?.cateId || '0';
    const cart_no = localStorage.getItem('cart_no');
    const lat = localStorage.getItem('current_lat');
    const lng = localStorage.getItem('current_lng');
    const store_type = params?.storeType || '0';
    
    // Build URL exactly like mobile app - this will send "null" if values are null
    const url = `homepage?lid=${lid}&user_id=${user_id}&city_id=${city_id}&cate_id=${cate_id}&cart_no=${cart_no}&lat=${lat}&lng=${lng}&store_type=${store_type}`;
    const response = await api.get(url);
    return response.data;
  },

  city: async () => {
    const lid = getLocalStorage('lid', '1');
    const response = await api.get(`city?lid=${lid}`);
    return response.data;
  },

  page: async () => {
    const lid = getLocalStorage('lid', '1');
    const response = await api.get(`page?lid=${lid}`);
    return response.data;
  },

  getLang: async (langId: string) => {
    const response = await api.get(`getLang?lang_id=${langId}`);
    return response.data;
  },

  // Store & Items
  getStoreInfo: async (storeId: string) => {
    const lid = getLocalStorage('lid', '1');
    const response = await api.get(`store/userInfo/${storeId}?lid=${lid}`);
    return response.data;
  },

  item: async (storeId: string) => {
    const lid = getLocalStorage('lid');
    const user_id = getLocalStorage('user_id');
    const url = `item?lid=${lid}&user_id=${user_id}&store_id=${storeId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Cart
  addToCart: async (data: {
    cart_no: string;
    id: string;
    price: number;
    qtype: number;
    type: number;
    addon: any[];
  }) => {
    const lid = localStorage.getItem('lid') || '0';
    const response = await api.post(`addToCart?lang_id=${lid}`, data);
    return response.data;
  },

  cartCount: async (cartNo: string) => {
    const lid = localStorage.getItem('lid') || '0';
    const response = await api.get(`cartCount?lid=${lid}&cart_no=${cartNo}`);
    return response.data;
  },

  getCart: async (cartNo: string) => {
    const lid = getLocalStorage('lid', '1');
    const lat = getLocalStorage('current_lat', '0');
    const lng = getLocalStorage('current_lng', '0');
    const response = await api.get(`getCart/${cartNo}?lid=${lid}&lat=${lat}&lng=${lng}`);
    return response.data;
  },

  updateCart: async (cartId: string, type: number) => {
    const lid = getLocalStorage('lid', '1');
    const lat = getLocalStorage('current_lat', '0');
    const lng = getLocalStorage('current_lng', '0');
    const response = await api.get(`updateCart/${cartId}/${type}?lid=${lid}&lat=${lat}&lng=${lng}`);
    return response.data;
  },

  // Coupons
  getOffer: async (cartNo: string) => {
    const lid = getLocalStorage('lid', '1');
    const response = await api.get(`getOffer/${cartNo}?lid=${lid}`);
    return response.data;
  },

  applyCoupen: async (couponId: string, cartNo: string) => {
    const lat = getLocalStorage('current_lat', '0');
    const lng = getLocalStorage('current_lng', '0');
    const response = await api.get(`applyCoupen/${couponId}/${cartNo}?lat=${lat}&lng=${lng}`);
    return response.data;
  },

  removeOffer: async (offerId: string, cartNo: string) => {
    const lat = getLocalStorage('current_lat', '0');
    const lng = getLocalStorage('current_lng', '0');
    const response = await api.get(`removeOffer/${offerId}/${cartNo}?lat=${lat}&lng=${lng}`);
    return response.data;
  },

  // Orders
  order: async (data: {
    user_id: string;
    cart_no: string;
    store_id: string;
    address_id: string;
    payment_type: string;
    delivery_type: string;
    delivery_time: string;
    wallet_used: number;
    wallet_amount: number;
  }) => {
    const lat = getLocalStorage('current_lat', '0');
    const lng = getLocalStorage('current_lng', '0');
    const response = await api.post(`order?lat=${lat}&lng=${lng}`, data);
    return response.data;
  },

  my: async (userId: string) => {
    const lid = getLocalStorage('lid', '1');
    const response = await api.get(`my?id=${userId}&lid=${lid}`);
    return response.data;
  },

  runningOrder: async () => {
    const userId = getLocalStorage('user_id', '') || '0';
    const response = await api.get(`runningOrder?id=${userId}`);
    return response.data;
  },

  orderDetail: async (orderId: string) => {
    const lid = getLocalStorage('lid', '1');
    const response = await api.get(`orderDetail?lid=${lid}&order_id=${orderId}`);
    return response.data;
  },

  cancelOrder: async (orderId: string) => {
    const lid = getLocalStorage('lid', '1');
    const response = await api.get(`cancelOrder?id=${orderId}&lid=${lid}`);
    return response.data;
  },

  rating: async (data: { user_id: string; star: number; comment: string; oid: string }) => {
    const response = await api.post('rating', data);
    return response.data;
  },

  // Search
  getSearch: async (query: string) => {
    const lid = getLocalStorage('lid', '1');
    const lat = getLocalStorage('current_lat', '0');
    const lng = getLocalStorage('current_lng', '0');
    const response = await api.get(`getSearch?lid=${lid}&search=${query}&lat=${lat}&lng=${lng}`);
    return response.data;
  },

  // Payment
  makeStripePayment: async (token: string, amount: number) => {
    const lid = getLocalStorage('lid', '1');
    const response = await api.get(`makeStripePayment?token=${token}&amount=${amount}&lid=${lid}`);
    return response.data;
  },

  payStack: async (amount: string, email: string) => {
    const response = await api.get(`payStack?amount=${amount}&email=${email}`);
    return response.data;
  },

  payStackSuccess: async (reference: string) => {
    const response = await api.get(`payStackSuccess?reference=${reference}`);
    return response.data;
  },

  payStackCancel: async (reference: string) => {
    const response = await api.get(`payStackCancel?reference=${reference}`);
    return response.data;
  },
};

export default servexApi;
