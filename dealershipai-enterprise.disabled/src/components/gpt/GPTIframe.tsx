'use client'

import { useState, useEffect, useRef } from 'react'
// Removed Clerk dependency
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react'

interface GPTIframeProps {
  tenantId: string
  action: string
  parameters?: any
  className?: string
  height?: string
  onResponse?: (data: any) => void
  onError?: (error: string) => void
}

export function GPTIframe({ 
  tenantId, 
  action, 
  parameters = {}, 
  className = '',
  height = '600px',
  onResponse,
  onError 
}: GPTIframeProps) {
  // Mock user for demo purposes
  const user = { id: 'demo-user' }
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (user && tenantId) {
      loadGPTInterface()
    }
  }, [user, tenantId, action, parameters])

  const loadGPTInterface = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get tenant JWT via proxy
      const response = await fetch('/api/gpt/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_interface_token',
          parameters: { action, ...parameters },
          tenantId
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to get GPT interface token: ${response.statusText}`)
      }

      const { data } = await response.json()
      
      // Set up iframe with tenant JWT
      if (iframeRef.current) {
        const iframe = iframeRef.current
        
        // Configure iframe source with tenant context
        const iframeSrc = `${process.env.NEXT_PUBLIC_GPT_IFRAME_URL}?token=${data.token}&tenant=${tenantId}&action=${action}`
        iframe.src = iframeSrc
        
        // Set up message listener for iframe communication
        const handleMessage = (event: MessageEvent) => {
          // Verify origin for security
          if (event.origin !== process.env.NEXT_PUBLIC_GPT_IFRAME_URL) {
            return
          }

          const { type, data: messageData, error: messageError } = event.data

          switch (type) {
            case 'gpt_response':
              setLoading(false)
              onResponse?.(messageData)
              break
            case 'gpt_error':
              setLoading(false)
              setError(messageError || 'GPT processing error')
              onError?.(messageError || 'GPT processing error')
              break
            case 'gpt_loading':
              setLoading(true)
              break
            case 'gpt_ready':
              setLoading(false)
              break
          }
        }

        window.addEventListener('message', handleMessage)
        
        // Cleanup listener on unmount
        return () => {
          window.removeEventListener('message', handleMessage)
        }
      }

    } catch (err) {
      setLoading(false)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load GPT interface'
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    loadGPTInterface()
  }

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  if (!user) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-600">Please sign in to access GPT features</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">GPT Assistant</h3>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
          <span className="text-xs text-gray-500">Tenant: {tenantId}</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative" style={{ height: `calc(${height} - 60px)` }}>
        {error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 mb-2">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry ({retryCount}/3)
              </button>
            </div>
          </div>
        ) : (
          <>
            {loading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-600">Loading GPT interface...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="GPT Assistant"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Action: {action}</span>
          <span>Powered by GPT with tenant isolation</span>
        </div>
      </div>
    </div>
  )
}

// Alternative API-based component (no iframe)
export function GPTAPIComponent({ 
  tenantId, 
  action, 
  parameters = {}, 
  className = '',
  onResponse,
  onError 
}: Omit<GPTIframeProps, 'height'>) {
  // Mock user for demo purposes
  const user = { id: 'demo-user' }
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGPTRequest = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const result = await fetch('/api/gpt/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          parameters,
          tenantId
        })
      })

      if (!result.ok) {
        throw new Error(`GPT request failed: ${result.statusText}`)
      }

      const data = await result.json()
      setResponse(data.data)
      onResponse?.(data.data)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'GPT request failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <p className="text-gray-600">Please sign in to access GPT features</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">GPT API Component</h3>
          <button
            onClick={handleGPTRequest}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Run GPT Action'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {response && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <pre className="text-sm text-green-800 whitespace-pre-wrap">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
