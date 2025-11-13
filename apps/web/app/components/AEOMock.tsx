"use client";

import React from 'react';

export default function AEOMock() {
  const latest = { aeo: 0.25, ours: 0.18, queries: 2310, run_date: '2025-10-15' };
  const trend = [25,24,23,22,21,20,21,22,23,22,21,20];
  const trendOurs = [18,18,17,17,16,16,16,17,17,17,16,16];
  const breakdown = [
    { key: 'aeo', label: 'AI Overviews', total: 678 },
    { key: 'fs', label: 'Featured Snippets', total: 29 },
    { key: 'paa', label: 'People Also Ask', total: 20 },
    { key: 'local', label: 'Local Pack', total: 51 },
    { key: 'none', label: 'None', total: 22 }
  ];
  const leaderboard = [
    { domain: 'example.com', appearances: 153, ours: 94.4 },
    { domain: 'domaine.com', appearances: 94, ours: 61.4 },
    { domain: 'google.com', appearances: 50, ours: 37.9 },
    { domain: 'networke.com', appearances: 49, ours: 34.7 },
    { domain: 'linknet.com', appearances: 43, ours: 32.5 },
    { domain: 'ipeepite.com', appearances: 33, ours: 23.6 },
    { domain: 'speddir.com', appearances: 25, ours: 21.5 },
    { domain: 'triengle.com', appearances: 24, ours: 21.8 }
  ];
  
  return (
    <div className="p-6 space-y-6 bg-neutral-50 text-neutral-900">
      <div className="flex gap-3">
        <button className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm">Seed New Panel</button>
        <button className="rounded-lg border border-neutral-300 px-4 py-2 text-sm bg-white">Export CSV</button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Kpi label="AEO Impression %" value={pct(latest.aeo)} />
        <Kpi label="Ours First %" value={pct(latest.ours)} />
        <Kpi label="# Queries" value={latest.queries.toLocaleString()} />
        <Kpi label="Last Run" value={latest.run_date} />
      </div>

      <Card>
        <h2 className="text-lg font-semibold mb-3">12-Week Trend</h2>
        <svg width="100%" height="140" viewBox="0 0 600 140">
          <polyline fill="none" stroke="#111" strokeWidth="2" points={poly(trend)} />
          <polyline fill="none" stroke="#666" strokeDasharray="6 4" strokeWidth="2" points={poly(trendOurs)} />
        </svg>
        <div className="text-xs text-neutral-500">AEO (solid) • Ours First (dashed)</div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold mb-3">Answer Surface Breakdown (30 days)</h2>
          <div className="space-y-3">
            {breakdown.map((r)=>{
              const total = breakdown.reduce((s,x)=>s+x.total,0);
              const p = Math.round((r.total/total)*100);
              return (
                <div key={r.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-700">{r.label}</span>
                    <span className="text-neutral-500">{p}%</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-2 bg-neutral-900" style={{ width: p + '%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold mb-3">Domain Leaderboard (30 days)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2">Domain</th>
                <th>Appearances</th>
                <th>Our Win %</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r)=> (
                <tr key={r.domain} className="border-t">
                  <td className="py-2">{r.domain}</td>
                  <td>{r.appearances}</td>
                  <td>{r.ours.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">How it's measured</h2>
        <ul className="list-disc ml-5 text-sm text-neutral-600">
          <li><b>aeo_impression</b> — when any answer surface appears (AEO/FS/PAA/Local).</li>
          <li><b>aeo_click</b> — click to our domain from an answer surface.</li>
          <li><b>assisted_conv</b> — calls/directions/messages originating from answer surfaces.</li>
        </ul>
      </Card>
    </div>
  );
}

function Kpi({label, value}:{label:string; value:string|number}){
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm text-neutral-600">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Card({children}:{children:any}){
  return <div className="rounded-2xl border p-4 bg-white shadow-sm">{children}</div>;
}

function pct(n:number){
  return `${(n*100).toFixed(0)}%`;
}

function poly(series:number[]){
  // map 12 points across width 580px with 30px padding, invert y within 0..30
  const padX = 10, padY = 10, w = 580, h = 120;
  const max = 30, min = 0;
  const step = w/(series.length-1);
  return series.map((v,i)=>{
    const x = padX + i*step;
    const y = h - padY - ((v-min)/(max-min))*(h-2*padY);
    return `${x},${y}`;
  }).join(' ');
}
