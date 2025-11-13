import { tracer } from '@/lib/otel/tracer';
import { NextRequest, NextResponse } from 'next/server';

export function traced<T extends (req: NextRequest, ...args:any[]) => Promise<Response | NextResponse> | Response | NextResponse>(
  handler: T,
  name: string
): (req: NextRequest, ...args:any[]) => Promise<Response | NextResponse> {
  return async (req: NextRequest, ...args:any[]) => {
    return await tracer.startActiveSpan(name, async (span) => {
      const start = Date.now();
      try {
        span.setAttribute('http.method', req.method || 'GET');
        span.setAttribute('http.route', name);
        const res = await handler(req, ...args);
        span.setAttribute('http.status_code', (res as any)?.status || 200);
        return res;
      } catch (e:any) {
        span.recordException(e);
        span.setAttribute('error', true);
        return NextResponse.json({ ok:false, error: e?.message || 'error' }, { status: 500 });
      } finally {
        span.setAttribute('duration_ms', Date.now() - start);
        span.end();
      }
    });
  }
}

