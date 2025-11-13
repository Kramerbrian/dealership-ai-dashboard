'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface DealerFlyInMapProps {
  location?: {
    lat: number;
    lng: number;
    city?: string;
    state?: string;
  };
}

export function DealerFlyInMap({ location }: DealerFlyInMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!location || !mapContainer.current) return;

    const mapboxKey = process.env.NEXT_PUBLIC_MAPBOX_KEY;
    if (!mapboxKey) {
      console.warn('Mapbox key not found. Map will not render.');
      return;
    }

    // Dynamically load Mapbox GL
    import('mapbox-gl').then((mapboxgl) => {
      mapboxgl.default.accessToken = mapboxKey;

      if (mapRef.current) {
        mapRef.current.remove();
      }

      mapRef.current = new mapboxgl.default.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [location.lng, location.lat],
        zoom: 12,
        pitch: 45,
        bearing: -17.6,
      });

      // Add marker
      new mapboxgl.default.Marker({ color: '#0ea5e9' })
        .setLngLat([location.lng, location.lat])
        .addTo(mapRef.current);

      // Fly in animation
      mapRef.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 14,
        duration: 2000,
        essential: true,
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [location]);

  if (!location) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-64 md:h-96 rounded-xl overflow-hidden border border-white/10 relative"
    >
      <div ref={mapContainer} className="w-full h-full" />
      {location.city && location.state && (
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg text-sm">
          {location.city}, {location.state}
        </div>
      )}
    </motion.div>
  );
}
