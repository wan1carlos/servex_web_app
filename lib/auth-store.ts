import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from './types';
import servexApi from './api';

interface AuthState {
  user: User | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (user: User) => void;
  loadUser: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      userId: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await servexApi.login(email, password);
          
          if (response.msg === 'done') {
            const user = response.user;
            localStorage.setItem('user_id', user.id);
            localStorage.setItem('user_data', JSON.stringify(user));
            
            set({
              user,
              userId: user.id,
              isAuthenticated: true,
            });
            
            return { success: true };
          } else {
            return { success: false, message: 'Invalid credentials' };
          }
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, message: 'Login failed. Please try again.' };
        }
      },

      signup: async (data) => {
        try {
          const response = await servexApi.signup(data);
          
          if (response.msg === 'done') {
            const user = response.user;
            localStorage.setItem('user_id', user.id);
            localStorage.setItem('user_data', JSON.stringify(user));
            
            set({
              user,
              userId: user.id,
              isAuthenticated: true,
            });
            
            return { success: true };
          } else {
            return { success: false, message: response.msg || 'Signup failed' };
          }
        } catch (error) {
          console.error('Signup error:', error);
          return { success: false, message: 'Signup failed. Please try again.' };
        }
      },

      logout: () => {
        localStorage.clear();
        set({
          user: null,
          userId: null,
          isAuthenticated: false,
        });
      },

      updateUser: (user: User) => {
        localStorage.setItem('user_data', JSON.stringify(user));
        set({ user });
      },

      loadUser: async () => {
        const userId = localStorage.getItem('user_id');
        const userData = localStorage.getItem('user_data');
        
        if (userId && userData && userData !== 'null') {
          try {
            const user = JSON.parse(userData);
            set({
              user,
              userId,
              isAuthenticated: true,
            });
            
            // Refresh user data from server
            const response = await servexApi.userInfo(userId);
            if (response.data) {
              const updatedUser = response.data;
              localStorage.setItem('user_data', JSON.stringify(updatedUser));
              set({ user: updatedUser });
            }
          } catch (error) {
            console.error('Error loading user:', error);
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
