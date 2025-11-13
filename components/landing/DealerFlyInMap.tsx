/**
 * DealerFlyInMap - Cinematic 3-step map animation
 * Christopher Nolan-inspired dramatic zoom into dealership location
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapStyle, getMapboxToken } from '@/lib/config/mapbox-styles';

type MapMode = 'night' | 'day';

interface DealerFlyInMapProps {
  lat: number;
  lng: number;
  mode?: MapMode;
  nightStyleUrl?: string;
  dayStyleUrl?: string;
  className?: string;
}

export default function DealerFlyInMap({
  lat,
  lng,
  mode = 'night',
  nightStyleUrl,
  dayStyleUrl,
  className = '',
}: DealerFlyInMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Get style URL based on mode
    const styleUrl = mode === 'day'
      ? (dayStyleUrl || getMapStyle('light'))
      : (nightStyleUrl || getMapStyle('dark'));

    const accessToken = getMapboxToken();
    if (!accessToken) {
      console.error('Mapbox access token not found');
      return;
    }

    mapboxgl.accessToken = accessToken;

    // Initialize map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: [0, 20], // Start far away
      zoom: 2,
      pitch: 0,
      bearing: 0,
      interactive: false,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      setIsLoaded(true);

      // Add custom marker for dealership
      const el = document.createElement('div');
      el.className = 'dealership-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = mode === 'day' ? '#f59e0b' : '#06b6d4';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.6s ease-in';

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .addTo(map);

      markerRef.current = marker;

      // Cinematic 3-step animation
      // Step 1: Fly to region (800ms)
      map.easeTo({
        center: [lng, lat],
        zoom: 4,
        pitch: 0,
        bearing: 0,
        duration: 800,
        easing: (t) => t * (2 - t), // ease-out
      });

      // Step 2: Zoom closer with tilt (1800ms total)
      setTimeout(() => {
        map.easeTo({
          zoom: 8,
          pitch: mode === 'day' ? 15 : 20,
          bearing: mode === 'day' ? -5 : -10,
          duration: 1000,
          easing: (t) => t * (2 - t),
        });
      }, 800);

      // Step 3: Final rooftop lock-in (3000ms total)
      setTimeout(() => {
        map.easeTo({
          zoom: 13.5,
          pitch: mode === 'day' ? 30 : 45,
          bearing: mode === 'day' ? -10 : -20,
          duration: 1200,
          easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t, // ease-in-out
        });

        // Show marker after final zoom
        setTimeout(() => {
          if (el) el.style.opacity = '1';
        }, 400);
      }, 1800);
    });

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [lat, lng, mode, nightStyleUrl, dayStyleUrl]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
          <div className="text-white/60 text-sm">Loading map...</div>
        </div>
      )}

      {/* Legend */}
      {isLoaded && (
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 text-xs text-white/80">
            <div
              className="w-3 h-3 rounded-full border-2 border-white"
              style={{ backgroundColor: mode === 'day' ? '#f59e0b' : '#06b6d4' }}
            />
            <span>Your Dealership</span>
          </div>
        </div>
      )}
    </div>
  );
}
