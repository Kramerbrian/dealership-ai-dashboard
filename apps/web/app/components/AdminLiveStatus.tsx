'use client'

import { useState, useEffect } from 'react'
import { Activity, Server, Users, Clock, AlertCircle, CheckCircle } from 'lucide-react'

interface AdminStatus {
  server: {
    status: 'online' | 'offline' | 'degraded'
    port: number
    uptime: string
    connections: number
  }
  database: {
    status: 'connected' | 'disconnected' | 'slow'
    responseTime: number
    queries: number
  }
  ai_services: {
    chatgpt: 'active' | 'inactive' | 'rate_limited'
    claude: 'active' | 'inactive' | 'rate_limited'
    perplexity: 'active' | 'inactive' | 'rate_limited'
    gemini: 'active' | 'inactive' | 'rate_limited'
  }
  last_updated: string
}

export default function AdminLiveStatus() {
  const [isVisible, setIsVisible] = useState(false)
  const [status, setStatus] = useState<AdminStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if user is admin
    const adminCheck = localStorage.getItem('isAdmin') === 'true' || 
                      localStorage.getItem('userRole') === 'superadmin'
    setIsAdmin(adminCheck)
    setIsVisible(adminCheck)

    if (adminCheck) {
      fetchStatus()
      // Update every 5 seconds
      const interval = setInterval(fetchStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/admin/status')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error('Failed to fetch admin status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'degraded':
      case 'slow':
      case 'rate_limited':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'offline':
      case 'disconnected':
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'degraded':
      case 'slow':
      case 'rate_limited':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'offline':
      case 'disconnected':
      case 'inactive':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (!isAdmin || !isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-xl border shadow-lg p-4 w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Live Status</h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : status ? (
          <div className="space-y-3">
            {/* Server Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Server</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.server.status)}
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(status.server.status)}`}>
                    {status.server.status}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Port: {status.server.port}</div>
                <div>Uptime: {status.server.uptime}</div>
                <div>Connections: {status.server.connections}</div>
              </div>
            </div>

            {/* Database Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status.database.status)}
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(status.database.status)}`}>
                    {status.database.status}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Response: {status.database.responseTime}ms</div>
                <div>Queries: {status.database.queries}/min</div>
              </div>
            </div>

            {/* AI Services */}
            <div className="space-y-2">
              <span className="text-sm font-medium">AI Services</span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(status.ai_services).map(([service, serviceStatus]) => (
                  <div key={service} className="flex items-center justify-between">
                    <span className="text-xs capitalize">{service}</span>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(serviceStatus)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className="pt-2 border-t text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated: {new Date(status.last_updated).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 text-sm">
            Failed to load status
          </div>
        )}
      </div>
    </div>
  )
}