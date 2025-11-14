"use client";
import React from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const demoData = [
  { v: 72 }, { v: 74 }, { v: 71 }, { v: 76 }, { v: 78 }, { v: 80 }, { v: 82 }
];

export function MetricTrendSpark() {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={demoData}>
        <Line
          type="monotone"
          dataKey="v"
          stroke="#34d399"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
