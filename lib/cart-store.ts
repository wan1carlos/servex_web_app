import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartData } from './types';
import servexApi from './api';

interface CartState {
  cartNo: string;
  items: CartItem[];
  cartData: CartData | null;
  count: number;
  isLoading: boolean;
  initializeCart: () => void;
  addToCart: (data: {
    item_id: string;
    price: number;
    item_size_id: string;
    addon: any[];
  }) => Promise<{ success: boolean; message?: string }>;
  loadCart: () => Promise<void>;
  updateCartItem: (cartId: string, type: number) => Promise<void>;
  clearCart: () => void;
  getCartCount: () => Promise<void>;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      cartNo: '',
      items: [],
      cartData: null,
      count: 0,
      isLoading: false,

      initializeCart: () => {
        let cartNo = localStorage.getItem('cart_no');
        if (!cartNo || cartNo === 'null' || cartNo === 'undefined') {
          cartNo = String(Math.floor(Math.random() * 2000000000) + 1);
          localStorage.setItem('cart_no', cartNo);
        }
        set({ cartNo });
        
        // DO NOT initialize lid or city_id - let them remain null like mobile app
      },

      addToCart: async (data) => {
        try {
          const state = get();
          
          const response = await servexApi.addToCart({
            cart_no: state.cartNo,
            id: data.item_id,
            price: data.price,
            qtype: data.item_size_id ? parseInt(data.item_size_id) : 0,
            type: 0,
            addon: data.addon || [],
          });

          // Check response structure from mobile app
          if (response.data && !response.data.error) {
            // Update cart count and items from response
            const nextItems = response.data.cart || [];
            const nextCount = (Array.isArray(nextItems) ? nextItems.length : 0) || (response.data.count || 0);
            set({ 
              count: nextCount,
              items: nextItems
            });
            try { localStorage.setItem('cart_count', String(nextCount)); } catch {}
            // Fetch updated cart count (ignore errors)
            get().getCartCount().catch(() => {});
            return { success: true };
          } else if (response.data && response.data.error) {
            return { success: false, message: 'Item is out of stock' };
          } else {
            return { success: false, message: 'Failed to add to cart' };
          }
        } catch (error) {
          console.error('Add to cart error:', error);
          return { success: false, message: 'Failed to add to cart' };
        }
      },

      loadCart: async () => {
        const state = get();
        if (!state.cartNo) return;

        try {
          set({ isLoading: true });
          const response = await servexApi.getCart(state.cartNo);
          
          if (response.data) {
            const nextItems = response.data.data || [];
            const nextCount = Array.isArray(nextItems) ? nextItems.length : 0;
            set({
              cartData: response.data,
              items: nextItems,
              count: nextCount,
              isLoading: false,
            });
            try { localStorage.setItem('cart_count', String(nextCount)); } catch {}
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Load cart error:', error);
          set({ isLoading: false });
        }
      },

      updateCartItem: async (cartId: string, type: number) => {
        try {
          set({ isLoading: true });
          const response = await servexApi.updateCart(cartId, type);
          
          if (response.data) {
            const nextItems = response.data.data || [];
            const nextCount = Array.isArray(nextItems) ? nextItems.length : 0;
            set({
              cartData: response.data,
              items: nextItems,
              count: nextCount,
              isLoading: false,
            });
            try { localStorage.setItem('cart_count', String(nextCount)); } catch {}
            // Fetch updated cart count (ignore errors)
            get().getCartCount().catch(() => {});
          }
        } catch (error) {
          console.error('Update cart error:', error);
          set({ isLoading: false });
        }
      },

      getCartCount: async () => {
        const state = get();
        if (!state.cartNo) return;

        try {
          const response = await servexApi.cartCount(state.cartNo);
          const serverCount = Number(response?.data ?? 0);
          const itemsLen = Array.isArray(state.items) ? state.items.length : 0;
          // Prefer local items length; fallback to server; final fallback to cached localStorage
          let nextCount = itemsLen > 0 ? itemsLen : serverCount;
          if (!nextCount) {
            const cached = localStorage.getItem('cart_count');
            if (cached) nextCount = Number(cached) || 0;
          }
          set({ count: nextCount });
          try { localStorage.setItem('cart_count', String(nextCount)); } catch {}
        } catch (error) {
          console.error('Get cart count error:', error);
          // Do not overwrite count to 0 on error; keep last known value
          const cached = localStorage.getItem('cart_count');
          if (cached) {
            set({ count: Number(cached) || get().count });
          }
        }
      },

      clearCart: () => {
        const newCartNo = String(Math.floor(Math.random() * 2000000000) + 1);
        localStorage.setItem('cart_no', newCartNo);
        try { localStorage.setItem('cart_count', '0'); } catch {}
        set({
          cartNo: newCartNo,
          items: [],
          cartData: null,
          count: 0,
        });
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cartNo: state.cartNo,
        count: state.count,
      }),
    }
  )
);
