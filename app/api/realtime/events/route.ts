/**
 * Server-Sent Events (SSE) Endpoint
 * 
 * Provides real-time updates for dashboard and metrics via Redis Pub/Sub
 */

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { bus, Channels } from '@/lib/events/bus';
import type { AiScoreUpdateEvent, MSRPChangeEvent } from '@/lib/events/bus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Use Node.js runtime for EventEmitter access

/**
 * GET /api/realtime/events
 * 
 * Server-Sent Events stream for real-time updates
 * Listens to event bus for AI score updates and MSRP changes
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dealerId = searchParams.get('dealerId') || undefined;

    // Create a readable stream for SSE
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Send initial connection message
        controller.enqueue(
          encoder.encode('data: {"type":"connected","message":"Real-time updates enabled"}\n\n')
        );

        // Listen to AI score updates
        const aiScoreHandler = (event: AiScoreUpdateEvent) => {
          // Filter by dealerId if provided
          if (dealerId && event.dealerId && event.dealerId !== dealerId) {
            return;
          }

          try {
            const message = {
              type: 'ai-score-update',
              timestamp: event.ts,
              data: {
                vin: event.vin,
                dealerId: event.dealerId,
                reason: event.reason,
                scores: {
                  avi: event.avi,
                  ati: event.ati,
                  cis: event.cis,
                },
              },
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
            );
          } catch (error) {
            console.error('Error encoding AI score event:', error);
          }
        };

        // Listen to MSRP changes
        const msrpChangeHandler = (event: MSRPChangeEvent) => {
          try {
            const message = {
              type: 'msrp-change',
              timestamp: event.ts,
              data: {
                vin: event.vin,
                old: event.old,
                new: event.new,
                deltaPct: event.deltaPct,
              },
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(message)}\n\n`)
            );
          } catch (error) {
            console.error('Error encoding MSRP change event:', error);
          }
        };

        // Subscribe to event bus
        bus.on(Channels.ai, aiScoreHandler);
        bus.on(Channels.msrp, msrpChangeHandler);

        // Send periodic heartbeat to keep connection alive
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(
              encoder.encode('data: {"type":"heartbeat","timestamp":"' + new Date().toISOString() + '"}\n\n')
            );
          } catch (error) {
            console.error('Error sending heartbeat:', error);
          }
        }, 30000); // Every 30 seconds

        // Cleanup on client disconnect
        req.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
          bus.off(Channels.ai, aiScoreHandler);
          bus.off(Channels.msrp, msrpChangeHandler);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable buffering in nginx
      },
    });
  } catch (error) {
    console.error('SSE error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

