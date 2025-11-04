/**
 * Real-Time Update Hooks
 * 
 * React hooks for subscribing to real-time updates via SSE
 */

'use client';

import { useEffect, useState, useRef } from 'react';

interface RealtimeEvent {
  type: string;
  timestamp: string;
  data?: any;
  message?: string;
}

/**
 * Hook for subscribing to real-time events via SSE
 */
export function useRealtimeEvents(url: string = '/api/realtime/events') {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Create EventSource connection
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: RealtimeEvent = JSON.parse(event.data);
        setEvents(prev => [...prev.slice(-99), data]); // Keep last 100 events
      } catch (err) {
        console.error('Error parsing SSE message:', err);
      }
    };

    eventSource.onerror = (err) => {
      setError(new Error('SSE connection error'));
      setIsConnected(false);
    };

    // Cleanup
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [url]);

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setIsConnected(false);
    }
  };

  return {
    events,
    isConnected,
    error,
    disconnect,
    latestEvent: events[events.length - 1] || null,
  };
}

/**
 * Hook for real-time performance metrics
 */
export function useRealtimeMetrics() {
  const { events, isConnected } = useRealtimeEvents();
  
  const metrics = events
    .filter(e => e.type === 'metrics')
    .map(e => e.data)
    .filter(Boolean);

  return {
    metrics,
    isConnected,
    latest: metrics[metrics.length - 1] || null,
  };
}

