import { NextRequest } from 'next/server';
import { bus, type AiScoreUpdateEvent, type MSRPChangeEvent } from '@/lib/events/bus';

export const runtime = 'nodejs'; // Ensure Node runtime for streams
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dealerId = searchParams.get('dealerId') ?? undefined;
  const vinFilter = searchParams.get('vin') ?? undefined;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (type: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${type}\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (error) {
          console.error('SSE send error:', error);
        }
      };

      // Initial hello for quick UI readiness
      send('hello', {
        ok: true,
        dealerId,
        vin: vinFilter,
        ts: new Date().toISOString(),
      });

      // Filter helpers
      const pass = (payload: { dealerId?: string; vin: string }) => {
        if (vinFilter && payload.vin !== vinFilter) return false;
        if (dealerId && payload.dealerId && payload.dealerId !== dealerId) return false;
        return true;
      };

      const onScore = (evt: AiScoreUpdateEvent) => {
        if (!pass(evt)) return;
        send('ai-score', evt);
      };

      const onMSRP = (evt: MSRPChangeEvent) => {
        if (!pass(evt)) return;
        send('msrp', evt);
      };

      bus.on('ai-scores:update', onScore);
      bus.on('msrp:change', onMSRP);

      // Keep-alive heartbeat (prevents proxies from closing idle streams)
      const hb = setInterval(() => {
        send('hb', { ts: new Date().toISOString() });
      }, 25000);

      // Cleanup on close
      const close = () => {
        clearInterval(hb);
        bus.off('ai-scores:update', onScore);
        bus.off('msrp:change', onMSRP);
        try {
          controller.close();
        } catch (error) {
          // Stream may already be closed
        }
      };

      // Abort if client disconnects
      const signal = req.signal;
      if (signal.aborted) {
        close();
        return;
      }

      signal.addEventListener('abort', close);

      // Cleanup on error
      controller.enqueue = new Proxy(controller.enqueue.bind(controller), {
        apply(target, thisArg, args) {
          try {
            return Reflect.apply(target, thisArg, args);
          } catch (error) {
            close();
            throw error;
          }
        },
      });
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // for nginx/proxies
    },
  });
}

