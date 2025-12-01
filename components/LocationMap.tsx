'use client';

import { useEffect, useRef } from 'react';

interface LocationMapProps {
  lat: number;
  lng: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function LocationMap({ lat, lng, onLocationSelect }: LocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const L = useRef<any>(null);

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then((leaflet) => {
      L.current = leaflet.default;
      
      if (!mapRef.current && mapContainerRef.current) {
        // Initialize map
        const map = L.current.map(mapContainerRef.current).setView([lat, lng], 13);

        L.current.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Custom marker icon
        const customIcon = L.current.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        // Add marker
        const marker = L.current.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(map);
        markerRef.current = marker;

        // Handle marker drag
        marker.on('dragend', (e: any) => {
          const position = e.target.getLatLng();
          onLocationSelect(position.lat, position.lng);
        });

        // Handle map click
        map.on('click', (e: any) => {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          marker.setLatLng([clickLat, clickLng]);
          onLocationSelect(clickLat, clickLng);
        });

        mapRef.current = map;

        // Force map to resize
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Update marker position when coordinates change
    if (mapRef.current && markerRef.current && L.current) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.setView([lat, lng], 13);
    }
  }, [lat, lng]);

  return (
    <div 
      ref={mapContainerRef}
      className="w-full rounded-xl"
      style={{ height: '400px', zIndex: 0 }}
    />
  );
}
