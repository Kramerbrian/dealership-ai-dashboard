'use client'

import { useState, useEffect, useRef } from 'react'
// Removed Clerk dependency
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Settings, MessageSquare } from 'lucide-react'

interface RealtimeVoiceProps {
  tenantId: string
  className?: string
  onSessionUpdate?: (session: any) => void
  onError?: (error: string) => void
}

interface RealtimeMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  audioUrl?: string
}

export function RealtimeVoice({ 
  tenantId, 
  className = '',
  onSessionUpdate,
  onError 
}: RealtimeVoiceProps) {
  // Mock user for demo purposes
  const user = { id: 'demo-user' }
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<RealtimeMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    voice: 'alloy',
    model: 'gpt-4o-realtime-preview-2024-10-01',
    instructions: ''
  })

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (user && tenantId) {
      initializeSession()
    }
  }, [user, tenantId])

  const initializeSession = async () => {
    try {
      setIsConnecting(true)
      setError(null)

      const response = await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_session',
          tenantId,
          config: settings
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.statusText}`)
      }

      const { session } = await response.json()
      setSessionId(session.sessionId)
      onSessionUpdate?.(session)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize session'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const connectSession = async () => {
    if (!sessionId) return

    try {
      setIsConnecting(true)
      setError(null)

      const response = await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'connect_session',
          sessionId,
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || ''
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to connect session: ${response.statusText}`)
      }

      const { session } = await response.json()
      setIsConnected(true)
      setMessages(session.messages || [])
      onSessionUpdate?.(session)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect session'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectSession = async () => {
    if (!sessionId) return

    try {
      const response = await fetch('/api/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'disconnect_session',
          sessionId
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to disconnect session: ${response.statusText}`)
      }

      setIsConnected(false)
      setSessionId(null)
      setMessages([])

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect session'
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // In a real implementation, you'd control the microphone here
  }

  const toggleSpeaker = () => {
    setIsSpeakerMuted(!isSpeakerMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isSpeakerMuted
    }
  }

  const playAudio = (audioUrl: string) => {
    if (audioRef.current && !isSpeakerMuted) {
      audioRef.current.src = audioUrl
      audioRef.current.play()
    }
  }

  if (!user) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg p-8 ${className}`}>
        <div className="text-center">
          <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Assistant</h3>
          <p className="text-gray-600">Please sign in to access voice features</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <h3 className="font-semibold text-gray-900">DealershipAI Voice Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSettings({ ...settings })}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-xs text-gray-500">Tenant: {tenantId}</span>
        </div>
      </div>

      {/* Connection Status */}
      <div className="p-4 border-b border-gray-200">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`text-sm font-medium ${
                isConnected ? 'text-green-600' : 
                isConnecting ? 'text-yellow-600' : 
                'text-gray-600'
              }`}>
                {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>
            
            {sessionId && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Session:</span>
                <span className="text-sm font-mono text-gray-500">{sessionId.substring(0, 8)}...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isConnected ? (
              <button
                onClick={connectSession}
                disabled={isConnecting || !sessionId}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Phone className="w-4 h-4" />
                {isConnecting ? 'Connecting...' : 'Connect'}
              </button>
            ) : (
              <button
                onClick={disconnectSession}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <PhoneOff className="w-4 h-4" />
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Voice Controls */}
      {isConnected && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={toggleMute}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isMuted 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>

            <button
              onClick={toggleSpeaker}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isSpeakerMuted 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSpeakerMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2" />
            <p>No messages yet. Start speaking to begin the conversation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'assistant'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.audioUrl && (
                    <button
                      onClick={() => playAudio(message.audioUrl!)}
                      className="mt-2 text-xs opacity-75 hover:opacity-100"
                    >
                      🔊 Play Audio
                    </button>
                  )}
                  <p className="text-xs opacity-75 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}

// Settings Modal Component
export function RealtimeSettings({ 
  isOpen, 
  onClose, 
  settings, 
  onSave 
}: {
  isOpen: boolean
  onClose: () => void
  settings: any
  onSave: (settings: any) => void
}) {
  const [localSettings, setLocalSettings] = useState(settings)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Voice
            </label>
            <select
              value={localSettings.voice}
              onChange={(e) => setLocalSettings({ ...localSettings, voice: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="alloy">Alloy</option>
              <option value="echo">Echo</option>
              <option value="fable">Fable</option>
              <option value="onyx">Onyx</option>
              <option value="nova">Nova</option>
              <option value="shimmer">Shimmer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select
              value={localSettings.model}
              onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="gpt-4o-realtime-preview-2024-10-01">GPT-4o Realtime</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Custom Instructions
            </label>
            <textarea
              value={localSettings.instructions}
              onChange={(e) => setLocalSettings({ ...localSettings, instructions: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg h-20"
              placeholder="Additional instructions for the AI assistant..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(localSettings)
              onClose()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
