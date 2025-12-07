import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import servexDeliveryApi from './delivery-api';

export interface DeliveryUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  online?: number;
  [key: string]: any;
}

interface DeliveryAuthState {
  user: DeliveryUser | null;
  userId: string | null;
  isAuthenticated: boolean;
  online: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (user: DeliveryUser) => void;
  loadUser: () => Promise<void>;
  setOnlineStatus: (online: boolean) => void;
}

export const useDeliveryAuth = create<DeliveryAuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userId: null,
      isAuthenticated: false,
      online: false,

      login: async (phone: string, password: string) => {
        try {
          const response = await servexDeliveryApi.login({ phone, password });
          
          if (response.msg === 'done') {
            const user = response.user;
            localStorage.setItem('delivery_user_id', user.id);
            localStorage.setItem('delivery_user_data', JSON.stringify(user));
            
            set({
              user,
              userId: user.id,
              isAuthenticated: true,
              online: user.online === 1,
            });
            
            return { success: true };
          } else {
            return { success: false, message: 'Invalid credentials' };
          }
        } catch (error) {
          console.error('Delivery login error:', error);
          return { success: false, message: 'Login failed. Please try again.' };
        }
      },

      logout: () => {
        const lid = localStorage.getItem('lid');
        const appText = localStorage.getItem('app_text');
        const currentLat = localStorage.getItem('current_lat');
        const currentLng = localStorage.getItem('current_lng');
        
        // Clear delivery-specific data
        localStorage.removeItem('delivery_user_id');
        localStorage.removeItem('delivery_user_data');
        
        // Restore global settings
        if (lid) localStorage.setItem('lid', lid);
        if (appText) localStorage.setItem('app_text', appText);
        if (currentLat) localStorage.setItem('current_lat', currentLat);
        if (currentLng) localStorage.setItem('current_lng', currentLng);
        
        set({
          user: null,
          userId: null,
          isAuthenticated: false,
          online: false,
        });
      },

      updateUser: (user: DeliveryUser) => {
        localStorage.setItem('delivery_user_data', JSON.stringify(user));
        set({ user });
      },

      loadUser: async () => {
        const userId = localStorage.getItem('delivery_user_id');
        const userData = localStorage.getItem('delivery_user_data');
        
        if (userId && userData && userData !== 'null') {
          try {
            const user = JSON.parse(userData);
            set({
              user,
              userId,
              isAuthenticated: true,
              online: user.online === 1,
            });
            
            // Refresh user data from server
            const response = await servexDeliveryApi.userInfo(userId);
            if (response.data) {
              const updatedUser = response.data;
              localStorage.setItem('delivery_user_data', JSON.stringify(updatedUser));
              set({ 
                user: updatedUser,
                online: updatedUser.online === 1,
              });
            }
          } catch (error) {
            console.error('Error loading delivery user:', error);
          }
        }
      },

      setOnlineStatus: (online: boolean) => {
        const user = get().user;
        if (user) {
          const updatedUser = { ...user, online: online ? 1 : 0 };
          set({ online, user: updatedUser });
          localStorage.setItem('delivery_user_data', JSON.stringify(updatedUser));
        }
      },
    }),
    {
      name: 'delivery-auth-storage',
      partialize: (state) => ({
        user: state.user,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
        online: state.online,
      }),
    }
  )
);
