'use client';

import React, { useState } from 'react';

interface QuickAuditProps {
  onAuditComplete?: (result: any) => void;
}

export default function QuickAudit({ onAuditComplete }: QuickAuditProps) {
  const [domain, setDomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/quick-audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();
      setResult(data);
      onAuditComplete?.(data);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="quick-audit">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="www.yourdealership.com"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          required
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      
      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800">Audit Complete</h3>
          <p className="text-green-600">Score: {(result as any).score}</p>
        </div>
      )}
    </div>
  );
}
