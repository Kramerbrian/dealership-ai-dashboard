import React from 'react';

interface MapOverlayProps {
  center: { lat: number; lng: number };
  competitors: {
    name: string;
    lat?: number;
    lng?: number;
    score: number;
  }[];
}

export default function MapOverlay({ center, competitors }: MapOverlayProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(60%_50%_at_50%_0%,rgba(14,165,233,0.25),rgba(14,165,233,0)_70%)]" />
      <div className="p-3 text-xs text-white/70">
        Competitive Ring • {competitors.length} rivals
      </div>
      <div className="h-[360px] bg-white/5 grid place-items-center text-white/40 text-sm">
        Map Placeholder (plug your Maps component). Show rings and pins colored
        by score.
      </div>
    </div>
  );
}

