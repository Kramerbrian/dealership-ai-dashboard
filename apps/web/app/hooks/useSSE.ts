'use client'
import { useEffect, useRef, useState } from 'react'

export interface SSEEvent {
  type: string
  data: any
  timestamp: string
  tenantId?: string
}

export interface SSEConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  lastEvent?: SSEEvent
  error?: string
  reconnectAttempts: number
}

export interface UseSSEOptions {
  tenantId?: string
  eventTypes?: string[]
  autoReconnect?: boolean
  reconnectInterval?: number
  maxReconnectAttempts?: number
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: string) => void
}

export function useSSE(
  url: string, 
  onMessage: (event: SSEEvent) => void,
  options: UseSSEOptions = {}
) {
  const {
    tenantId,
    eventTypes = ['*'],
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
    onConnect,
    onDisconnect,
    onError
  } = options

  const [connectionState, setConnectionState] = useState<SSEConnectionState>({
    status: 'disconnected',
    reconnectAttempts: 0
  })

  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  const buildUrl = () => {
    const urlObj = new URL(url, window.location.origin)
    if (tenantId) urlObj.searchParams.set('tenantId', tenantId)
    if (eventTypes.length > 0 && !eventTypes.includes('*')) {
      urlObj.searchParams.set('types', eventTypes.join(','))
    }
    return urlObj.toString()
  }

  const connect = () => {
    if (!isMountedRef.current) return

    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      setConnectionState(prev => ({ ...prev, status: 'connecting' }))

      const eventSource = new EventSource(buildUrl())
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        if (!isMountedRef.current) return
        
        setConnectionState({
          status: 'connected',
          reconnectAttempts: 0
        })
        onConnect?.()
      }

      eventSource.onmessage = (event) => {
        if (!isMountedRef.current) return

        try {
          const data = JSON.parse(event.data)
          const sseEvent: SSEEvent = {
            type: event.type || 'message',
            data: data.data || data,
            timestamp: data.timestamp || new Date().toISOString(),
            tenantId: data.tenantId
          }

          setConnectionState(prev => ({ ...prev, lastEvent: sseEvent }))
          onMessage(sseEvent)
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }

      eventSource.onerror = (error) => {
        if (!isMountedRef.current) return

        console.error('SSE connection error:', error)
        
        setConnectionState(prev => ({
          ...prev,
          status: 'error',
          error: 'Connection failed'
        }))

        onError?.('Connection failed')

        // Attempt reconnection if enabled
        if (autoReconnect && connectionState.reconnectAttempts < maxReconnectAttempts) {
          scheduleReconnect()
        } else {
          setConnectionState(prev => ({ ...prev, status: 'disconnected' }))
          onDisconnect?.()
        }
      }

      // Handle specific event types
      eventTypes.forEach(eventType => {
        if (eventType !== '*') {
          eventSource.addEventListener(eventType, (event) => {
            if (!isMountedRef.current) return

            try {
              const data = JSON.parse(event.data)
              const sseEvent: SSEEvent = {
                type: eventType,
                data: data.data || data,
                timestamp: data.timestamp || new Date().toISOString(),
                tenantId: data.tenantId
              }

              setConnectionState(prev => ({ ...prev, lastEvent: sseEvent }))
              onMessage(sseEvent)
            } catch (error) {
              console.error(`Error parsing SSE event ${eventType}:`, error)
            }
          })
        }
      })

    } catch (error) {
      console.error('Error creating SSE connection:', error)
      setConnectionState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to create connection'
      }))
      onError?.('Failed to create connection')
    }
  }

  const scheduleReconnect = () => {
    if (!isMountedRef.current) return

    setConnectionState(prev => ({
      ...prev,
      reconnectAttempts: prev.reconnectAttempts + 1
    }))

    reconnectTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        connect()
      }
    }, reconnectInterval)
  }

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    setConnectionState(prev => ({ ...prev, status: 'disconnected' }))
    onDisconnect?.()
  }

  const reconnect = () => {
    disconnect()
    setTimeout(connect, 100)
  }

  useEffect(() => {
    isMountedRef.current = true
    connect()

    return () => {
      isMountedRef.current = false
      disconnect()
    }
  }, [url, tenantId, eventTypes.join(',')])

  return {
    connectionState,
    connect,
    disconnect,
    reconnect
  }
}

// Convenience hook for specific event types
export function useSSEEvents(
  url: string,
  eventHandlers: Record<string, (event: SSEEvent) => void>,
  options: UseSSEOptions = {}
) {
  const onMessage = (event: SSEEvent) => {
    const handler = eventHandlers[event.type]
    if (handler) {
      handler(event)
    }
  }

  return useSSE(url, onMessage, {
    ...options,
    eventTypes: Object.keys(eventHandlers)
  })
}

// Hook for job status updates
export function useJobSSE(
  tenantId: string,
  onJobUpdate: (jobId: string, status: string, data: any) => void
) {
  return useSSEEvents(
    '/api/events/stream',
    {
      'job.started': (event) => onJobUpdate(event.data.jobId, 'started', event.data),
      'job.completed': (event) => onJobUpdate(event.data.jobId, 'completed', event.data),
      'job.failed': (event) => onJobUpdate(event.data.jobId, 'failed', event.data)
    },
    { tenantId }
  )
}

// Hook for audit updates
export function useAuditSSE(
  tenantId: string,
  onAuditUpdate: (auditId: string, status: string, data: any) => void
) {
  return useSSEEvents(
    '/api/events/stream',
    {
      'audit.created': (event) => onAuditUpdate(event.data.auditId, 'created', event.data),
      'audit.resolved': (event) => onAuditUpdate(event.data.auditId, 'resolved', event.data)
    },
    { tenantId }
  )
}
