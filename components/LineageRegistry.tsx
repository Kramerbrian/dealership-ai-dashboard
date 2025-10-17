'use client';
import useSWR from 'swr';
const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function LineageRegistry() {
  const { data } = useSWR('/api/lineage', fetcher);
  
  if (!data) return null;
  
  const getVerifiedByColor = (verifiedBy: string) => {
    switch (verifiedBy) {
      case 'system': return 'text-blue-600 bg-blue-50';
      case 'agent': return 'text-green-600 bg-green-50';
      case 'manual': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <div className="font-semibold mb-2">Data Lineage Registry</div>
      
      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="text-center">
          <div className="font-medium">Total</div>
          <div className="text-lg font-bold">{data.length}</div>
        </div>
        <div className="text-center">
          <div className="font-medium">System</div>
          <div className="text-lg font-bold text-blue-600">
            {data.filter((r: any) => r.verifiedBy === 'system').length}
          </div>
        </div>
        <div className="text-center">
          <div className="font-medium">Agent</div>
          <div className="text-lg font-bold text-green-600">
            {data.filter((r: any) => r.verifiedBy === 'agent').length}
          </div>
        </div>
      </div>

      {/* Registry List */}
      <ul className="text-xs text-gray-600 space-y-1 max-h-48 overflow-auto">
        {data.map((r: any) => (
          <li key={r.id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-b-0">
            <div className="flex-1">
              <span className="font-medium text-gray-900">{r.metric}</span>
              <span className="text-gray-500"> · {r.source} · v{r.version}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs ${getVerifiedByColor(r.verifiedBy)}`}>
                {r.verifiedBy}
              </span>
              <span className="text-gray-400 text-xs">
                {new Date(r.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </li>
        ))}
      </ul>
      
      <div className="text-[11px] text-gray-400 mt-2">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
}
