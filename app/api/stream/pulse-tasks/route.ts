import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

/**
 * GET /api/stream/pulse-tasks
 * Server-Sent Events stream for new PulseTasks
 * Watches the queue and emits events when new tasks are created
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId');
    const agent = searchParams.get('agent');

    if (!dealerId) {
      return new Response(
        JSON.stringify({ error: 'dealerId required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        send({ type: 'connected', timestamp: new Date().toISOString() });

        // Poll for new tasks every 2 seconds
        const interval = setInterval(async () => {
          try {
            const tasks = await prisma.$queryRawUnsafe<Array<{
              id: string;
              agent: string;
              status: string;
              payload: any;
              createdAt: Date;
            }>>(
              `SELECT * FROM "PulseTask" WHERE "dealerId" = $1 AND status = 'queued' ${agent ? 'AND agent = $2' : ''} ORDER BY "createdAt" DESC LIMIT 10`,
              dealerId,
              agent || null
            );

            if (tasks.length > 0) {
              send({
                type: 'new_task',
                tasks: tasks.map(t => ({
                  id: t.id,
                  agent: t.agent,
                  payload: t.payload,
                  createdAt: t.createdAt.toISOString(),
                })),
              });
            }
          } catch (error) {
            console.error('[stream/pulse-tasks] poll error:', error);
          }
        }, 2000);

        // Heartbeat every 30 seconds
        const heartbeat = setInterval(() => {
          send({ type: 'heartbeat', timestamp: new Date().toISOString() });
        }, 30000);

        // Cleanup on close
        req.signal.addEventListener('abort', () => {
          clearInterval(interval);
          clearInterval(heartbeat);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[stream/pulse-tasks] error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Stream failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

