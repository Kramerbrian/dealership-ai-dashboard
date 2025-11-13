'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

interface AuditRow {
  id: string;
  vin: string;
  rule: string;
  severity: number;
  delta_price: number;
  undisclosed_count: number;
}

export default function DishonestPricingCard({ tenantId }: { tenantId: string }) {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/policy/list?tenantId=${tenantId}`);
        const result = await response.json();
        if (result.ok && result.rows) {
          setRows(result.rows);
        }
      } catch (error) {
        console.error('Failed to fetch audit data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId]);

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 3: return 'text-rose-400 bg-rose-500/10';
      case 2: return 'text-amber-400 bg-amber-500/10';
      case 1: return 'text-slate-400 bg-slate-500/10';
      default: return 'text-slate-400 bg-slate-500/10';
    }
  };

  const getRuleColor = (rule: string) => {
    switch (rule) {
      case 'PRICE_DELTA': return 'text-rose-400';
      case 'UNDISCLOSED_FEE': return 'text-amber-400';
      case 'STRIKETHROUGH_ABUSE': return 'text-indigo-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-400" />
        Offer Integrity • Pricing & Fees
      </h3>
      
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse bg-slate-800 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-400 border-b border-slate-700">
                <th className="pb-2">VIN</th>
                <th className="pb-2">Rule</th>
                <th className="pb-2">Δ Price</th>
                <th className="pb-2">Undisclosed</th>
                <th className="pb-2">Sev</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-400 py-4">
                    No violations found
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 font-mono text-xs text-slate-300">
                      {r.vin ? `${r.vin.slice(0, 8)}...` : '—'}
                    </td>
                    <td className="py-2">
                      <span className={`text-xs ${getRuleColor(r.rule)}`}>
                        {r.rule.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2 text-slate-300">
                      {r.delta_price ? `$${Number(r.delta_price).toFixed(0)}` : '—'}
                    </td>
                    <td className="py-2 text-slate-300">
                      {r.undisclosed_count || 0}
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(r.severity)}`}>
                        {r.severity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      <p className="mt-4 text-xs text-slate-500 flex items-center gap-1">
        <ExternalLink className="h-3 w-3" />
        Flagged by rule: PRICE_DELTA / UNDISCLOSED_FEE / STRIKETHROUGH_ABUSE
      </p>
    </div>
  );
}
