"use client";

import { Card } from "@/components/ui/card";

interface PillarRadarChartProps {
  pillars: {
    seo: number;
    aeo: number;
    geo: number;
    ugc: number;
    geoLocal: number;
  };
}

export default function PillarRadarChart({ pillars }: PillarRadarChartProps) {
  const pillarData = [
    { name: 'SEO', value: pillars.seo, color: '#3b82f6', label: 'Search Engine Optimization' },
    { name: 'AEO', value: pillars.aeo, color: '#8b5cf6', label: 'Answer Engine Optimization' },
    { name: 'GEO', value: pillars.geo, color: '#10b981', label: 'Generative Engine Optimization' },
    { name: 'UGC', value: pillars.ugc, color: '#f59e0b', label: 'User Generated Content' },
    { name: 'GeoLocal', value: pillars.geoLocal, color: '#ef4444', label: 'Local/Geographic Signals' }
  ];

  // Calculate radar chart points (pentagon)
  const centerX = 150;
  const centerY = 150;
  const maxRadius = 120;
  const numPoints = pillarData.length;

  const getPoint = (index: number, value: number, radius: number) => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const r = (radius * value) / 100;
    return {
      x: centerX + r * Math.cos(angle),
      y: centerY + r * Math.sin(angle)
    };
  };

  // Generate polygon path
  const dataPoints = pillarData.map((pillar, index) =>
    getPoint(index, pillar.value, maxRadius)
  );
  const polygonPath = dataPoints.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  // Generate grid circles
  const gridLevels = [20, 40, 60, 80, 100];

  // Generate axis lines
  const axisLines = pillarData.map((_, index) => {
    const end = getPoint(index, 100, maxRadius);
    return { x: end.x, y: end.y };
  });

  return (
    <Card className="bg-white/5 border-white/10 p-6">
      <h3 className="text-xl font-semibold mb-6 text-white">Five Pillars Radar</h3>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* SVG Radar Chart */}
        <svg width="300" height="300" className="flex-shrink-0">
          {/* Grid circles */}
          {gridLevels.map((level, i) => {
            const r = (maxRadius * level) / 100;
            return (
              <circle
                key={`grid-${i}`}
                cx={centerX}
                cy={centerY}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis lines */}
          {axisLines.map((point, index) => (
            <line
              key={`axis-${index}`}
              x1={centerX}
              y1={centerY}
              x2={point.x}
              y2={point.y}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          ))}

          {/* Data polygon */}
          <path
            d={polygonPath}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgba(59, 130, 246, 0.8)"
            strokeWidth="2"
          />

          {/* Data points */}
          {dataPoints.map((point, index) => (
            <circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill={pillarData[index].color}
              stroke="white"
              strokeWidth="2"
            />
          ))}

          {/* Labels */}
          {pillarData.map((pillar, index) => {
            const labelPoint = getPoint(index, 115, maxRadius);
            return (
              <text
                key={`label-${index}`}
                x={labelPoint.x}
                y={labelPoint.y}
                fill="white"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {pillar.name}
              </text>
            );
          })}
        </svg>

        {/* Legend with values */}
        <div className="flex-1 space-y-3 w-full">
          {pillarData.map((pillar, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: pillar.color }}
                />
                <div>
                  <div className="text-sm font-semibold text-white">{pillar.name}</div>
                  <div className="text-xs text-gray-400">{pillar.label}</div>
                </div>
              </div>
              <div className="text-xl font-bold text-white">{pillar.value.toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-400">Average</div>
            <div className="text-2xl font-bold text-white">
              {(Object.values(pillars).reduce((a, b) => a + b, 0) / Object.values(pillars).length).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Strongest</div>
            <div className="text-2xl font-bold text-green-400">
              {pillarData.reduce((max, p) => p.value > max.value ? p : max).name}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Opportunity</div>
            <div className="text-2xl font-bold text-yellow-400">
              {pillarData.reduce((min, p) => p.value < min.value ? p : min).name}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
