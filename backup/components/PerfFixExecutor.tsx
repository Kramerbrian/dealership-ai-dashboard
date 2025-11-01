'use client';
import { useState } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

interface Playbook {
  id: string;
  name: string;
  metric: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  description: string;
  expectedImprovement: string;
}

export default function PerfFixExecutor() {
  const [selectedPlaybook, setSelectedPlaybook] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const { data } = useSWR<{ playbooks: Playbook[] }>('/api/perf-fix', fetcher);

  const executePlaybook = async (dryRun: boolean) => {
    if (!selectedPlaybook) return;

    setIsExecuting(true);
    setResponse(null);

    try {
      const res = await fetch('/api/perf-fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playbookId: selectedPlaybook,
          dryRun,
          autoApprove: false,
        }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      setResponse({ error: 'Failed to execute playbook' });
    } finally {
      setIsExecuting(false);
    }
  };

  if (!data) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const playbooks = data.playbooks;
  const selectedPlaybookData = playbooks.find(p => p.id === selectedPlaybook);

  const getImpactColor = (impact: string) => {
    if (impact === 'high') return 'text-green-600';
    if (impact === 'medium') return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getEffortColor = (effort: string) => {
    if (effort === 'low') return 'text-green-600';
    if (effort === 'medium') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/70 p-4 shadow space-y-4">
      {/* Header */}
      <div>
        <div className="font-semibold text-base">Performance Fix Executor</div>
        <div className="text-xs text-gray-500">Automated optimization playbooks</div>
      </div>

      {/* Playbook Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Select Playbook</label>
        <select
          value={selectedPlaybook}
          onChange={(e) => {
            setSelectedPlaybook(e.target.value);
            setResponse(null);
          }}
          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={isExecuting}
        >
          <option value="">Choose a playbook...</option>
          {playbooks.map((playbook) => (
            <option key={playbook.id} value={playbook.id}>
              {playbook.name} (Targets {playbook.metric})
            </option>
          ))}
        </select>
      </div>

      {/* Playbook Details */}
      {selectedPlaybookData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-medium text-blue-900">{selectedPlaybookData.name}</div>
              <div className="text-xs text-blue-700 mt-1">{selectedPlaybookData.description}</div>
            </div>
            <div className="text-xs">
              <span className="inline-block bg-blue-100 px-2 py-1 rounded">
                {selectedPlaybookData.metric}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-gray-600">Impact:</span>{' '}
              <span className={`font-semibold ${getImpactColor(selectedPlaybookData.impact)}`}>
                {selectedPlaybookData.impact.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Effort:</span>{' '}
              <span className={`font-semibold ${getEffortColor(selectedPlaybookData.effort)}`}>
                {selectedPlaybookData.effort.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="text-xs bg-white rounded p-2 border border-blue-100">
            <span className="font-medium text-gray-700">Expected:</span>{' '}
            <span className="text-green-600 font-semibold">
              {selectedPlaybookData.expectedImprovement}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => executePlaybook(true)}
          disabled={!selectedPlaybook || isExecuting}
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExecuting ? 'Running...' : 'Dry Run'}
        </button>
        <button
          onClick={() => executePlaybook(false)}
          disabled={!selectedPlaybook || isExecuting}
          className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExecuting ? 'Executing...' : 'Execute'}
        </button>
      </div>

      {/* Response Display */}
      {response && (
        <div className="border-t pt-3 space-y-2">
          {response.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-sm text-red-800 font-medium">Error</div>
              <div className="text-xs text-red-600 mt-1">{response.error}</div>
            </div>
          ) : (
            <>
              {/* Status Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <div className="flex-1">
                    <div className="text-sm text-green-900 font-medium">{response.message}</div>
                    {response.mode === 'dry-run' && (
                      <div className="text-xs text-green-700 mt-1">
                        No changes made. Review actions below and click Execute when ready.
                      </div>
                    )}
                    {response.mode === 'executed' && (
                      <div className="text-xs text-green-700 mt-1">
                        Changes applied. Estimated completion: {response.estimatedCompletionTime}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expected Improvement */}
              {response.expectedImprovement && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <div className="text-xs">
                    <span className="font-medium text-blue-900">Expected Improvement:</span>{' '}
                    <span className="text-green-600 font-semibold">
                      {response.expectedImprovement}
                    </span>
                  </div>
                </div>
              )}

              {/* Safe Actions */}
              {response.safeActions && response.safeActions.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">
                    Safe Actions ({response.safeActions.length})
                  </div>
                  <ul className="text-xs space-y-1">
                    {response.safeActions.map((action: any) => (
                      <li key={action.id} className="flex items-start gap-2 text-gray-600">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{action.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Executed Actions */}
              {response.executedActions && response.executedActions.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">
                    Executed Actions ({response.executedActions.length})
                  </div>
                  <ul className="text-xs space-y-1">
                    {response.executedActions.map((action: any) => (
                      <li key={action.id} className="flex items-start gap-2 text-gray-600">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{action.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Manual Actions */}
              {response.manualActions && response.manualActions.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-700">
                    Manual Actions Required ({response.manualActions.length})
                  </div>
                  <ul className="text-xs space-y-1">
                    {response.manualActions.map((action: any) => (
                      <li key={action.id} className="flex items-start gap-2 text-gray-600">
                        <span className="text-yellow-600 mt-0.5">⚠</span>
                        <span>{action.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verification Link */}
              {response.verificationUrl && response.mode === 'executed' && (
                <div className="pt-2 border-t">
                  <a
                    href={response.verificationUrl}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    → Verify improvements
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 pt-2 border-t">
        💡 Dry Run previews changes without applying them. Execute runs safe automated fixes.
      </div>
    </div>
  );
}
