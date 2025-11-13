'use client';

import { useEffect, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapStyle, type MapTheme } from '@/lib/config/mapbox-styles';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_KEY || '';

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '320px',
  borderRadius: '24px',
  overflow: 'hidden',
  position: 'relative'
};

type DealerFlyInMapProps = {
  lat: number;
  lng: number;
  mode: 'night' | 'day';
  nightStyleUrl?: string;
  dayStyleUrl?: string;
};

export function DealerFlyInMap({
  lat,
  lng,
  mode,
  nightStyleUrl,
  dayStyleUrl
}: DealerFlyInMapProps) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapNode.current || mapRef.current || !mapboxgl.accessToken) return;

    // Use provided URLs or fall back to config
    const styleUrl = mode === 'day' 
      ? (dayStyleUrl || getMapStyle('light'))
      : (nightStyleUrl || getMapStyle('dark'));

    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: styleUrl,
      center: [0, 20],
      zoom: 2,
      pitch: 0,
      bearing: 0,
      interactive: false
    });

    mapRef.current = map;

    map.on('load', () => {
      // Marker for your dealership
      new mapboxgl.Marker({ color: '#3B82F6' })
        .setLngLat([lng, lat])
        .addTo(map);

      // Step 1: region-level, flat
      map.easeTo({
        center: [lng, lat],
        zoom: 4,
        pitch: 0,
        bearing: 0,
        duration: 800,
        essential: true
      });

      // Step 2: closer, slight tilt
      setTimeout(() => {
        map.easeTo({
          center: [lng, lat],
          zoom: 8,
          pitch: mode === 'day' ? 15 : 20,
          bearing: mode === 'day' ? -5 : -10,
          duration: 1000,
          essential: true
        });
      }, 800);

      // Step 3: final rooftop lock-in, cinematic tilt
      setTimeout(() => {
        map.easeTo({
          center: [lng, lat],
          zoom: 13.5,
          pitch: mode === 'day' ? 30 : 45,
          bearing: mode === 'day' ? -10 : -20,
          duration: 1200,
          essential: true
        });
      }, 1800);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, mode, nightStyleUrl, dayStyleUrl]);

  return (
    <div style={containerStyle}>
      {/* Map container */}
      <div
        ref={mapNode}
        className="w-full h-full shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      />

      {/* Legend overlay */}
      <div className="absolute top-3 left-3 rounded-2xl bg-black/60 backdrop-blur px-3 py-2 text-[11px] text-white/70 border border-white/20">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#3B82F6]" />
          <span>Your dealership</span>
        </div>
        <div className="mt-1 flex items-center gap-2 opacity-70">
          <span className="inline-block w-2 h-2 rounded-full border border-white/60" />
          <span>Nearby competitors</span>
        </div>
      </div>
    </div>
  );
}
