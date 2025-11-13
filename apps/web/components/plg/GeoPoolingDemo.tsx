"use client";
import React, { useState } from "react";

function Card({ k, v }: { k: string; v: string }) {
  return (
    <div className="p-4 border rounded-xl bg-gray-50">
      <div className="text-xs text-gray-500">{k}</div>
      <div className="text-xl font-bold">{v}</div>
    </div>
  );
}

export default function GeoPoolingDemo() {
  const [dealers, setDealers] = useState(12);
  const [msrpDelta, setMsrp] = useState(5000);

  const baseCost = 4000; // example fixed ops cost
  const unitLift = Math.round(msrpDelta * 0.0015 * 10) / 10; // naive elasticity
  const perStore = Math.max(500, Math.round(baseCost / dealers));

  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
      <div>
        <h3 className="text-2xl font-bold mb-4">
          How geo-pooling beats price swings
        </h3>
        <p className="text-gray-600 mb-4">
          Distribute OEM price shocks across a market cohort. See how fixed
          costs amortize as network size grows.
        </p>
        <label className="text-sm text-gray-600">
          Rooftops in cohort: {dealers}
        </label>
        <input
          type="range"
          min="4"
          max="40"
          value={dealers}
          onChange={(e) => setDealers(parseInt(e.target.value))}
          className="w-full"
        />
        <label className="text-sm text-gray-600">
          MSRP change: ${msrpDelta}
        </label>
        <input
          type="range"
          min="0"
          max="8000"
          step="250"
          value={msrpDelta}
          onChange={(e) => setMsrp(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card k="Per-store fixed cost" v={`$${perStore.toLocaleString()}`} />
        <Card k="Est. unit lift" v={`+${unitLift} units/mo`} />
        <Card
          k="Break-even units"
          v={`${Math.max(1, Math.ceil(perStore / 500))}`}
        />
        <Card
          k="Network efficiency"
          v={`${Math.min(95, Math.round((dealers / 40) * 100))}%`}
        />
      </div>
    </div>
  );
}
