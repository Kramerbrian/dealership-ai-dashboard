'use client';

import { useEffect, useState } from 'react';

interface RadarData {
  dimensions: Array<{
    name: string;
    angle: number;
    signal: number;
    weight: number;
  }>;
  overall_signal: number;
  timestamp: string;
  profile?: Array<{ angle: number; signal: number }>;
}

interface PulseRadarProps {
  dealerId: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export function PulseRadar({ dealerId, timeRange }: PulseRadarProps) {
  const [radarData, setRadarData] = useState<RadarData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/pulse/radar?dealerId=${dealerId}`)
      .then(res => res.json())
      .then(data => {
        setRadarData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch radar data:', err);
        setLoading(false);
      });
  }, [dealerId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!radarData) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
        <p className="text-gray-500">Failed to load radar data</p>
      </div>
    );
  }

  // Simple SVG radar visualization
  const centerX = 200;
  const centerY = 200;
  const radius = 150;

  const getCoordinates = (angle: number, signal: number) => {
    const x = centerX + radius * signal * Math.cos(angle);
    const y = centerY + radius * signal * Math.sin(angle);
    return { x, y };
  };

  const points = radarData.dimensions.map(dim => {
    const coords = getCoordinates(dim.angle, dim.signal);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pulse Radar</h3>
      
      <div className="flex items-center justify-center">
        <svg width="400" height="400" viewBox="0 0 400 400" className="overflow-visible">
          {/* Grid circles */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map(scale => (
            <circle
              key={scale}
              cx={centerX}
              cy={centerY}
              r={radius * scale}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Axis lines */}
          {radarData.dimensions.map((dim, i) => {
            const coords = getCoordinates(dim.angle, 1);
            return (
              <line
                key={i}
                x1={centerX}
                y1={centerY}
                x2={coords.x}
                y2={coords.y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}
          
          {/* Data polygon */}
          <polygon
            points={points}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
          />
          
          {/* Dimension labels */}
          {radarData.dimensions.map((dim, i) => {
            const labelCoords = getCoordinates(dim.angle, 1.15);
            return (
              <text
                key={i}
                x={labelCoords.x}
                y={labelCoords.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {dim.name}
              </text>
            );
          })}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {radarData.dimensions.map((dim, i) => (
          <div key={i} className="text-sm">
            <div className="text-xs text-gray-500 mb-1">{dim.name}</div>
            <div className="font-semibold">{(dim.signal * 100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
