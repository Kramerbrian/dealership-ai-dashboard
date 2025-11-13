'use client';

import { useEffect, useState } from 'react';

interface GateSummary {
  ok: boolean;
  released: number;
  blocked: number;
  sev3: number;
  sev2: number;
  sev1: number;
  total: number;
}

interface FeedGateChipProps {
  tenantId: string;
  onManage: () => void;
}

export default function FeedGateChip({ tenantId, onManage }: FeedGateChipProps) {
  const [summary, setSummary] = useState<GateSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;

    const fetchSummary = async () => {
      try {
        const response = await fetch(`/api/gate/summary?tenantId=${tenantId}`);
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch gate summary:', error);
        setSummary({
          ok: false,
          released: 0,
          blocked: 0,
          sev3: 0,
          sev2: 0,
          sev1: 0,
          total: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, [tenantId]);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border bg-gray-50 border-gray-200 text-gray-500">
        <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
        Loading...
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border bg-gray-50 border-gray-200 text-gray-500">
        <div className="h-2 w-2 rounded-full bg-gray-400" />
        Gate status unavailable
      </div>
    );
  }

  const blocked = Number(summary.blocked || 0);
  const hasBlocked = blocked > 0;

  return (
    <button
      onClick={onManage}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors hover:shadow-sm ${
        hasBlocked
          ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
          : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
      }`}
      title="Open Approvals & Gate Manager"
    >
      <span 
        className="h-2 w-2 rounded-full" 
        style={{ 
          backgroundColor: hasBlocked ? '#ef4444' : '#22c55e' 
        }} 
      />
      
      <span className="font-medium">
        {hasBlocked ? `Feed gated: ${blocked} VDPs` : 'Feed clear'}
      </span>
      
      {hasBlocked && (
        <span className="text-xs text-gray-500">
          • Sev3:{summary.sev3} Sev2:{summary.sev2} Sev1:{summary.sev1}
        </span>
      )}
      
      <svg 
        className="w-3 h-3 ml-1" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M9 5l7 7-7 7" 
        />
      </svg>
    </button>
  );
}
