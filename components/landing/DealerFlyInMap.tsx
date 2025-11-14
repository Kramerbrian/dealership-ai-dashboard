"use client";

import React from 'react';

const containerStyle: React.CSSProperties = {
  width: '100%',
  height: '320px',
  borderRadius: '24px',
  overflow: 'hidden',
  backgroundColor: '#1a1a1a',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#666',
  fontSize: '14px'
};

type DealerFlyInMapProps = {
  lat: number;
  lng: number;
};

export function DealerFlyInMap({ lat, lng }: DealerFlyInMapProps) {
  // Mapbox removed - show placeholder
  return (
    <div
      style={containerStyle}
      className="shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
    >
      <div className="text-center">
        <div className="text-white/40 mb-2">📍 Map View</div>
        <div className="text-white/20 text-xs">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </div>
      </div>
    </div>
  );
}
