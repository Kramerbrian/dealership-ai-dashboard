/**
 * Free Audit Widget - PLG Landing Page Component
 * Instant AI visibility audit for prospects
 */

'use client';

import React, { useState } from 'react';
import type { AiScoresResponse } from '@/lib/types/AiScores';
// import { getPersonalityCopy } from '@/lib/cognitive-personality';

export default function FreeAuditWidget() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AiScoresResponse | null>(null);
  const [err, setErr] = useState('');

  const personality = getPersonalityCopy('progress');

  async function runAudit() {
    if (!url.trim()) return;
    
    setLoading(true);
    setErr('');
    setData(null);

    try {
      const r = await fetch(`/api/ai-scores?origin=${encodeURIComponent(url)}`);
      const j = await r.json();
      
      if (!r.ok) {
        throw new Error(j?.error || 'Failed to fetch AI scores');
      }
      
      setData(j);
    } catch (e: any) {
      setErr(e?.message || 'Oops. Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0F141A] p-5 text-[#E6EEF7]">
      <h3 className="text-lg font-semibold mb-2">Run Free AI Visibility Audit</h3>
      <p className="text-sm opacity-70 mb-4">
        Paste your website. Get a bottom-line summary in seconds.
      </p>
      
      <div className="flex gap-2 mb-4">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && runAudit()}
          placeholder="https://www.exampledealer.com"
          className="flex-1 bg-[#0B0F14] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          disabled={loading}
        />
        <button
          onClick={runAudit}
          disabled={loading || !url.trim()}
          className="rounded-lg px-4 py-2 bg-[#3BA3FF] disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#2A8FDD] transition-colors font-medium"
        >
          {loading ? 'Scanning…' : 'Run Audit'}
        </button>
      </div>

      {err && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {err}
        </div>
      )}

      {data && (
        <div className="mt-4 space-y-3 text-sm">
          {/* KPI Summary */}
          <div className="rounded-xl border border-white/10 p-4 bg-[#0B0F14] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">AI Visibility (OCI)</span>
              <b className="text-emerald-400 text-lg">
                {(data.kpi_scoreboard.OCI * 100).toFixed(0)}%
              </b>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Zero-Click Inclusion</span>
              <b className="text-blue-400">
                {(data.zero_click_inclusion_rate * 100).toFixed(0)}%
              </b>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Schema / Trust Signals</span>
              <b className="text-purple-400">
                {(data.kpi_scoreboard.PIQR * 100).toFixed(0)}%
              </b>
            </div>
          </div>

          {/* Recommended Fixes */}
          <div className="rounded-xl border border-white/10 p-4 bg-[#0B0F14]">
            <div className="font-medium mb-2 text-white">14-Day Fixes</div>
            <ul className="list-disc pl-5 opacity-90 space-y-1 text-gray-300">
              <li>Inject/repair JSON-LD for AutoDealer/Vehicle/FAQ</li>
              <li>Answer-engine content blocks on top 3 service pages</li>
              <li>Review cadence + response SLA to raise credibility</li>
            </ul>
          </div>

          {/* CTAs */}
          <div className="flex gap-2 pt-2">
            <button className="flex-1 rounded-lg px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] transition-colors font-medium text-white">
              Save Full Report
            </button>
            <button className="flex-1 rounded-lg px-4 py-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] transition-colors font-medium text-white">
              Lower Advertising Expense
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

