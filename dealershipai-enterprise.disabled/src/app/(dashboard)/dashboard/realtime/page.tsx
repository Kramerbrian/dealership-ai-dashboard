'use client'

import { useState, useEffect } from 'react'
// Removed Clerk dependency
import { RealtimeVoice, RealtimeSettings } from '@/components/realtime/RealtimeVoice'
import { Mic, Headphones, MessageSquare, Clock, Users, Zap } from 'lucide-react'

export default function RealtimePage() {
  // Mock user for demo purposes
  const user = { id: 'demo-user' }
  const [currentSession, setCurrentSession] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    voice: 'alloy',
    model: 'gpt-4o-realtime-preview-2024-10-01',
    instructions: ''
  })

  const tenantId = user?.organizationMemberships?.[0]?.organization?.id || 'default-tenant'

  useEffect(() => {
    if (user && tenantId) {
      loadTenantSessions()
    }
  }, [user, tenantId])

  const loadTenantSessions = async () => {
    try {
      const response = await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_tenant_sessions',
          tenantId
        })
      })

      if (response.ok) {
        const { sessions } = await response.json()
        setSessions(sessions)
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    }
  }

  const handleSessionUpdate = (session: any) => {
    setCurrentSession(session)
    loadTenantSessions() // Refresh the list
  }

  const handleError = (error: string) => {
    console.error('Realtime error:', error)
  }

  const handleSettingsSave = (newSettings: any) => {
    setSettings(newSettings)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Mic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Voice Assistant</h2>
          <p className="text-gray-600">Please sign in to access voice features</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voice Assistant</h1>
          <p className="text-gray-600 mt-1">
            Real-time voice interactions with DealershipAI
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Zap className="w-4 h-4" />
          <span>Powered by OpenAI Realtime API</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Voice Interface */}
        <div className="lg:col-span-2">
          <RealtimeVoice
            tenantId={tenantId}
            onSessionUpdate={handleSessionUpdate}
            onError={handleError}
            className="h-full"
          />
        </div>

        {/* Session History & Stats */}
        <div className="space-y-6">
          {/* Current Session Stats */}
          {currentSession && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Session</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration:</span>
                  <span className="text-sm font-medium">
                    {Math.floor((Date.now() - new Date(currentSession.startTime).getTime()) / 1000 / 60)}m
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Messages:</span>
                  <span className="text-sm font-medium">{currentSession.messages?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium ${
                    currentSession.status === 'connected' ? 'text-green-600' :
                    currentSession.status === 'connecting' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    {currentSession.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Session History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Sessions</h3>
              <button
                onClick={loadTenantSessions}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Refresh
              </button>
            </div>
            
            {sessions.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">No recent sessions</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.sessionId}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(session.startTime).toLocaleDateString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.status === 'connected' ? 'bg-green-100 text-green-800' :
                        session.status === 'disconnected' ? 'bg-gray-100 text-gray-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {session.messages?.length || 0} messages
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.endTime 
                          ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000 / 60)
                          : Math.floor((Date.now() - new Date(session.startTime).getTime()) / 1000 / 60)
                        }m
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Headphones className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900">Voice Settings</div>
                  <div className="text-sm text-gray-600">Configure voice and model preferences</div>
                </div>
              </button>
              
              <button
                onClick={loadTenantSessions}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5 text-green-500" />
                <div>
                  <div className="font-medium text-gray-900">Session History</div>
                  <div className="text-sm text-gray-600">View all previous conversations</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <RealtimeSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={handleSettingsSave}
      />
    </div>
  )
}
