'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const PerformanceBudget = dynamic(() => import('@/components/PerformanceBudget'), { ssr: false });

interface ContentAuditResult {
  url: string;
  status: number;
  score: number;
  brokenLinks: number;
  ctas: number;
  vin: boolean;
  price: boolean;
  photos: number;
  stockImages: number;
  schema: {
    vehicle: boolean;
    local: boolean;
    faq: boolean;
  };
  aio: {
    hints: string[];
  };
}

export default function ContentOptimizer() {
  const [auditResult, setAuditResult] = useState<ContentAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');

  const runAudit = async () => {
    if (!url) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/content-audit?url=${encodeURIComponent(url)}`);
      const result = await response.json();
      setAuditResult(result);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur ring-1 ring-gray-900/5 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Optimizer</h2>
        
        <div className="flex gap-3 mb-6">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL to audit"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={runAudit}
            disabled={loading || !url}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Auditing...' : 'Run Audit'}
          </button>
        </div>

        {auditResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Overall Score</div>
              <div className="text-2xl font-mono tabular-nums font-semibold text-gray-900">
                {auditResult.score}/100
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Broken Links</div>
              <div className="text-2xl font-mono tabular-nums font-semibold text-gray-900">
                {auditResult.brokenLinks}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">CTAs Found</div>
              <div className="text-2xl font-mono tabular-nums font-semibold text-gray-900">
                {auditResult.ctas}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Photos</div>
              <div className="text-2xl font-mono tabular-nums font-semibold text-gray-900">
                {auditResult.photos}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Stock Images</div>
              <div className="text-2xl font-mono tabular-nums font-semibold text-gray-900">
                {auditResult.stockImages}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Schema Coverage</div>
              <div className="text-2xl font-mono tabular-nums font-semibold text-gray-900">
                {Object.values(auditResult.schema).filter(Boolean).length}/3
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <PerformanceBudget />
        </div>
      </div>
    </div>
  );
}
