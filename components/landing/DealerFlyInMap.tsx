'use client';

import { useEffect, useRef } from 'react';
import mapboxgl, { Map } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
};

export function DealerFlyInMap({ lat, lng }: DealerFlyInMapProps) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!mapNode.current || mapRef.current || !mapboxgl.accessToken) return;

    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2,
      pitch: 0,
      bearing: 0,
      interactive: false
    });

    mapRef.current = map;

    map.on('load', () => {
      new mapboxgl.Marker({ color: '#3B82F6' })
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
  }, [lat, lng]);

  return (
    <div
      ref={mapNode}
      style={containerStyle}
      className="shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
    />
  );
}
