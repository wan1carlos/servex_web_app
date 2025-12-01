'use client';

import { useEffect, useRef } from 'react';

interface OrderMapProps {
  storeLat?: number;
  storeLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  riderLat?: number;
  riderLng?: number;
  orderStatus?: number;
}

export default function OrderMap({ 
  storeLat, 
  storeLng, 
  deliveryLat, 
  deliveryLng, 
  riderLat, 
  riderLng,
  orderStatus 
}: OrderMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const routingControlRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const initMap = async () => {
      if (!isMounted || !mapContainerRef.current) return;

      console.log('Starting map initialization...');

      // Dynamically import Leaflet
      const leafletModule = await import('leaflet');
      const L = leafletModule.default;
      
      console.log('Leaflet loaded:', !!L);

      // Import routing machine
      try {
        await import('leaflet-routing-machine');
        console.log('Routing machine loaded:', !!(L as any).Routing);
      } catch (error) {
        console.error('Failed to load routing machine:', error);
      }

      if (!isMounted || mapRef.current) return;

      console.log('Creating map with center:', deliveryLat || storeLat, deliveryLng || storeLng);

      // Default center
      const centerLat = deliveryLat || storeLat || 14.6760;
      const centerLng = deliveryLng || storeLng || 121.0437;
      
      const map = L.map(mapContainerRef.current).setView([centerLat, centerLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      console.log('Base map created');

      console.log('Coordinates check:', {
        storeLat, storeLng,
        deliveryLat, deliveryLng,
        riderLat, riderLng,
        orderStatus
      });

      // Add store marker (blue)
      if (storeLat && storeLng) {
        const storeIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        L.marker([storeLat, storeLng], { icon: storeIcon })
          .addTo(map)
          .bindPopup('Store Location');
      }

      // Add delivery marker (red)
      if (deliveryLat && deliveryLng) {
        const deliveryIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        L.marker([deliveryLat, deliveryLng], { icon: deliveryIcon })
          .addTo(map)
          .bindPopup('Delivery Location');
      }

      // Add rider marker (green)
      if (riderLat && riderLng && (orderStatus === 3 || orderStatus === 4)) {
        const riderIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        L.marker([riderLat, riderLng], { icon: riderIcon })
          .addTo(map)
          .bindPopup('Rider Location');
      }

      // Add routing
      console.log('Checking routing conditions:', {
        hasStoreLat: !!storeLat,
        hasStoreLng: !!storeLng,
        hasDeliveryLat: !!deliveryLat,
        hasDeliveryLng: !!deliveryLng,
        hasRiderLat: !!riderLat,
        hasRiderLng: !!riderLng
      });

      // Create route if we have at least delivery location and either store or rider location
      const canCreateRoute = deliveryLat && deliveryLng && (
        (storeLat && storeLng) || (riderLat && riderLng)
      );

      if (canCreateRoute) {
        let startLat, startLng;
        
        // Determine start point based on what's available
        if ((orderStatus === 3 || orderStatus === 4) && riderLat && riderLng) {
          // Rider is on the way - route from rider to delivery
          startLat = parseFloat(riderLat as any);
          startLng = parseFloat(riderLng as any);
        } else if (storeLat && storeLng) {
          // Route from store to delivery
          startLat = parseFloat(storeLat as any);
          startLng = parseFloat(storeLng as any);
        } else if (riderLat && riderLng) {
          // Fallback - route from rider to delivery
          startLat = parseFloat(riderLat as any);
          startLng = parseFloat(riderLng as any);
        } else {
          console.log('No valid start point for routing');
          mapRef.current = map;
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
          return;
        }

        const endLat = parseFloat(deliveryLat as any);
        const endLng = parseFloat(deliveryLng as any);

        console.log('Attempting to create route from', [startLat, startLng], 'to', [endLat, endLng]);
        console.log('L.Routing available:', !!(L as any).Routing);
        console.log('L.Routing.control available:', !!(L as any).Routing?.control);

        if ((L as any).Routing && (L as any).Routing.control) {
          try {
            console.log('Creating routing control...');
            
            const routingControl = (L as any).Routing.control({
              waypoints: [
                L.latLng(startLat, startLng),
                L.latLng(endLat, endLng)
              ],
              routeWhileDragging: false,
              showAlternatives: false,
              fitSelectedRoutes: true,
              addWaypoints: false,
              draggableWaypoints: false,
              lineOptions: {
                styles: [{ color: '#6FA1EC', weight: 4 }]
              },
              createMarker: function() { return null; } // Don't create default markers
            });

            console.log('Adding routing control to map...');
            routingControl.addTo(map);
            routingControlRef.current = routingControl;
            console.log('Routing control added successfully');
            
            routingControl.on('routesfound', (e: any) => {
              console.log('✓ Route found successfully!', e.routes);
            });
            
            routingControl.on('routingerror', (e: any) => {
              console.error('✗ Routing error:', e);
            });
          } catch (error) {
            console.error('✗ Error creating routing:', error);
          }
        } else {
          console.error('✗ L.Routing.control not available!');
        }
      } else {
        console.log('Cannot create route - missing required coordinates');
        // At least fit to delivery location
        if (deliveryLat && deliveryLng) {
          map.setView([parseFloat(deliveryLat as any), parseFloat(deliveryLng as any)], 15);
        }
      }

      mapRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };

    initMap();

    return () => {
      isMounted = false;
      if (routingControlRef.current && mapRef.current) {
        try {
          mapRef.current.removeControl(routingControlRef.current);
        } catch (e) {
          // Ignore
        }
        routingControlRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [storeLat, storeLng, deliveryLat, deliveryLng, riderLat, riderLng, orderStatus]);

  return (
    <div 
      ref={mapContainerRef}
      className="w-full rounded-xl"
      style={{ height: '400px', zIndex: 0 }}
    />
  );
}
