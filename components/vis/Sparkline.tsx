"use client";

import React from "react";

export default function Sparkline({
  points,                      // e.g., [68,72,71,75,78,80,82]
  width = 160,
  height = 36,
  stroke = "rgba(255,255,255,0.85)",
  fill = "rgba(255,255,255,0.08)"
}: {
  points: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
}) {
  if (!points?.length) return null;
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const pad = 4;
  const w = width, h = height;
  const sx = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, points.length - 1);
  const sy = (v: number) => pad + (h - pad * 2) * (1 - (v - min) / Math.max(1, max - min));
  const path = points.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i)},${sy(v)}`).join(" ");

  const area = `${path} L ${sx(points.length - 1)},${h - pad} L ${sx(0)},${h - pad} Z`;

  const last = points[points.length - 1];
  const first = points[0];
  const delta = last - first;

  return (
    <div className="flex items-center gap-2">
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
        <path d={area} fill={fill} />
        <path d={path} stroke={stroke} strokeWidth={1.75} fill="none" strokeLinecap="round" />
      </svg>
      <div className={`text-xs ${delta >= 0 ? "text-green-400" : "text-red-400"}`}>
        {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(0)}
      </div>
    </div>
  );
}

