"use client";

import React, { useState } from "react";

type CrawlError = { code: number; url: string; frequency: number; lastSeen: string; impact: "Low"|"Medium"|"High" };

type Props = {
  crawlErrors: CrawlError[];
  missingFields: string[];
  malformedFields: string[];
  cwv: { lcp_ms: number; cls: number; inp_ms: number };
};

function FixItButton({ 
  label, 
  onClick, 
  disabled = false 
}: { 
  label: string; 
  onClick: () => void; 
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-2 py-1 text-xs font-medium rounded-md bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {label}
    </button>
  );
}

export default function HealthDiagnosticsModal({ crawlErrors, missingFields, malformedFields, cwv }: Props) {
  const [fixing, setFixing] = useState<Record<string, boolean>>({});
  const [fixed, setFixed] = useState<Set<string>>(new Set());

  const handleSchemaFix = async (field: string, value: string = "auto") => {
    const key = `schema-${field}`;
    setFixing(prev => ({ ...prev, [key]: true }));

    try {
      // Get the base URL from the current page
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/inventory`; // Default inventory URL

      const response = await fetch("/api/schema/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          field,
          value,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to queue schema fix");
      }

      const data = await response.json();
      setFixed(prev => new Set([...prev, key]));
      
      // Show success message
      alert(`Schema fix queued! Job ID: ${data.jobId}\nEstimated completion: ${data.estimatedCompletion}`);
    } catch (error) {
      console.error("Schema fix error:", error);
      alert("Failed to queue schema fix. Please try again.");
    } finally {
      setFixing(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleCrawlFix = async (error: CrawlError) => {
    const key = `crawl-${error.url}`;
    setFixing(prev => ({ ...prev, [key]: true }));

    try {
      // For 404s, we might want to redirect or remove
      // For 500s, we might want to reprobe
      const response = await fetch("/api/jobs/reprobe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "crawl",
          url: error.url,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to queue reprobe");
      }

      const data = await response.json();
      setFixed(prev => new Set([...prev, key]));
      
      alert(`Reprobe queued! Job ID: ${data.jobId}`);
    } catch (error) {
      console.error("Crawl fix error:", error);
      alert("Failed to queue reprobe. Please try again.");
    } finally {
      setFixing(prev => ({ ...prev, [key]: false }));
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Health Diagnostics</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border border-gray-200 rounded-xl p-4 bg-white/50">
          <div className="font-semibold mb-2 text-gray-900">Crawl Errors</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="py-1 text-gray-900">Code</th>
                <th className="py-1 text-gray-900">URL</th>
                <th className="py-1 text-gray-900">Freq</th>
                <th className="py-1 text-gray-900">Last Seen</th>
                <th className="py-1 text-gray-900">Impact</th>
                <th className="py-1 text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {crawlErrors.map((e,i)=> {
                const key = `crawl-${e.url}`;
                const isFixing = fixing[key];
                const isFixed = fixed.has(key);
                return (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-1 text-gray-700">{e.code}</td>
                    <td className="py-1 truncate max-w-[220px] text-gray-700" title={e.url}>{e.url}</td>
                    <td className="py-1 text-gray-700">{e.frequency}</td>
                    <td className="py-1 text-gray-700">{e.lastSeen}</td>
                    <td className="py-1 text-gray-700">{e.impact}</td>
                    <td className="py-1">
                      {isFixed ? (
                        <span className="text-xs text-green-600">Queued</span>
                      ) : (
                        <FixItButton
                          label={isFixing ? "Fixing..." : "Fix it"}
                          onClick={() => handleCrawlFix(e)}
                          disabled={isFixing}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-white/50">
          <div className="font-semibold mb-2 text-gray-900">Schema Validation</div>
          <div className="text-sm mb-1 text-gray-700">Missing</div>
          <ul className="text-sm list-disc list-inside text-gray-600 mb-2 space-y-1">
            {missingFields.length ? missingFields.map(f => {
              const key = `schema-${f}`;
              const isFixing = fixing[key];
              const isFixed = fixed.has(key);
              return (
                <li key={f} className="flex items-center justify-between gap-2">
                  <span className="flex-1">{f}</span>
                  {isFixed ? (
                    <span className="text-xs text-green-600">Queued</span>
                  ) : (
                    <FixItButton
                      label={isFixing ? "Fixing..." : "Fix it"}
                      onClick={() => handleSchemaFix(f)}
                      disabled={isFixing}
                    />
                  )}
                </li>
              );
            }) : <li>None</li>}
          </ul>
          <div className="text-sm mb-1 text-gray-700">Malformed</div>
          <ul className="text-sm list-disc list-inside text-gray-600 space-y-1">
            {malformedFields.length ? malformedFields.map(f => {
              const key = `schema-${f}`;
              const isFixing = fixing[key];
              const isFixed = fixed.has(key);
              return (
                <li key={f} className="flex items-center justify-between gap-2">
                  <span className="flex-1">{f}</span>
                  {isFixed ? (
                    <span className="text-xs text-green-600">Queued</span>
                  ) : (
                    <FixItButton
                      label={isFixing ? "Fixing..." : "Fix it"}
                      onClick={() => handleSchemaFix(f, "auto")}
                      disabled={isFixing}
                    />
                  )}
                </li>
              );
            }) : <li>None</li>}
          </ul>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-white/50">
          <div className="font-semibold mb-2 text-gray-900">Core Web Vitals</div>
          <div className="text-sm text-gray-700">Speed (LCP): {(cwv.lcp_ms/1000).toFixed(1)} s</div>
          <div className="text-sm text-gray-700">Stability (CLS): {cwv.cls}</div>
          <div className="text-sm text-gray-700">Response (INP): {(cwv.inp_ms/1000).toFixed(2)} s</div>
          <p className="text-xs mt-2 text-gray-500">Effective visibility is penalized by CWV drag and uptime incidents.</p>
        </div>
      </div>
    </div>
  );
}

