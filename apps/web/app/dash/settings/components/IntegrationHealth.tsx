'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface AuditResult {
  integration: string;
  status: 'active' | 'inactive' | 'error' | 'warning';
  isValid: boolean;
  message: string;
  lastChecked: string;
  responseTime?: number;
  errorDetails?: string;
  dataPoints?: number;
}

interface IntegrationHealth {
  dealerId: string;
  overall: 'healthy' | 'degraded' | 'critical';
  totalIntegrations: number;
  activeIntegrations: number;
  failedIntegrations: number;
  integrations: AuditResult[];
  lastAudit: string | null;
}

interface Props {
  dealerId: string;
}

export function IntegrationHealth({ dealerId }: Props) {
  const [health, setHealth] = useState<IntegrationHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [auditing, setAuditing] = useState(false);

  useEffect(() => {
    fetchHealth();
  }, [dealerId]);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/settings/audit?dealerId=${dealerId}`);
      if (!response.ok) throw new Error('Failed to fetch health');
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error('Error fetching health:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAudit = async () => {
    try {
      setAuditing(true);
      const response = await fetch('/api/settings/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealerId }),
      });

      if (!response.ok) throw new Error('Audit failed');
      const results = await response.json();
      setHealth(results);
    } catch (error) {
      console.error('Error running audit:', error);
      alert('Failed to run audit. Please try again.');
    } finally {
      setAuditing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'inactive':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      case 'inactive':
        return '○';
      default:
        return '?';
    }
  };

  const getOverallColor = (overall: string) => {
    switch (overall) {
      case 'healthy':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'degraded':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!health) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">No audit data available. Run an audit to check integration health.</p>
        <button
          onClick={runAudit}
          disabled={auditing}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {auditing ? 'Running Audit...' : 'Run Health Check'}
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Integration Health</h3>
            <p className="text-sm text-gray-600">
              Last checked: {health.lastAudit ? new Date(health.lastAudit).toLocaleString() : 'Never'}
            </p>
          </div>
          <button
            onClick={runAudit}
            disabled={auditing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {auditing ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                Running...
              </>
            ) : (
              'Run Health Check'
            )}
          </button>
        </div>

        {/* Overall Status Badge */}
        <div className={`inline-block px-6 py-3 rounded-lg font-semibold border-2 ${getOverallColor(health.overall)}`}>
          <span className="text-2xl">
            {health.overall === 'healthy' && '✓'}
            {health.overall === 'degraded' && '⚠'}
            {health.overall === 'critical' && '✗'}
          </span>
          <span className="ml-2 text-lg uppercase">{health.overall}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">{health.totalIntegrations}</div>
            <div className="text-sm text-gray-600">Total Integrations</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">{health.activeIntegrations}</div>
            <div className="text-sm text-gray-600">Active & Working</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-3xl font-bold text-red-600">{health.failedIntegrations}</div>
            <div className="text-sm text-gray-600">Failed or Errors</div>
          </div>
        </div>
      </Card>

      {/* Individual Integration Status */}
      <Card className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Integration Details</h4>
        <div className="space-y-3">
          {health.integrations.map((integration, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${getStatusColor(integration.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{getStatusIcon(integration.status)}</span>
                    <h5 className="font-semibold text-lg">{integration.integration}</h5>
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${getStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                  </div>
                  <p className="text-sm ml-8">{integration.message}</p>
                  {integration.errorDetails && (
                    <details className="mt-2 ml-8">
                      <summary className="text-xs cursor-pointer hover:underline">
                        View error details
                      </summary>
                      <pre className="mt-2 text-xs bg-white bg-opacity-50 p-2 rounded overflow-x-auto">
                        {integration.errorDetails}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="text-right text-sm text-gray-600 space-y-1">
                  {integration.responseTime && (
                    <div>{integration.responseTime}ms</div>
                  )}
                  {integration.dataPoints && (
                    <div className="font-semibold">
                      {integration.dataPoints.toLocaleString()} data points
                    </div>
                  )}
                  <div className="text-xs">
                    {new Date(integration.lastChecked).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {health.integrations.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No integrations configured yet.</p>
            <p className="text-sm mt-2">Enable integrations in the settings tabs above.</p>
          </div>
        )}
      </Card>

      {/* Recommendations */}
      {health.failedIntegrations > 0 && (
        <Card className="p-6 bg-yellow-50 border-yellow-200">
          <h4 className="text-lg font-semibold text-yellow-900 mb-3">⚠ Action Required</h4>
          <ul className="space-y-2 text-sm text-yellow-800">
            {health.integrations
              .filter((i) => i.status === 'error')
              .map((integration, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    <strong>{integration.integration}:</strong> {integration.message}
                  </span>
                </li>
              ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
