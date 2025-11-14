'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface PulseTask {
  id: string;
  agent: 'aim_gpt' | 'pulse_engine' | 'schema_engine';
  payload: any;
  createdAt: string;
}

interface PulseTaskStreamEvent {
  type: 'connected' | 'new_task' | 'heartbeat';
  tasks?: PulseTask[];
  timestamp?: string;
}

/**
 * usePulseTaskStream
 * Watches the PulseTask queue for new tasks via SSE
 */
export function usePulseTaskStream(dealerId: string, agent?: string) {
  const [tasks, setTasks] = useState<PulseTask[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const start = useCallback(() => {
    if (eventSourceRef.current) return; // Already connected

    const params = new URLSearchParams({ dealerId });
    if (agent) params.set('agent', agent);

    const eventSource = new EventSource(`/api/stream/pulse-tasks?${params.toString()}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: PulseTaskStreamEvent = JSON.parse(event.data);
        
        if (data.type === 'new_task' && data.tasks) {
          setTasks((prev) => {
            // Deduplicate by task ID
            const existingIds = new Set(prev.map(t => t.id));
            const newTasks = data.tasks!.filter(t => !existingIds.has(t.id));
            return [...newTasks, ...prev].slice(0, 50); // Keep last 50
          });
        } else if (data.type === 'connected') {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('[usePulseTaskStream] parse error:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[usePulseTaskStream] SSE error:', error);
      setIsConnected(false);
    };
  }, [dealerId, agent]);

  const stop = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (dealerId) {
      start();
    }
    return () => stop();
  }, [dealerId, start, stop]);

  return { tasks, isConnected, start, stop };
}

