/**
 * Battle Plan Queue Component
 * 
 * Displays pending automation tasks with approve/reject/execute actions
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { CheckCircle2, XCircle, PlayCircle, Loader2 } from 'lucide-react';
import { AdvancedFilters, FilterConfig } from './dashboard/AdvancedFilters';

interface AutomationTask {
  id: string;
  kind: string;
  dealerId: string | null;
  modelId: string | null;
  payload: any;
  status: string;
  createdAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  executedAt: string | null;
  error: string | null;
}

export default function BattlePlanQueue() {
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Filter configurations
  const filterConfigs: FilterConfig[] = [
    {
      id: 'kind',
      label: 'Task Type',
      type: 'select',
      options: [
        { value: 'PRICE', label: 'Price Changes' },
        { value: 'ADS', label: 'Ad Campaigns' },
        { value: 'NOTIFY', label: 'Notifications' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'APPROVED', label: 'Approved' },
        { value: 'EXECUTED', label: 'Executed' },
        { value: 'REJECTED', label: 'Rejected' },
        { value: 'FAILED', label: 'Failed' },
      ],
    },
    {
      id: 'dealerId',
      label: 'Dealer ID',
      type: 'search',
      placeholder: 'Search dealer ID...',
    },
    {
      id: 'createdAfter',
      label: 'Created After',
      type: 'date',
    },
  ];

  // Filter tasks based on active filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (activeFilters.kind && task.kind !== activeFilters.kind) return false;
      if (activeFilters.status && task.status !== activeFilters.status) return false;
      if (activeFilters.dealerId && task.dealerId && 
          !task.dealerId.toLowerCase().includes(activeFilters.dealerId.toLowerCase())) {
        return false;
      }
      if (activeFilters.createdAfter) {
        const createdDate = new Date(task.createdAt);
        const filterDate = new Date(activeFilters.createdAfter);
        if (createdDate < filterDate) return false;
      }
      return true;
    });
  }, [tasks, activeFilters]);

  async function loadTasks() {
    try {
      setLoading(true);
      const res = await fetch(`${baseUrl}/api/automation/tasks?status=PENDING`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error: any) {
      console.error('[BattlePlanQueue] Load error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function act(id: string, action: 'approve' | 'reject' | 'execute') {
    try {
      setActionLoading(id);
      const res = await fetch(`${baseUrl}/api/automation/tasks/${id}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || `HTTP ${res.status}`);
      }
      
      await loadTasks();
    } catch (error: any) {
      console.error('[BattlePlanQueue] Action error:', error);
      alert(`Failed to ${action}: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  }

  useEffect(() => {
    loadTasks();
    
    // Poll every 30 seconds
    const interval = setInterval(loadTasks, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg bg-gray-900 p-6 text-gray-300">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="rounded-lg bg-gray-900 p-6 text-gray-300">
        <div className="text-white text-lg font-semibold mb-2">Battle Plan Queue</div>
        <p className="text-sm text-gray-400">No pending tasks.</p>
      </div>
    );
  }

  const formatValue = (value: any): string => {
    if (typeof value === 'number') {
      return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    }
    if (typeof value === 'object') {
      return JSON.stringify(value).slice(0, 50);
    }
    return String(value);
  };

  return (
    <div className="rounded-lg bg-gray-900 p-6 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div className="text-white text-lg font-semibold">Battle Plan Queue</div>
        <AdvancedFilters
          filters={filterConfigs}
          onApply={setActiveFilters}
          enablePersistence={true}
        />
      </div>

      {filteredTasks.length === 0 && tasks.length > 0 && (
        <div className="text-center py-8 text-gray-400">
          No tasks match the selected filters.
        </div>
      )}
      
      {filteredTasks.map((task) => {
        const isActionLoading = actionLoading === task.id;
        const recommendedOtd = task.payload?.recommendedOtd;
        const campaigns = task.payload?.campaigns;
        const message = task.payload?.message;
        
        return (
          <div
            key={task.id}
            className="bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-700 hover:border-gray-600 transition-colors"
          >
            <div className="flex-1 text-sm text-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white">{task.kind}</span>
                {task.dealerId && (
                  <span className="text-gray-400">Dealer: {task.dealerId.slice(0, 8)}</span>
                )}
                {task.modelId && (
                  <span className="text-gray-400">Model: {task.modelId.slice(0, 8)}</span>
                )}
              </div>
              
              {recommendedOtd && (
                <div className="text-gray-300">
                  OTD → {formatValue(recommendedOtd)}
                </div>
              )}
              
              {campaigns && Array.isArray(campaigns) && (
                <div className="text-gray-300">
                  Campaigns: {campaigns.length} items
                </div>
              )}
              
              {message && (
                <div className="text-gray-300">
                  {message.slice(0, 60)}...
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-1">
                Created: {new Date(task.createdAt).toLocaleString()}
              </div>
            </div>
            
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => act(task.id, 'approve')}
                disabled={isActionLoading}
                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs flex items-center gap-1 transition-colors"
              >
                {isActionLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                Approve
              </button>
              
              <button
                onClick={() => act(task.id, 'reject')}
                disabled={isActionLoading}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs flex items-center gap-1 transition-colors"
              >
                {isActionLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                Reject
              </button>
              
              <button
                onClick={() => act(task.id, 'execute')}
                disabled={isActionLoading || task.status !== 'APPROVED'}
                className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs flex items-center gap-1 transition-colors"
              >
                {isActionLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <PlayCircle className="w-3 h-3" />
                )}
                Execute
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
