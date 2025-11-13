'use client';
import useSWR from 'swr';
const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function APIUsage() {
  const { data } = useSWR('/api/usage', fetcher);
  
  if (!data) return null;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const getUsageBarColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <div className="font-semibold mb-2">API Usage (24h)</div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <div className="text-gray-500">Total Calls</div>
          <div className="text-2xl font-bold">{data.summary.totalCalls.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-500">Active Keys</div>
          <div className="text-2xl font-bold">{data.summary.totalKeys}</div>
        </div>
      </div>

      {/* Usage Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Key</th>
              <th className="p-2 text-center">Scope</th>
              <th className="p-2 text-center">Usage</th>
              <th className="p-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.usage.map((r: any, i: number) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-2 font-mono text-xs">{r.key}</td>
                <td className="p-2 text-center">{r.scope}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getUsageBarColor(r.usagePercent)}`}
                        style={{ width: `${Math.min(r.usagePercent, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium">{r.usagePercent}%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {r.calls} / {r.limit} calls
                  </div>
                </td>
                <td className="p-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(r.status)}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Alerts */}
      {(data.summary.warningKeys > 0 || data.summary.criticalKeys > 0) && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-xs text-yellow-800">
            {data.summary.criticalKeys > 0 && (
              <div>⚠️ {data.summary.criticalKeys} key(s) at critical usage</div>
            )}
            {data.summary.warningKeys > 0 && (
              <div>⚠️ {data.summary.warningKeys} key(s) approaching limits</div>
            )}
          </div>
        </div>
      )}
      
      <div className="text-[11px] text-gray-400 mt-2">
        Updated {new Date(data.updated).toLocaleString()}
      </div>
    </div>
  );
}
