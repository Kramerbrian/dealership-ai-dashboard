'use client'

import { useState, useEffect } from 'react'

interface PolicyApplySSEProps {
  tenantId?: string
  onComplete?: () => void
}

export default function PolicyApplySSE({ tenantId, onComplete }: PolicyApplySSEProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tenantId) return

    const eventSource = new EventSource(`/api/policy/apply/stream?tenantId=${tenantId}`)
    
    eventSource.onopen = () => {
      setIsConnected(true)
      setError(null)
    }

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'progress') {
          setProgress(data.progress)
          setCurrentStep(data.step)
        } else if (data.type === 'log') {
          setLogs(prev => [...prev, data.message])
        } else if (data.type === 'complete') {
          setProgress(100)
          setCurrentStep('Complete')
          eventSource.close()
          setIsConnected(false)
          onComplete?.()
        } else if (data.type === 'error') {
          setError(data.message)
          eventSource.close()
          setIsConnected(false)
        }
      } catch (err) {
        console.error('Failed to parse SSE data:', err)
      }
    }

    eventSource.onerror = () => {
      setError('Connection lost')
      setIsConnected(false)
      eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [tenantId, onComplete])

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Policy Application Progress</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`}></div>
          <span className="text-sm text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 text-sm">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>{currentStep}</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Activity Log</h4>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-xs text-gray-600 font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Real-time policy application monitoring via Server-Sent Events
      </div>
    </div>
  )
}