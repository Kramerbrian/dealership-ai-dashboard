/**
 * POST /api/test/orchestrator
 * 
 * Test endpoint to trigger orchestrator tasks and verify Redis Pub/Sub events
 */

import { NextRequest, NextResponse } from 'next/server';
import { publish } from '@/lib/events/bus';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { task, dealerId = 'TEST' } = body;

    if (!task) {
      return NextResponse.json(
        { error: 'task is required' },
        { status: 400 }
      );
    }

    const results: any[] = [];

    if (task === 'msrp_sync' || task === 'all') {
      // Simulate MSRP sync - publish MSRP change events
      const priceChanges = 5; // Test with 5 events
      
      for (let i = 0; i < priceChanges; i++) {
        const vin = `TEST-VIN-${i + 1}`;
        const oldPrice = 30000 + Math.random() * 10000;
        const newPrice = oldPrice + (Math.random() - 0.5) * 2000;
        const deltaPct = ((newPrice - oldPrice) / oldPrice) * 100;

        await publish('msrp', {
          vin,
          old: Math.round(oldPrice),
          new: Math.round(newPrice),
          deltaPct: Math.round(deltaPct * 100) / 100,
          ts: new Date().toISOString(),
        });

        results.push({
          type: 'msrp',
          vin,
          old: Math.round(oldPrice),
          new: Math.round(newPrice),
          deltaPct: Math.round(deltaPct * 100) / 100,
        });
      }
    }

    if (task === 'ai_score_recompute' || task === 'all') {
      // Simulate AI score recompute - publish AI score update events
      const scoresUpdated = 5; // Test with 5 events
      
      for (let i = 0; i < scoresUpdated; i++) {
        const vin = `TEST-VIN-${i + 1}`;
        const avi = 85 + Math.random() * 10;
        const ati = avi * 0.95;
        const cis = 80 + Math.random() * 10;

        await publish('ai', {
          vin,
          dealerId,
          reason: 'test_recompute',
          avi: Math.round(avi * 10) / 10,
          ati: Math.round(ati * 10) / 10,
          cis: Math.round(cis * 10) / 10,
          ts: new Date().toISOString(),
        });

        results.push({
          type: 'ai',
          vin,
          dealerId,
          avi: Math.round(avi * 10) / 10,
          ati: Math.round(ati * 10) / 10,
          cis: Math.round(cis * 10) / 10,
        });
      }
    }

    return NextResponse.json({
      success: true,
      task,
      dealerId,
      eventsPublished: results.length,
      events: results,
      message: `Published ${results.length} events to Redis Pub/Sub`,
    });
  } catch (error) {
    console.error('Test orchestrator error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

