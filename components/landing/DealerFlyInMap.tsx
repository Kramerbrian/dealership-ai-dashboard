'use client';

import { useEffect, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapStyle, type MapTheme } from '@/lib/config/mapbox-styles';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY || '';

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '320px',
  borderRadius: '24px',
  overflow: 'hidden'
};

type DealerFlyInMapProps = {
  lat: number;
  lng: number;
  theme?: MapTheme;
  /** Custom marker color (defaults to blue for dark mode, darker blue for light mode) */
  markerColor?: string;
  /** Enable user interaction (pan, zoom). Default: false for cinematic effect */
  interactive?: boolean;
};

export function DealerFlyInMap({
  lat,
  lng,
  theme = 'dark',
  markerColor,
  interactive = false
}: DealerFlyInMapProps) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapNode.current || mapRef.current || !mapboxgl.accessToken) return;

    // Default marker colors based on theme
    const defaultMarkerColor = theme === 'dark' ? '#3B82F6' : '#1E40AF';

    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: getMapStyle(theme),
      center: [0, 20],
      zoom: 2,
      pitch: 45,
      bearing: 340,
      interactive
    });

    mapRef.current = map;

    map.on('load', () => {
      new mapboxgl.Marker({ color: markerColor || defaultMarkerColor })
        .setLngLat([lng, lat])
        .addTo(map);

      map.flyTo({
        center: [lng, lat],
        zoom: 13.5,
        speed: 0.8,
        curve: 1.6,
        essential: true
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, theme, markerColor, interactive]);

  return (
    <div
      ref={mapNode}
      style={containerStyle}
      className="shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
    />
  );
}
