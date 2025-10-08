'use client'

import { useAIHealth } from '@/hooks/useData'
import { LoadingGrid, LoadingCard } from '@/components/ui/LoadingSpinner'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { GeoReadinessCard } from '@/components/dashboard/GeoReadinessCard'
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

function AIHealthContent() {
  const { data, error, isLoading, refresh, isError } = useAIHealth()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Health Dashboard</h1>
          <p className="text-gray-600">Monitor your AI systems and performance metrics</p>
        </div>
        <LoadingGrid count={4} />
        <LoadingCard text="Loading alerts..." />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Health Dashboard</h1>
          <p className="text-gray-600">Monitor your AI systems and performance metrics</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Failed to load AI Health data</h3>
              <p className="text-red-600">
                {error?.info?.error || error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={refresh}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Health Dashboard</h1>
          <p className="text-gray-600">Monitor your AI systems and performance metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getStatusIcon(data.status)}
            <span className={`font-medium ${getStatusColor(data.status)}`}>
              {data.status.toUpperCase()}
            </span>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
          {/* GEO Readiness Card */}
          <div className="mb-6">
            <GeoReadinessCard tenantId="default-tenant" className="max-w-md" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Visibility Score</h3>
              <p className="text-2xl font-bold text-green-600">{data.metrics.visibilityScore}%</p>
              <p className="text-xs text-gray-400 mt-1">Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Response Time</h3>
              <p className="text-2xl font-bold text-blue-600">{data.metrics.responseTime.toFixed(2)}s</p>
              <p className="text-xs text-gray-400 mt-1">Average over last 10 requests</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Uptime</h3>
              <p className="text-2xl font-bold text-green-600">{data.metrics.uptime.toFixed(1)}%</p>
              <p className="text-xs text-gray-400 mt-1">Last 24 hours</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Error Rate</h3>
              <p className="text-2xl font-bold text-red-600">{data.metrics.errorRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-400 mt-1">Last 24 hours</p>
            </div>
          </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
          <div className="space-y-2">
            {data.alerts.length > 0 ? (
              data.alerts.map((alert: any) => (
                <div key={alert.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  alert.type === 'error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    alert.type === 'error' 
                      ? 'bg-red-200 text-red-800' 
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {alert.type}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>No alerts - All systems healthy!</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Dealerships Monitored</span>
              <span className="font-semibold">{data.dealerships}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Scan</span>
              <span className="font-semibold">{new Date(data.lastScan).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Data Freshness</span>
              <span className="font-semibold text-green-600">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AIHealthPage() {
  return (
    <ErrorBoundary>
      <AIHealthContent />
    </ErrorBoundary>
  )
}
