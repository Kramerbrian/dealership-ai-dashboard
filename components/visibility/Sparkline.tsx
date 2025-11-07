"use client";
import React from "react";

export default function Sparkline({
  values,
  width = 260,
  height = 50,
  stroke = "#93C5FD", // sky-400
  fill = "rgba(147, 197, 253, 0.15)", // sky-400/15
}: {
  values: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
}) {
  if (!values || values.length === 0) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const w = width;
  const h = height;
  const pad = 4;
  const xs = values.map((_, i) => pad + (i * (w - pad * 2)) / (values.length - 1));
  const ys = values.map((v) => {
    const t = (v - min) / Math.max(1, max - min);
    return h - pad - t * (h - pad * 2);
  });
  const path = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`)
    .join(" ");
  const under = `${path} L${(w - pad).toFixed(1)},${(h - pad).toFixed(1)} L${pad.toFixed(1)},${(h - pad).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w}
      height={h}
      role="img"
      aria-label="AIV trend"
    >
      <path d={under} fill={fill} stroke="none" />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

