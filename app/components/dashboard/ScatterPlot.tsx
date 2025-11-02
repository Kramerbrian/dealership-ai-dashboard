/**
 * Multi-Dimensional Scatter Plot
 * 
 * Visualizes Trust Score vs Revenue with market share sizing
 */

'use client';

import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

interface ScatterPoint {
  x: number; // Trust Score (0-100)
  y: number; // Revenue ($K)
  size: number; // Market share (0-1)
  label: string;
  isYou?: boolean;
  dealershipId?: string;
}

interface ScatterPlotProps {
  data: ScatterPoint[];
  width?: number;
  height?: number;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  width = 600,
  height = 400
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const padding = 40;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  // Calculate scales
  const xMax = Math.max(...data.map(d => d.x), 100);
  const yMax = Math.max(...data.map(d => d.y), 100);
  const sizeMax = Math.max(...data.map(d => d.size), 1);

  const scaleX = (x: number) => padding + (x / xMax) * plotWidth;
  const scaleY = (y: number) => height - padding - (y / yMax) * plotHeight;
  const scaleSize = (size: number) => (size / sizeMax) * 20 + 5; // 5-25px radius

  return (
    <div className="relative bg-gray-900 rounded-xl border border-gray-700 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">Trust Score vs Revenue</h3>
        <p className="text-sm text-gray-400">Bubble size represents market share</p>
      </div>

      <svg width={width} height={height} className="overflow-visible">
        {/* Grid lines */}
        <g opacity="0.1">
          {[0, 25, 50, 75, 100].map(val => (
            <line
              key={`x-${val}`}
              x1={scaleX(val)}
              y1={padding}
              x2={scaleX(val)}
              y2={height - padding}
              stroke="currentColor"
              strokeDasharray="2,2"
            />
          ))}
          {[0, 25, 50, 75, 100].map(val => (
            <line
              key={`y-${val}`}
              x1={padding}
              y1={scaleY(val)}
              x2={width - padding}
              y2={scaleY(val)}
              stroke="currentColor"
              strokeDasharray="2,2"
            />
          ))}
        </g>

        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-600"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-600"
        />

        {/* Axis labels */}
        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          className="text-xs fill-gray-400"
        >
          Trust Score
        </text>
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${height / 2})`}
          className="text-xs fill-gray-400"
        >
          Revenue Impact ($K)
        </text>

        {/* Data points */}
        {data.map((point, index) => {
          const x = scaleX(point.x);
          const y = scaleY(point.y);
          const radius = scaleSize(point.size);
          const isHovered = hoveredPoint === point.label;

          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={point.isYou ? '#8b5cf6' : '#6b7280'}
                opacity={isHovered ? 1 : point.isYou ? 0.8 : 0.6}
                stroke={point.isYou ? '#ffffff' : 'none'}
                strokeWidth="2"
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHoveredPoint(point.label)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {point.isYou && (
                <text
                  x={x}
                  y={y - radius - 5}
                  textAnchor="middle"
                  className="text-xs fill-purple-500 font-semibold"
                >
                  YOU
                </text>
              )}
              {isHovered && (
                <g>
                  <rect
                    x={x + 15}
                    y={y - 25}
                    width="120"
                    height="50"
                    rx="4"
                    fill="rgba(0, 0, 0, 0.9)"
                    stroke={point.isYou ? '#8b5cf6' : '#6b7280'}
                    strokeWidth="1"
                  />
                  <text
                    x={x + 20}
                    y={y - 10}
                    className="text-xs fill-white font-semibold"
                  >
                    {point.label}
                  </text>
                  <text
                    x={x + 20}
                    y={y + 5}
                    className="text-xs fill-gray-300"
                  >
                    Score: {point.x}
                  </text>
                  <text
                    x={x + 20}
                    y={y + 18}
                    className="text-xs fill-gray-300"
                  >
                    Revenue: ${point.y}K
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Trend line (simple linear regression for demo) */}
        {data.length > 2 && (
          <line
            x1={scaleX(0)}
            y1={scaleY(0)}
            x2={scaleX(100)}
            y2={scaleY(100)}
            stroke="#8b5cf6"
            strokeWidth="1"
            strokeDasharray="4,4"
            opacity="0.5"
          />
        )}
      </svg>

      {/* Quadrant labels */}
      <div className="absolute top-20 right-4 text-xs text-gray-500 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Your Dealership</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-600" />
          <span>Competitors</span>
        </div>
      </div>
    </div>
  );
};

