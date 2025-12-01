'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';
import servexApi from '@/lib/api';

interface Store {
  id: string;
  name: string;
  img: string;
  latitude?: string;
  longitude?: string;
  address: string;
  rating?: number;
}

interface StoreWithCoords extends Store {
  lat: number;
  lng: number;
}

interface StoresMapProps {
  stores: Store[];
  center: { lat: number; lng: number };
}

export default function StoresMap({ stores, center }: StoresMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [storesWithCoords, setStoresWithCoords] = useState<StoreWithCoords[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch store coordinates
  useEffect(() => {
    const fetchStoreCoordinates = async () => {
      setLoading(true);
      const coordsPromises = stores.map(async (store) => {
        try {
          const response = await servexApi.getStoreInfo(store.id);
          if (response?.data?.lat && response?.data?.lng) {
            return {
              ...store,
              lat: parseFloat(response.data.lat),
              lng: parseFloat(response.data.lng),
            };
          }
          return null;
        } catch (error) {
          console.error(`Failed to fetch coords for store ${store.id}:`, error);
          return null;
        }
      });

      const results = await Promise.all(coordsPromises);
      const validStores = results.filter((s): s is StoreWithCoords => s !== null);
      console.log(`Loaded coordinates for ${validStores.length} out of ${stores.length} stores`);
      setStoresWithCoords(validStores);
      setLoading(false);
    };

    if (stores.length > 0) {
      fetchStoreCoordinates();
    }
  }, [stores]);

  useEffect(() => {
    if (!mapContainerRef.current || loading) return;

    // Initialize map
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(
        [center.lat, center.lng],
        13
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add user location marker
    const userIcon = L.divIcon({
      className: 'user-location-marker',
      html: `
        <div style="
          position: relative;
          width: 40px;
          height: 40px;
        ">
          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #3b82f6;
            border: 4px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
          ">
            📍
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    L.marker([center.lat, center.lng], { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup('<div style="text-align: center; font-weight: bold;">Your Location</div>');

    console.log('Total stores with coordinates:', storesWithCoords.length);

    // Add store markers with images
    storesWithCoords.forEach((store) => {
      const { lat, lng } = store;

      console.log(`Adding marker for: ${store.name} at ${lat}, ${lng}`);

      // Create custom icon with store image
      const customIcon = L.divIcon({
        className: 'custom-store-marker',
        html: `
          <div class="store-marker-container" style="
            position: relative;
            width: 50px;
            height: 50px;
            cursor: pointer;
          ">
            <img 
              src="${store.img}" 
              alt="${store.name}"
              style="
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: 3px solid #ec4899;
                background: white;
                object-fit: cover;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              "
              onerror="this.src='https://via.placeholder.com/50?text=Store'"
            />
            ${store.rating ? `
              <div style="
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                background: #fbbf24;
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: bold;
                white-space: nowrap;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
              ">
                ⭐ ${store.rating}
              </div>
            ` : ''}
          </div>
        `,
        iconSize: [50, 50],
        iconAnchor: [25, 25],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(mapRef.current!);

      // Create popup with store info
      const popupContent = `
        <div style="min-width: 200px;">
          <img 
            src="${store.img}" 
            alt="${store.name}"
            style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;"
          />
          <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: bold;">${store.name}</h3>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">${store.address || ''}</p>
          ${store.rating ? `
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
              <span style="color: #fbbf24;">⭐</span>
              <span style="font-size: 14px; font-weight: 600;">${store.rating}</span>
            </div>
          ` : ''}
          <button 
            onclick="window.storeMapClick('${store.id}')"
            style="
              width: 100%;
              background: #ec4899;
              color: white;
              border: none;
              padding: 8px;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              font-size: 14px;
            "
          >
            View Store
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Handle marker click
      marker.on('click', () => {
        // Store click handler in window for popup button
        (window as any).storeMapClick = (storeId: string) => {
          router.push(`/store/${storeId}`);
        };
      });
    });

    console.log(`Added ${storesWithCoords.length} markers to map`);

    // Fit bounds to show all markers including user location
    if (storesWithCoords.length > 0) {
      const allPoints: [number, number][] = [[center.lat, center.lng]];
      
      storesWithCoords.forEach((s) => {
        allPoints.push([s.lat, s.lng]);
      });

      if (allPoints.length > 1) {
        const bounds = L.latLngBounds(allPoints);
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    return () => {
      // Cleanup
    };
  }, [storesWithCoords, center, router, loading]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px',
        borderRadius: '12px',
        position: 'relative',
      }}
    >
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto mb-2"></div>
            <p style={{ fontSize: '14px', color: '#666' }}>Loading store locations...</p>
          </div>
        </div>
      )}
    </div>
  );
}
