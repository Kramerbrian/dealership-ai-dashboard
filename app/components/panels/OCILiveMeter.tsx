'use client';
import { useEffect, useState } from 'react';
import { TrendingUp, Download } from 'lucide-react';

interface OCIData {
  tenant_id: string;
  elasticity_usd_per_point: number;
  oci_28d_usd: number;
  sev1: number;
  sev2: number;
  sev3: number;
  computed_at: string;
}

export default function OCILiveMeter({ tenantId }: { tenantId: string }) {
  const [data, setData] = useState<OCIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/oci/live?tenantId=${tenantId}`);
        const result = await response.json();
        if ((result as any).ok && (result as any).data?.[0]) {
          setData((result as any).data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch OCI data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenantId]);

  const handleExport = () => {
    window.open(`/api/oci/live?tenantId=${tenantId}`, '_blank');
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          OCI Live Meter (28d)
        </h3>
        <button
          onClick={handleExport}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
        >
          <Download className="h-3 w-3" />
          Export
        </button>
      </div>
      
      {loading ? (
        <div className="h-20 animate-pulse bg-slate-800 rounded-xl" />
      ) : data ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-400 mb-1">Estimated $ at risk</div>
            <div className="text-3xl font-bold text-amber-400">
              ${Number(data.oci_28d_usd).toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Elasticity: ${Number(data.elasticity_usd_per_point).toFixed(0)}/pt
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-slate-700 p-2">
              <div className="text-xs text-slate-400">Sev 1</div>
              <div className="text-lg font-semibold text-slate-200">{data.sev1}</div>
            </div>
            <div className="rounded-lg border border-slate-700 p-2">
              <div className="text-xs text-slate-400">Sev 2</div>
              <div className="text-lg font-semibold text-slate-200">{data.sev2}</div>
            </div>
            <div className="rounded-lg border border-slate-700 p-2">
              <div className="text-xs text-slate-400">Sev 3</div>
              <div className="text-lg font-semibold text-rose-400">{data.sev3}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-400 text-sm">No data available</div>
      )}
      
      <p className="mt-4 text-xs text-slate-500">
        OCI is estimated from open violations × elasticity. Resolve top issues to reduce immediate $ risk.
      </p>
    </div>
  );
}
