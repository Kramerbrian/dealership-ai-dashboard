'use client';

import { useEffect, useRef, useState } from 'react';
import { getApiBase } from '@/lib/apiConfig';

export type ScanEvent =
  | { type: 'start'; domain: string; message: string }
  | { type: 'progress'; agent: string; status: 'running' | 'done'; message: string; pct: number; facts?: any }
  | { type: 'complete'; message: string; summary: any }
  | { type: 'heartbeat'; ts: number }
  | { type: 'error'; message: string };

export function useScanSSE(domain?: string) {
  const [events, setEvents] = useState<ScanEvent[]>([]);
  const [pct, setPct] = useState<number>(0);
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const esRef = useRef<EventSource | null>(null);

  function start() {
    if (!domain || running) return;
    setRunning(true);
    setSummary(null);
    setEvents([]);
    setPct(0);

    const url = `${getApiBase()}/scan/stream?domain=${encodeURIComponent(domain)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      const data = JSON.parse(e.data) as ScanEvent;
      setEvents(prev => [...prev, data]);
      if (data.type === 'progress') setPct(data.pct ?? 0);
      if (data.type === 'complete') {
        setPct(100);
        setSummary(data.summary);
        setRunning(false);
        es.close();
      }
    };

    es.onerror = () => {
      setRunning(false);
      setEvents(prev => [...prev, { type: 'error', message: 'stream error' }]);
      es.close();
    };
  }

  function stop() {
    esRef.current?.close();
    setRunning(false);
  }

  useEffect(() => {
    return () => {
      esRef.current?.close();
    };
  }, []);

  return { start, stop, running, pct, events, summary };
}

