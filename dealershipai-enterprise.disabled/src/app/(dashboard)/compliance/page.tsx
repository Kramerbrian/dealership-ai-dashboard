'use client';

import React, { useState, useEffect } from 'react';

// Mock data for demo - replace with actual API calls
const mockSummaryData = {
  auto_pct: 78.5,
  violations_7d: 3,
  avg_confidence: 0.87,
  human_reviews: 12
};

const mockRecentData = [
  {
    occurred_at: "2024-01-15T10:30:00Z",
    agent_id: "appraisal-penetration-agent",
    action_type: "create_task",
    entity_type: "crm.task",
    confidence: "0.92",
    mode: "FULL_AUTO",
    violations: "—"
  },
  {
    occurred_at: "2024-01-15T10:25:00Z",
    agent_id: "appraisal-penetration-agent",
    action_type: "create_task",
    entity_type: "crm.task",
    confidence: "0.75",
    mode: "HUMAN_REVIEW",
    violations: "confidence_below_threshold"
  },
  {
    occurred_at: "2024-01-15T10:20:00Z",
    agent_id: "appraisal-penetration-agent",
    action_type: "create_task",
    entity_type: "crm.task",
    confidence: "0.88",
    mode: "LIMITED_WRITE",
    violations: "—"
  }
];

export default function CompliancePage() {
  const [data, setData] = useState(mockSummaryData);
  const [rows, setRows] = useState(mockRecentData);
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Compliance Dashboard
          </h1>
          <p className="text-gray-600">
            AI Agent Policy Enforcement & Audit Trail
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Automated Actions</div>
            <div className="text-2xl font-semibold text-green-600">{data.auto_pct}%</div>
            <div className="text-sm text-gray-500">Last 7 days</div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Violations (7d)</div>
            <div className="text-2xl font-semibold text-red-600">{data.violations_7d}</div>
            <div className="text-sm text-gray-500">Policy violations</div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Confidence</div>
            <div className="text-2xl font-semibold text-blue-600">{data.avg_confidence.toFixed(2)}</div>
            <div className="text-sm text-gray-500">AI confidence score</div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Human Reviews</div>
            <div className="text-2xl font-semibold text-orange-600">{data.human_reviews}</div>
            <div className="text-sm text-gray-500">Pending review</div>
          </div>
        </div>

        {/* Recent Actions Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Actions</h2>
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Violations
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(row.occurred_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {row.agent_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.action_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.entity_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        parseFloat(row.confidence) >= 0.9 ? 'bg-green-100 text-green-800' :
                        parseFloat(row.confidence) >= 0.8 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {row.confidence}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        row.mode === 'FULL_AUTO' ? 'bg-green-100 text-green-800' :
                        row.mode === 'LIMITED_WRITE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {row.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.violations === '—' ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-red-600" title={row.violations}>⚠</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Policy Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Active Agent Contracts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900">Appraisal Penetration Agent</h4>
              <p className="text-sm text-gray-600 mt-1">
                Increases appraisal-to-sales ratio by nudging service ROs into active appraisals
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Class B Retention
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
