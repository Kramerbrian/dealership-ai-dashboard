/**
 * Free Audit Widget - PLG Landing Page Component
 * Instant AI visibility audit for prospects
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { AiScoresResponse } from '@/lib/types/AiScores';
// import { getPersonalityCopy } from '@/lib/cognitive-personality';

/**
 * Client-side URL validation helper
 */
function validateUrlClient(input: string): { valid: boolean; error?: string; normalized?: string } {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: 'URL is required' };
  }

  if (input.length > 2048) {
    return { valid: false, error: 'URL is too long (max 2048 characters)' };
  }

  try {
    let normalized = input.trim().toLowerCase();
    
    // Add protocol if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }

    const url = new URL(normalized);
    const hostname = url.hostname.toLowerCase();

    // Basic validation
    if (hostname.length === 0 || hostname.length > 253) {
      return { valid: false, error: 'Invalid domain name' };
    }

    // Block localhost in production-like environments
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return { valid: false, error: 'Please enter a valid website URL' };
    }

    return { valid: true, normalized: url.origin };
  } catch {
    return { valid: false, error: 'Invalid URL format. Please enter a valid website URL (e.g., exampledealer.com)' };
  }
}

export default function FreeAuditWidget() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AiScoresResponse | null>(null);
  const [err, setErr] = useState('');

  // const personality = getPersonalityCopy('progress');

  async function runAudit() {
    // Validate URL before sending request
    const validation = validateUrlClient(url.trim());
    if (!validation.valid) {
      setErr(validation.error || 'Invalid URL');
      return;
    }

    setLoading(true);
    setErr('');
    setData(null);

    try {
      // Use validated/normalized URL
      const urlToFetch = validation.normalized || url.trim();
      const r = await fetch(`/api/ai-scores?origin=${encodeURIComponent(urlToFetch)}`);
      const j = await r.json();
      
      if (!r.ok) {
        // Handle rate limiting
        if (r.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        }
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
    <div className="panel" style={{maxWidth: '100%'}}>
      <h3 style={{margin: "0 0 8px", fontSize: "18px", fontWeight: 600}}>Run Free AI Visibility Audit</h3>
      <p className="small" style={{margin: "0 0 16px", opacity: 0.85}}>
        Paste your website. Get a bottom-line summary in seconds.
      </p>
      
      <div style={{display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap"}}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && runAudit()}
          placeholder="https://www.exampledealer.com"
          className="input"
          disabled={loading}
          aria-label="Website URL"
        />
        <button
          onClick={runAudit}
          disabled={loading || !url.trim()}
          className="cta"
          style={{minWidth: "120px"}}
          aria-label="Run audit"
        >
          {loading ? (
            <>
              <span className="spinner" aria-hidden="true"></span>
              <span>Scanning…</span>
            </>
          ) : 'Run Audit'}
        </button>
      </div>

      {err && (
        <div className="panel" style={{
          marginBottom: "16px",
          padding: "12px",
          background: "rgba(249, 112, 102, 0.15)",
          borderColor: "rgba(249, 112, 102, 0.3)",
          color: "var(--err)",
          border: "1px solid rgba(249, 112, 102, 0.3)"
        }}>
          {err}
        </div>
      )}

      {data && (
        <div style={{marginTop: "16px"}}>
          {/* KPI Summary */}
          <div className="panel" style={{marginBottom: "12px"}}>
            <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px"}}>
              <div className="g">
                <p className="g-title">AI Visibility (OCI)</p>
                <div className="g-num" style={{color: "var(--ok)"}}>
                  {(data.kpi_scoreboard.OCI * 100).toFixed(0)}%
                </div>
              </div>
              <div className="g">
                <p className="g-title">Zero-Click</p>
                <div className="g-num" style={{color: "var(--brand)"}}>
                  {(data.zero_click_inclusion_rate * 100).toFixed(0)}%
                </div>
              </div>
              <div className="g">
                <p className="g-title">Schema / Trust</p>
                <div className="g-num" style={{color: "var(--brand-2)"}}>
                  {(data.kpi_scoreboard.PIQR * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Fixes */}
          <div className="panel" style={{marginBottom: "12px"}}>
            <h4 style={{margin: "0 0 8px", fontSize: "14px", fontWeight: 600}}>14-Day Fixes</h4>
            <ul style={{margin: 0, paddingLeft: "18px", color: "var(--muted)", fontSize: "13px", lineHeight: "1.6"}}>
              <li>Inject/repair JSON-LD for AutoDealer/Vehicle/FAQ</li>
              <li>Answer-engine content blocks on top 3 service pages</li>
              <li>Review cadence + response SLA to raise credibility</li>
            </ul>
          </div>

          {/* CTAs */}
          <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
            <Link href="/sign-in" className="cta" style={{flex: "1 1 200px", textAlign: "center"}}>
              Save Full Report
            </Link>
            <Link href="/onboarding" className="ghost" style={{flex: "1 1 200px", textAlign: "center"}}>
              Lower Advertising Expense
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

