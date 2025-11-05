import React from "react";

type CrawlError = { code: number; url: string; frequency: number; lastSeen: string; impact: "Low"|"Medium"|"High" };

type Props = {
  crawlErrors: CrawlError[];
  missingFields: string[];
  malformedFields: string[];
  cwv: { lcp_ms: number; cls: number; inp_ms: number };
};

export default function HealthDiagnosticsModal({ crawlErrors, missingFields, malformedFields, cwv }: Props) {
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
              </tr>
            </thead>
            <tbody>
              {crawlErrors.map((e,i)=>(
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-1 text-gray-700">{e.code}</td>
                  <td className="py-1 truncate max-w-[220px] text-gray-700" title={e.url}>{e.url}</td>
                  <td className="py-1 text-gray-700">{e.frequency}</td>
                  <td className="py-1 text-gray-700">{e.lastSeen}</td>
                  <td className="py-1 text-gray-700">{e.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border border-gray-200 rounded-xl p-4 bg-white/50">
          <div className="font-semibold mb-2 text-gray-900">Schema Validation</div>
          <div className="text-sm mb-1 text-gray-700">Missing</div>
          <ul className="text-sm list-disc list-inside text-gray-600 mb-2">
            {missingFields.length ? missingFields.map(f => <li key={f}>{f}</li>) : <li>None</li>}
          </ul>
          <div className="text-sm mb-1 text-gray-700">Malformed</div>
          <ul className="text-sm list-disc list-inside text-gray-600">
            {malformedFields.length ? malformedFields.map(f => <li key={f}>{f}</li>) : <li>None</li>}
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

