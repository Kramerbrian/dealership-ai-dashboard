/**
 * Fleet Dashboard - 5k Rooftops View
 * Server-side filtered list with bulk refresh
 */

import React from 'react';
import { cacheGet, cacheSet } from '@/lib/redis';

async function getFleetData() {
  const base = process.env.FLEET_API_BASE || process.env.NEXT_PUBLIC_FLEET_API_BASE || '';
  const key = process.env.X_API_KEY || '';

  if (!base) {
    return { origins: [] };
  }

  // Check cache first
  const cacheKey = 'fleet:origins';
  const cached = await cacheGet<any>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = new URL('/api/origins', base);
    const response = await fetch(url.toString(), {
      headers: {
        'x-api-key': key,
        'X-Orchestrator-Role': 'AI_CSO',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return { origins: [] };
    }

    const data = await response.json();
    
    // Cache for 5 minutes
    await cacheSet(cacheKey, data, 300);
    
    return data;
  } catch (error) {
    console.error('Fleet data fetch error:', error);
    return { origins: [] };
  }
}

export const dynamic = 'force-dynamic';

export default async function FleetPage() {
  const data = await getFleetData();
  const rows = (data?.origins || []).slice(0, 5000);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Fleet — Rooftop Visibility</h1>
          <p className="text-gray-400">Managing {rows.length} rooftops</p>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900/50 backdrop-blur-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-300">Origin</th>
                  <th className="text-center p-3 font-semibold text-gray-300">AI Vis %</th>
                  <th className="text-center p-3 font-semibold text-gray-300">Schema %</th>
                  <th className="text-center p-3 font-semibold text-gray-300">UGC</th>
                  <th className="text-center p-3 font-semibold text-gray-300">Revenue-at-Risk</th>
                  <th className="text-center p-3 font-semibold text-gray-300">Last Refresh</th>
                  <th className="text-center p-3 font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
                      No rooftops found. Check FLEET_API_BASE configuration.
                    </td>
                  </tr>
                ) : (
                  rows.map((r: any, i: number) => (
                    <tr
                      key={i}
                      className="border-t border-gray-700 hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="p-3 font-mono text-xs text-gray-300">{r.origin}</td>
                      <td className="p-3 text-center">
                        {typeof r.metrics?.oci === 'number'
                          ? `${(r.metrics.oci * 100).toFixed(0)}%`
                          : '—'}
                      </td>
                      <td className="p-3 text-center">
                        {typeof r.metrics?.schema === 'number'
                          ? `${(r.metrics.schema * 100).toFixed(0)}%`
                          : '—'}
                      </td>
                      <td className="p-3 text-center">
                        {typeof r.metrics?.ugc === 'number'
                          ? `${(r.metrics.ugc * 100).toFixed(0)}%`
                          : '—'}
                      </td>
                      <td className="p-3 text-center text-amber-400">
                        {r.metrics?.revRisk ? `$${r.metrics.revRisk.toLocaleString()}` : '—'}
                      </td>
                      <td className="p-3 text-center text-gray-400 text-xs">
                        {r.lastRefresh || 'Never'}
                      </td>
                      <td className="p-3 text-center">
                        <form
                          action={`/api/refresh?origin=${encodeURIComponent(r.origin)}`}
                          method="post"
                        >
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-xs font-medium"
                          >
                            Refresh
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

