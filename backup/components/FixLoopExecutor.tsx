'use client';
import { useState } from 'react';

export default function FixLoopExecutor() {
  const [playbook, setPlaybook] = useState('Recover AI Citations');
  const [resp, setResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async (dry: boolean) => {
    setLoading(true);
    try {
      const response = await fetch('/api/fix-loop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playbook, dryRun: dry })
      });
      const data = await response.json();
      setResp(data);
    } catch (error) {
      console.error('Fix loop error:', error);
      setResp({ error: 'Failed to execute fix loop' });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow space-y-3">
      <div className="font-semibold">Fix Loop Executor</div>
      
      <div className="flex gap-2">
        <select 
          value={playbook} 
          onChange={e => setPlaybook(e.target.value)} 
          className="border rounded p-1 text-sm flex-1"
        >
          <option>Recover AI Citations</option>
          <option>Review Response Optimization</option>
          <option>Zero-Click Win</option>
          <option>Citation Recovery</option>
          <option>Diagnostic Sweep</option>
        </select>
        <button 
          onClick={() => run(true)} 
          disabled={loading}
          className="px-3 py-1 rounded bg-gray-800 text-white text-sm hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? '...' : 'Dry Run'}
        </button>
        <button 
          onClick={() => run(false)} 
          disabled={loading}
          className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '...' : 'Execute'}
        </button>
      </div>

      {resp && (
        <div className="text-sm text-gray-700 border-t pt-2 space-y-2">
          <div className="font-medium">{resp.message}</div>
          
          {resp.metadata && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Total Time:</span> {resp.metadata.totalTime}
              </div>
              <div>
                <span className="font-medium">Risk Level:</span> 
                <span className={`ml-1 px-2 py-1 rounded ${getRiskColor(resp.metadata.riskLevel)}`}>
                  {resp.metadata.riskLevel}
                </span>
              </div>
            </div>
          )}

          {resp.actions && (
            <div>
              <div className="font-medium mb-1">Actions:</div>
              <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                {resp.actions.map((a: any) => (
                  <li key={a.id} className="flex justify-between items-center">
                    <span>{a.description}</span>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-500">{a.estimatedTime}</span>
                      <span className={`px-1 py-0.5 rounded ${getRiskColor(a.risk)}`}>
                        {a.risk}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {resp.metadata?.estimatedImpact && (
            <div className="text-xs text-gray-500 italic">
              {resp.metadata.estimatedImpact}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
