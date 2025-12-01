import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  languageId: string;
  cityId: string;
  currentLat: string;
  currentLng: string;
  currentAddress: string;
  appText: Record<string, string>;
  settings: Record<string, any>;
  setLanguage: (id: string) => void;
  setCity: (id: string) => void;
  setLocation: (lat: string, lng: string, address: string) => void;
  setAppText: (text: Record<string, string>) => void;
  setSettings: (settings: Record<string, any>) => void;
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      languageId: '1',
      cityId: '1',
      currentLat: '0',
      currentLng: '0',
      currentAddress: 'Select Location',
      appText: {},
      settings: {},

      setLanguage: (id: string) => {
        localStorage.setItem('lid', id);
        set({ languageId: id });
      },

      setCity: (id: string) => {
        localStorage.setItem('city_id', id);
        set({ cityId: id });
      },

      setLocation: (lat: string, lng: string, address: string) => {
        localStorage.setItem('current_lat', lat);
        localStorage.setItem('current_lng', lng);
        localStorage.setItem('current_add', address);
        set({ currentLat: lat, currentLng: lng, currentAddress: address });
      },

      setAppText: (text: Record<string, string>) => {
        localStorage.setItem('app_text', JSON.stringify(text));
        set({ appText: text });
      },

      setSettings: (settings: Record<string, any>) => {
        localStorage.setItem('setting', JSON.stringify(settings));
        set({ settings });
      },
    }),
    {
      name: 'app-storage',
    }
  )
);
