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

interface PathPoint {
  lat: number;
  lng: number;
  timestamp: number;
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
  const riderMarkerRef = useRef<any>(null);
  const pathHistoryRef = useRef<PathPoint[]>([]);
  const pathLayersRef = useRef<any[]>([]);
  const leafletRef = useRef<any>(null);

  // Effect to track rider position and create trail
  useEffect(() => {
    if (!mapRef.current || !leafletRef.current || !riderLat || !riderLng || (typeof orderStatus !== 'number' || (orderStatus !== 3 && orderStatus !== 4))) {
      return;
    }

    const L = leafletRef.current;
    const currentTime = Date.now();
    
    // Check if this is a new position (avoid duplicates)
    const lastPoint = pathHistoryRef.current[pathHistoryRef.current.length - 1];
    const isNewPosition = !lastPoint || 
      Math.abs(lastPoint.lat - riderLat) > 0.0001 || 
      Math.abs(lastPoint.lng - riderLng) > 0.0001;

    if (isNewPosition) {
      const newPoint: PathPoint = {
        lat: riderLat,
        lng: riderLng,
        timestamp: currentTime
      };

      // Add new point to history
      pathHistoryRef.current.push(newPoint);
      console.log('Added new trail point:', newPoint);
    }

    // Remove points older than 10 seconds
    const oldLength = pathHistoryRef.current.length;
    pathHistoryRef.current = pathHistoryRef.current.filter(
      point => currentTime - point.timestamp < 10000
    );
    if (oldLength !== pathHistoryRef.current.length) {
      console.log(`Removed ${oldLength - pathHistoryRef.current.length} old trail points`);
    }

    // Clear old path layers safely
    pathLayersRef.current.forEach(layer => {
      try {
        if (mapRef.current && layer) {
          mapRef.current.removeLayer(layer);
        }
      } catch (e) {
        // Ignore errors during cleanup
      }
    });
    pathLayersRef.current = [];

    // Draw trail with fading effect
    if (pathHistoryRef.current.length > 1) {
      for (let i = 0; i < pathHistoryRef.current.length - 1; i++) {
        const point1 = pathHistoryRef.current[i];
        const point2 = pathHistoryRef.current[i + 1];
        
        // Calculate opacity based on age (newer = more opaque)
        const age = currentTime - point1.timestamp;
        const opacity = Math.max(0.1, 1 - (age / 10000)); // Fade from 1 to 0.1 over 10 seconds
        
        try {
          // Create polyline for this segment
          const polyline = L.polyline(
            [[point1.lat, point1.lng], [point2.lat, point2.lng]],
            {
              color: '#10B981', // Green color
              weight: 4,
              opacity: opacity,
              smoothFactor: 1
            }
          ).addTo(mapRef.current);
          
          pathLayersRef.current.push(polyline);
        } catch (e) {
          console.error('Error drawing trail segment:', e);
        }
      }
      console.log(`Drew ${pathLayersRef.current.length} trail segments`);
    }

    // Update rider marker position with smooth animation
    if (riderMarkerRef.current) {
      try {
        riderMarkerRef.current.setLatLng([riderLat, riderLng]);
      } catch (e) {
        console.error('Error updating rider marker:', e);
      }
    }

  }, [riderLat, riderLng, orderStatus]);

  useEffect(() => {
    let isMounted = true;
    
    const initMap = async () => {
      if (!isMounted || !mapContainerRef.current) return;

      console.log('Starting map initialization...');

      // Dynamically import Leaflet
      const leafletModule = await import('leaflet');
      const L = leafletModule.default;
      leafletRef.current = L;
      
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

      // Add store marker (blue) - Show for assigned orders to indicate pickup location
      if (
        typeof storeLat === 'number' && !isNaN(storeLat) &&
        typeof storeLng === 'number' && !isNaN(storeLng) &&
        typeof orderStatus === 'number' && orderStatus >= 3 && orderStatus !== 5
      ) {
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
          .bindPopup(orderStatus === 3 ? 'Store - Pickup Location' : 'Store - Order Picked Up From');
      }

      // Add delivery marker (red)
      if (
        typeof deliveryLat === 'number' && !isNaN(deliveryLat) &&
        typeof deliveryLng === 'number' && !isNaN(deliveryLng)
      ) {
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

      // Add rider marker (green) - Enhanced with status info and animation
      if (
        typeof riderLat === 'number' && !isNaN(riderLat) &&
        typeof riderLng === 'number' && !isNaN(riderLng) &&
        typeof orderStatus === 'number' && (orderStatus === 3 || orderStatus === 4 || orderStatus === 5)
      ) {
        const riderIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
        
        // Determine rider status message
        const riderStatusMessage = orderStatus === 3 
          ? '🛵 Rider - Going to Store for Pickup' 
          : orderStatus === 4
          ? '🛵 Rider - Delivering to You'
          : '🛵 Rider - Order Delivered';
        
        const riderMarker = L.marker([riderLat, riderLng], { icon: riderIcon })
          .addTo(map)
          .bindPopup(riderStatusMessage);
        
        // Store marker reference for updates
        riderMarkerRef.current = riderMarker;
        
        // Initialize path history with current position
        pathHistoryRef.current = [{
          lat: riderLat,
          lng: riderLng,
          timestamp: Date.now()
        }];
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
      const canCreateRoute = deliveryLat && deliveryLng && (typeof orderStatus !== 'number' || orderStatus !== 5) && (
        (storeLat && storeLng) || (riderLat && riderLng)
      );

      if (canCreateRoute) {
        let waypoints = [];
        
        // Determine waypoints based on order status
        if (orderStatus === 3 && riderLat && riderLng && storeLat && storeLng) {
          // Status 3: Rider -> Store -> Delivery
          waypoints = [
            L.latLng(riderLat, riderLng),
            L.latLng(storeLat, storeLng),
            L.latLng(deliveryLat, deliveryLng)
          ];
        } else if (orderStatus === 4 && riderLat && riderLng) {
          // Status 4: Rider -> Delivery
          waypoints = [
            L.latLng(riderLat, riderLng),
            L.latLng(deliveryLat, deliveryLng)
          ];
        } else if (storeLat && storeLng) {
          // Fallback: Store -> Delivery
          waypoints = [
            L.latLng(storeLat, storeLng),
            L.latLng(deliveryLat, deliveryLng)
          ];
        } else {
          console.log('No valid waypoints for routing');
          mapRef.current = map;
          setTimeout(() => {
            if (mapRef.current) {
              map.invalidateSize();
            }
          }, 100);
          return;
        }

        // Check for valid coordinates before creating route
        const validWaypoints = waypoints.filter(wp => 
          typeof wp.lat === 'number' && !isNaN(wp.lat) &&
          typeof wp.lng === 'number' && !isNaN(wp.lng)
        );

        if (validWaypoints.length >= 2) {
          console.log('Attempting to create route with waypoints:', validWaypoints.map(wp => [wp.lat, wp.lng]));
          console.log('L.Routing available:', !!(L as any).Routing);
          console.log('L.Routing.control available:', !!(L as any).Routing?.control);

          if ((L as any).Routing && (L as any).Routing.control) {
            try {
              console.log('Creating routing control...');
              // Always use green route when rider is active (status 3 or 4)
              // Status 3: Rider going to store (green route from rider to store to delivery)
              // Status 4: Rider going to customer (green route from rider to delivery)
              const routeColor = (typeof orderStatus === 'number' && (orderStatus === 3 || orderStatus === 4) && riderLat && riderLng) 
                ? '#10B981' // Green for active rider route (Tailwind green-500)
                : '#6FA1EC'; // Blue for store route (when no rider assigned yet)
              
              const routingControl = (L as any).Routing.control({
                waypoints: validWaypoints,
                routeWhileDragging: false,
                showAlternatives: false,
                fitSelectedRoutes: true,
                addWaypoints: false,
                draggableWaypoints: false,
                lineOptions: {
                  styles: [{ color: routeColor, weight: 5, opacity: 0.7 }]
                },
                createMarker: function() { return null; }
              });
              console.log('Adding routing control to map...');
              routingControl.addTo(map);
              routingControlRef.current = routingControl;
              console.log('Routing control added successfully');
              
              routingControl.on('routesfound', (e: any) => {
                console.log('✓ Route found successfully!', e.routes);
              });
              
              routingControl.on('routingerror', (e: any) => {
                console.warn('Routing error:', e);
              });
            } catch (error) {
              console.warn('Error creating routing:', error);
            }
          } else {
            console.warn('L.Routing.control not available - routing disabled');
          }
        } else {
          console.warn('Invalid or missing route coordinates - routing disabled', { waypoints: validWaypoints.map(wp => [wp.lat, wp.lng]) });
        }
      } else {
        console.log('Cannot create route - missing required coordinates');
        // At least fit to delivery location
        if (deliveryLat && deliveryLng) {
          map.setView([parseFloat(deliveryLat as any), parseFloat(deliveryLng as any)], 15);
        }
      }

      mapRef.current = map;

      // Safely invalidate size after a delay
      setTimeout(() => {
        if (isMounted && mapRef.current) {
          try {
            mapRef.current.invalidateSize();
          } catch (e) {
            // Ignore
          }
        }
      }, 100);
    };

    initMap();

    return () => {
      isMounted = false;
      
      // Clean up path layers first
      pathLayersRef.current.forEach(layer => {
        try {
          if (mapRef.current && layer && mapRef.current.hasLayer && mapRef.current.hasLayer(layer)) {
            mapRef.current.removeLayer(layer);
          }
        } catch (e) {
          // Ignore
        }
      });
      pathLayersRef.current = [];
      pathHistoryRef.current = [];
      
      // Clean up rider marker
      if (riderMarkerRef.current && mapRef.current) {
        try {
          if (mapRef.current.hasLayer && mapRef.current.hasLayer(riderMarkerRef.current)) {
            mapRef.current.removeLayer(riderMarkerRef.current);
          }
        } catch (e) {
          // Ignore
        }
        riderMarkerRef.current = null;
      }
      
      // Clean up routing control
      if (routingControlRef.current && mapRef.current) {
        try {
          mapRef.current.removeControl(routingControlRef.current);
        } catch (e) {
          // Ignore
        }
        routingControlRef.current = null;
      }
      
      // Finally remove the map
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Ignore
        }
        mapRef.current = null;
      }
      
      leafletRef.current = null;
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
