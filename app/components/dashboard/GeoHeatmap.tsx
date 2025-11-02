/**
 * Geographic Heatmap Component
 * 
 * Visualizes dealership scores across geographic regions
 */

'use client';

import React, { useState } from 'react';
import { MapPin, ZoomIn, ZoomOut } from 'lucide-react';

interface GeoPoint {
  lat: number;
  lng: number;
  score: number;
  label: string;
  dealershipId?: string;
}

interface GeoHeatmapProps {
  data: GeoPoint[];
  center?: { lat: number; lng: number };
  zoom?: number;
}

export const GeoHeatmap: React.FC<GeoHeatmapProps> = ({
  data,
  center = { lat: 26.1420, lng: -81.7948 }, // Default to Naples, FL
  zoom: initialZoom = 10
}) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [hoveredPoint, setHoveredPoint] = useState<GeoPoint | null>(null);

  // Calculate bounds
  const minLat = Math.min(...data.map(d => d.lat));
  const maxLat = Math.max(...data.map(d => d.lat));
  const minLng = Math.min(...data.map(d => d.lng));
  const maxLng = Math.max(...data.map(d => d.lng));

  // Normalize coordinates for SVG (800x600 viewport)
  const width = 800;
  const height = 600;
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const normalizeX = (lng: number) => ((lng - minLng) / lngRange) * width;
  const normalizeY = (lat: number) => height - ((lat - minLat) / latRange) * height;

  const getColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden bg-gray-900 border border-gray-700">
      <svg viewBox="0 0 800 600" className="w-full h-full">
        {/* Map background gradient */}
        <defs>
          <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a1a1a" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="800" height="600" fill="url(#mapGradient)" />

        {/* Grid lines */}
        <g opacity="0.1">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <line
              key={`v-${i}`}
              x1={(i / 5) * width}
              y1="0"
              x2={(i / 5) * width}
              y2={height}
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={(i / 5) * height}
              x2={width}
              y2={(i / 5) * height}
              stroke="currentColor"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Data points */}
        {data.map((point, index) => {
          const x = normalizeX(point.lng);
          const y = normalizeY(point.lat);
          const color = getColor(point.score);
          const isHovered = hoveredPoint === point;

          return (
            <g key={index}>
              {/* Glow effect */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 25 : 20}
                fill={color}
                opacity={isHovered ? 0.3 : 0.2}
                className={isHovered ? 'animate-pulse' : ''}
                filter="url(#glow)"
              />
              
              {/* Main point */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 8 : 6}
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />

              {/* Label for hovered point */}
              {isHovered && (
                <g>
                  <rect
                    x={x - 50}
                    y={y - 40}
                    width="100"
                    height="30"
                    rx="4"
                    fill="rgba(0, 0, 0, 0.8)"
                    stroke={color}
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y - 25}
                    textAnchor="middle"
                    className="text-xs fill-white font-semibold"
                  >
                    {point.label}
                  </text>
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    className="text-xs fill-white"
                  >
                    Score: {point.score}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 p-3 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700">
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-300">Score 80-100</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-300">Score 60-79</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-gray-300">Score &lt;60</span>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom(prev => Math.min(prev + 1, 20))}
          className="p-2 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700 hover:bg-gray-800 text-white"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(prev - 1, 1))}
          className="p-2 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700 hover:bg-gray-800 text-white"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="absolute top-4 left-4 px-3 py-2 rounded-lg bg-gray-900/90 backdrop-blur-sm border border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <MapPin className="w-4 h-4" />
          <span>{data.length} dealerships</span>
        </div>
      </div>
    </div>
  );
};

