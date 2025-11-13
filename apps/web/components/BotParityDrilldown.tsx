'use client';
import useSWR from 'swr';
const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function BotParityDrilldown() {
  const { data } = useSWR('/api/bot-parity-drilldown', fetcher);
  
  if (!data) return <div className="text-sm text-gray-500">Loading...</div>;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-600 bg-green-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'missing schema': return 'text-red-600 bg-red-50';
      case 'blocked robots.txt': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
      <div className="font-semibold mb-2">Bot Parity Drill-Down</div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 mb-3 text-xs">
        <div className="text-center">
          <div className="font-medium">Total</div>
          <div className="text-lg font-bold">{data.summary.total}</div>
        </div>
        <div className="text-center">
          <div className="font-medium">Googlebot</div>
          <div className="text-lg font-bold text-green-600">{data.summary.googlebot_ok}</div>
        </div>
        <div className="text-center">
          <div className="font-medium">GPTBot</div>
          <div className="text-lg font-bold text-yellow-600">{data.summary.gptbot_ok}</div>
        </div>
        <div className="text-center">
          <div className="font-medium">Perplexity</div>
          <div className="text-lg font-bold text-blue-600">{data.summary.perplexity_ok}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">URL</th>
              <th className="p-2 text-center">Googlebot</th>
              <th className="p-2 text-center">GPTBot</th>
              <th className="p-2 text-center">Perplexity</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: any, i: number) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-2 font-mono text-xs">{r.url}</td>
                <td className="p-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(r.googlebot)}`}>
                    {r.googlebot}
                  </span>
                </td>
                <td className="p-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(r.gptbot)}`}>
                    {r.gptbot}
                  </span>
                </td>
                <td className="p-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(r.perplexity)}`}>
                    {r.perplexity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="text-[11px] text-gray-400 mt-2">
        Updated {new Date(data.updated).toLocaleString()}
      </div>
    </div>
  );
}
