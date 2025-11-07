// components/pulse/ZeroClickHeat.tsx
'use client';

import React from 'react';

export default function ZeroClickHeat({
  cells,
  onCellClick
}: {
  cells: Array<{ pillar: string; device: string; exposurePct: number; verified: boolean }>;
  onCellClick: (cell: any) => void;
}) {
  return (
    <div className="border border-white/10 rounded-lg p-4 bg-white/5">
      <h3 className="font-medium mb-3">Zero-Click Heat</h3>
      <div className="grid grid-cols-2 gap-2">
        {cells.map((cell, i) => (
          <div
            key={i}
            onClick={() => onCellClick(cell)}
            className="p-2 border border-white/10 rounded cursor-pointer hover:bg-white/10"
          >
            <div className="text-xs text-white/60">{cell.pillar} • {cell.device}</div>
            <div className="text-sm font-medium">{cell.exposurePct}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
