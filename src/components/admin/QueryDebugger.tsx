'use client';

import { useState, useEffect } from 'react';
import { Play, Copy, Download, Trash2, Search, Clock } from 'lucide-react';

interface QueryLog {
  id: string;
  query: string;
  response: any;
  timestamp: string;
  duration: number;
  status: 'success' | 'error';
  endpoint: string;
}

export default function QueryDebugger() {
  const [logs, setLogs] = useState<QueryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<QueryLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQueryLogs();
  }, []);

  const fetchQueryLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/query-logs');
      const data = await res.json();
      setLogs(data.logs);
    } catch (error) {
      console.error('Failed to fetch query logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    log.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.endpoint.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'success' 
      ? 'text-emerald-600 bg-emerald-50' 
      : 'text-red-600 bg-red-50';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `query-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const clearLogs = async () => {
    if (confirm('Are you sure you want to clear all query logs?')) {
      try {
        await fetch('/api/admin/query-logs', { method: 'DELETE' });
        setLogs([]);
      } catch (error) {
        console.error('Failed to clear logs:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Query Debugger</h3>
        <div className="flex gap-2">
          <button
            onClick={exportLogs}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-700 font-medium"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={clearLogs}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search queries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Query List */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Recent Queries</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedLog?.id === log.id
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-900">{log.endpoint}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2 truncate">{log.query}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                  <span>{log.duration}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Query Details */}
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Query Details</h4>
          {selectedLog ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Query</label>
                <div className="relative">
                  <pre className="p-3 bg-slate-50 rounded-lg text-sm overflow-x-auto">
                    {selectedLog.query}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(selectedLog.query)}
                    className="absolute top-2 right-2 p-1 hover:bg-slate-200 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Response</label>
                <div className="relative">
                  <pre className="p-3 bg-slate-50 rounded-lg text-sm overflow-x-auto max-h-48">
                    {JSON.stringify(selectedLog.response, null, 2)}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog.response, null, 2))}
                    className="absolute top-2 right-2 p-1 hover:bg-slate-200 rounded"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Duration:</span>
                  <span className="ml-2 font-medium">{selectedLog.duration}ms</span>
                </div>
                <div>
                  <span className="text-slate-500">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedLog.status)}`}>
                    {selectedLog.status}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              Select a query to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
