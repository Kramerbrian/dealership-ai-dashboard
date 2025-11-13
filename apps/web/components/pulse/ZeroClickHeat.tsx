"use client";

import { motion } from "framer-motion";

interface HeatCell {
  pillar: string;
  device: 'Mobile' | 'Desktop';
  exposurePct: number;
  verified: boolean;
}

interface ZeroClickHeatProps {
  cells: HeatCell[];
  onCellClick?: (cell: HeatCell) => void;
}

export default function ZeroClickHeat({ cells, onCellClick }: ZeroClickHeatProps) {
  const pillars = Array.from(new Set(cells.map(c => c.pillar)));
  const devices = ['Mobile', 'Desktop'] as const;

  return (
    <div className="bg-white/2 border border-white/10 rounded-lg p-5">
      <h3 className="text-lg font-semibold mb-4">Zero-Click Heat Map</h3>
      <div className="grid grid-cols-2 gap-4">
        {devices.map(device => (
          <div key={device}>
            <div className="text-sm text-white/60 mb-2">{device}</div>
            <div className="space-y-2">
              {pillars.map(pillar => {
                const cell = cells.find(c => c.pillar === pillar && c.device === device);
                if (!cell) return null;
                
                const intensity = Math.min(100, Math.max(0, cell.exposurePct)) / 100;
                const bgOpacity = 0.1 + (intensity * 0.4);
                
                return (
                  <motion.div
                    key={`${device}-${pillar}`}
                    className={`p-3 rounded-lg border border-white/10 cursor-pointer ${
                      cell.verified ? 'ring-2 ring-green-400/50' : ''
                    }`}
                    style={{ backgroundColor: `rgba(255, 255, 255, ${bgOpacity})` }}
                    onClick={() => onCellClick?.(cell)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{pillar}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cell.exposurePct.toFixed(0)}%</span>
                        {cell.verified && (
                          <span className="text-xs text-green-400">✓</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

