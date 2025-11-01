/**
 * Client-side SSE subscription hook for AI scores and MSRP changes
 */

export type StreamEventType = 'ai-score' | 'msrp' | 'hb' | 'hello';

export interface StreamEvent {
  type: StreamEventType;
  data: any;
}

export interface SubscribeOptions {
  dealerId?: string;
  vin?: string;
  onMessage: (evt: StreamEvent) => void;
  onError?: (error: Event) => void;
}

/**
 * Subscribe to AI score and MSRP change events via SSE
 * Returns cleanup function to close the connection
 */
export function subscribeAiScores(opts: SubscribeOptions): () => void {
  const qs = new URLSearchParams();
  if (opts.dealerId) qs.set('dealerId', opts.dealerId);
  if (opts.vin) qs.set('vin', opts.vin);

  const es = new EventSource(`/api/ai-scores/stream?${qs.toString()}`);

  es.addEventListener('ai-score', (e: MessageEvent) => {
    try {
      opts.onMessage({
        type: 'ai-score',
        data: JSON.parse(e.data),
      });
    } catch (error) {
      console.error('Error parsing ai-score event:', error);
    }
  });

  es.addEventListener('msrp', (e: MessageEvent) => {
    try {
      opts.onMessage({
        type: 'msrp',
        data: JSON.parse(e.data),
      });
    } catch (error) {
      console.error('Error parsing msrp event:', error);
    }
  });

  es.addEventListener('hb', (e: MessageEvent) => {
    try {
      opts.onMessage({
        type: 'hb',
        data: JSON.parse(e.data),
      });
    } catch (error) {
      console.error('Error parsing heartbeat event:', error);
    }
  });

  es.addEventListener('hello', (e: MessageEvent) => {
    try {
      opts.onMessage({
        type: 'hello',
        data: JSON.parse(e.data),
      });
    } catch (error) {
      console.error('Error parsing hello event:', error);
    }
  });

  es.addEventListener('error', (error) => {
    // Browser will auto-retry on connection errors
    if (opts.onError) {
      opts.onError(error);
    } else {
      console.warn('SSE connection error (will auto-retry):', error);
    }
  });

  return () => {
    es.close();
  };
}

