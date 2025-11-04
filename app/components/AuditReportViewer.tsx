'use client';

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Download, FileText, TrendingUp, AlertCircle } from "lucide-react";

interface AuditData {
  variant: string;
  lcp: number;
  cls: number;
  inp: number;
  perf: number;
  ctr: number;
  conv: number;
}

interface AuditHistory {
  file: string;
  modified: string;
  url: string;
}

export default function AuditReportViewer() {
  const [data, setData] = useState<AuditData[]>([]);
  const [csvURL, setCsvURL] = useState<string>("");
  const [pdfURL, setPdfURL] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AuditHistory[]>([]);

  useEffect(() => {
    async function loadReport() {
      try {
        setLoading(true);
        setError(null);

        // Load latest CSV report
        const res = await fetch("/audit-reports/abtest_metrics.csv");
        
        if (!res.ok) {
          throw new Error(`Failed to load report: ${res.status}`);
        }

        const text = await res.text();
        const rows = text.split("\n").slice(1);
        
        const parsed = rows
          .map((r) => {
            const [variant, lcp, cls, inp, perf, ctr, conv] = r.split(",");
            if (!variant) return null;
            
            return {
              variant: variant.trim(),
              lcp: parseFloat(lcp) || 0,
              cls: parseFloat(cls) || 0,
              inp: parseFloat(inp) || 0,
              perf: parseFloat(perf) || 0,
              ctr: parseFloat(ctr) || 0,
              conv: parseFloat(conv) || 0
            };
          })
          .filter((r): r is AuditData => r !== null);

        setData(parsed);
        setCsvURL("/audit-reports/abtest_metrics.csv");
        setPdfURL("/audit-reports/abtest_report.pdf");

        // Load audit history
        try {
          const historyRes = await fetch("/api/audit-history");
          if (historyRes.ok) {
            const historyData = await historyRes.json();
            setHistory(historyData.audits || []);
          }
        } catch (err) {
          console.warn("Could not load audit history:", err);
        }
      } catch (err) {
        console.error("Failed to load audit report", err);
        setError(err instanceof Error ? err.message : "Failed to load audit report");
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Card className="bg-slate-800/50 text-white border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-slate-400">Loading audit report...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Card className="bg-slate-800/50 text-white border border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 mb-2">Error loading audit report</p>
                <p className="text-slate-400 text-sm">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4"
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate best performing variant
  const bestVariant = data.reduce((best, current) => {
    const currentScore = current.ctr * 0.5 + current.conv * 0.5;
    const bestScore = best.ctr * 0.5 + best.conv * 0.5;
    return currentScore > bestScore ? current : best;
  }, data[0] || { variant: '', ctr: 0, conv: 0 });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Post-Deploy Audit Dashboard</h1>
        <p className="text-slate-400">
          A/B test performance metrics across all variants
        </p>
      </div>

      {/* Performance Summary */}
      {bestVariant && bestVariant.variant && (
        <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 text-white border border-blue-700 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-blue-300 mb-1">🏆 Best Performing Variant</div>
                <div className="text-2xl font-bold">{bestVariant.variant.toUpperCase()}</div>
                <div className="text-sm text-slate-300 mt-1">
                  CTR: {(bestVariant.ctr * 100).toFixed(1)}% • Conversion: {(bestVariant.conv * 100).toFixed(1)}%
                </div>
              </div>
              <TrendingUp className="h-12 w-12 text-green-400" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Results Table */}
      <Card className="bg-slate-800/50 text-white border border-slate-700 mb-10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold">Latest A/B Variant Results</CardTitle>
            <div className="flex gap-3">
              <Button
                asChild
                variant="secondary"
                size="sm"
              >
                <a href={csvURL} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </a>
              </Button>
              <Button
                asChild
                variant="default"
                size="sm"
              >
                <a href={pdfURL} download>
                  <FileText className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-700">
                <tr>
                  <th className="p-3 text-left font-semibold">Variant</th>
                  <th className="p-3 text-left font-semibold">LCP (s)</th>
                  <th className="p-3 text-left font-semibold">CLS</th>
                  <th className="p-3 text-left font-semibold">INP (s)</th>
                  <th className="p-3 text-left font-semibold">Perf Score</th>
                  <th className="p-3 text-left font-semibold">CTR</th>
                  <th className="p-3 text-left font-semibold">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, idx) => (
                  <tr
                    key={r.variant}
                    className={`border-t border-slate-700 hover:bg-slate-700/30 transition-colors ${
                      r.variant === bestVariant.variant ? 'bg-blue-900/20' : ''
                    }`}
                  >
                    <td className="p-3 font-semibold text-blue-300">
                      {r.variant}
                      {r.variant === bestVariant.variant && (
                        <span className="ml-2 text-xs bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                          🏆 Best
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={r.lcp < 2.5 ? 'text-green-400' : r.lcp < 4 ? 'text-yellow-400' : 'text-red-400'}>
                        {r.lcp.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={r.cls < 0.1 ? 'text-green-400' : r.cls < 0.25 ? 'text-yellow-400' : 'text-red-400'}>
                        {r.cls.toFixed(3)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={r.inp < 200 ? 'text-green-400' : r.inp < 500 ? 'text-yellow-400' : 'text-red-400'}>
                        {r.inp.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={r.perf > 90 ? 'text-green-400' : r.perf > 50 ? 'text-yellow-400' : 'text-red-400'}>
                        {r.perf.toFixed(0)}
                      </span>
                    </td>
                    <td className="p-3 font-medium">{(r.ctr * 100).toFixed(1)}%</td>
                    <td className="p-3 font-medium">{(r.conv * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card className="bg-slate-800/50 text-white border border-slate-700 mb-10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            CTR vs Conversion Rate — Variant Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis 
                  dataKey="variant" 
                  stroke="#94a3b8"
                  tick={{ fill: '#cbd5e1' }}
                />
                <YAxis 
                  stroke="#94a3b8"
                  tick={{ fill: '#cbd5e1' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#cbd5e1' }}
                />
                <Line
                  type="monotone"
                  dataKey="ctr"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  name="CTR (%)"
                  dot={{ fill: '#60a5fa', r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="conv"
                  stroke="#34d399"
                  strokeWidth={3}
                  name="Conversion Rate (%)"
                  dot={{ fill: '#34d399', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Historical Reports */}
      {history.length > 0 && (
        <Card className="bg-slate-800/50 text-white border border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Historical Audit Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {history.map((audit, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors"
                >
                  <div>
                    <div className="font-medium text-blue-300">{audit.file}</div>
                    <div className="text-sm text-slate-400">
                      {new Date(audit.modified).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                  >
                    <a href={audit.url} download>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

