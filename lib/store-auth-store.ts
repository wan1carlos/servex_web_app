// Store Authentication Store
import { create } from 'zustand';
import { servexStoreApi } from './store-api';

interface StoreAuthState {
  storeId: string | null;
  storeData: any | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => boolean;
  getStoreData: () => any;
}

export const useStoreAuth = create<StoreAuthState>((set, get) => ({
  storeId: typeof window !== 'undefined' ? localStorage.getItem('store_user_id') : null,
  storeData: typeof window !== 'undefined' && localStorage.getItem('store_user_data') 
    ? JSON.parse(localStorage.getItem('store_user_data') || 'null') 
    : null,
  isAuthenticated: typeof window !== 'undefined' && 
    localStorage.getItem('store_user_id') !== null && 
    localStorage.getItem('store_user_id') !== 'null',

  login: async (phone: string, password: string) => {
    try {
      const result = await servexStoreApi.login({ phone, password });
      
      if (result.msg === 'done' && result.user) {
        localStorage.setItem('store_user_id', result.user.id);
        localStorage.setItem('store_user_data', JSON.stringify(result.user));
        
        set({
          storeId: result.user.id,
          storeData: result.user,
          isAuthenticated: true,
        });

        return { success: true };
      } else {
        return { success: false, message: 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Store login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  },

  logout: () => {
    localStorage.removeItem('store_user_id');
    localStorage.removeItem('store_user_data');
    localStorage.removeItem('store_data');
    localStorage.removeItem('odata');
    
    set({
      storeId: null,
      storeData: null,
      isAuthenticated: false,
    });
  },

  checkAuth: () => {
    const storeId = localStorage.getItem('store_user_id');
    const isAuth = storeId !== null && storeId !== 'null';
    
    if (!isAuth) {
      set({
        storeId: null,
        storeData: null,
        isAuthenticated: false,
      });
    }
    
    return isAuth;
  },

  getStoreData: () => {
    return get().storeData;
  },
}));
