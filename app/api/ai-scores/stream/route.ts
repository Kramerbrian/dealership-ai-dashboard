import { NextRequest } from 'next/server';
import { bus } from '@/lib/events/bus';
import { incClients, decClients } from '@/lib/metrics/events';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dealerId = searchParams.get('dealerId') ?? undefined;
  const vinFilter = searchParams.get('vin') ?? undefined;

  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      const send = (t: string, d: any) => {
        controller.enqueue(enc.encode(`event: ${t}\n`));
        controller.enqueue(enc.encode(`data: ${JSON.stringify(d)}\n\n`));
      };

      const pass = (p: any) => {
        if (vinFilter && p.vin !== vinFilter) return false;
        if (dealerId && p.dealerId && p.dealerId !== dealerId) return false;
        return true;
      };

      const onAI = (e: any) => {
        if (pass(e)) send('ai-score', e);
      };

      const onMSRP = (e: any) => {
        if (pass(e)) send('msrp', e);
      };

      send('hello', {
        ok: true,
        dealerId,
        vin: vinFilter,
        ts: new Date().toISOString(),
      });

      bus.on('dai:ai-scores:update', onAI);
      bus.on('dai:msrp:change', onMSRP);

      const hb = setInterval(() => send('hb', { ts: new Date().toISOString() }), 25000);

      incClients();

      const close = () => {
        clearInterval(hb);
        bus.off('dai:ai-scores:update', onAI);
        bus.off('dai:msrp:change', onMSRP);
        decClients();
        controller.close();
      };

      const signal = req.signal;
      if (signal.aborted) close();
      else signal.addEventListener('abort', close);
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

