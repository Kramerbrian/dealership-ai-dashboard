/**
 * Pulse API - Backend push endpoint for Pulse cards
 * POST /api/pulse - Add pulse cards from backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import type { PulseCard } from '@/lib/types/pulse';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cards: PulseCard[] = await req.json();

    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: 'Invalid payload: expected array of PulseCard' }, { status: 400 });
    }

    // Validate cards
    for (const card of cards) {
      if (!card.id || !card.ts || !card.level || !card.kind || !card.title) {
        return NextResponse.json(
          { error: `Invalid card: missing required fields` },
          { status: 400 }
        );
      }
    }

    // Process auto-promotion rules
    const promotedIncidents = [];
    for (const card of cards) {
      if (card.kind === 'kpi_delta' && card.delta) {
        const delta = typeof card.delta === 'number' ? card.delta : parseFloat(String(card.delta));
        if (Math.abs(delta) >= 6) {
          // Auto-promote to incident
          promotedIncidents.push({
            title: `AIV ${delta > 0 ? '+' : ''}${delta}`,
            category: 'ai_visibility',
            urgency: delta < 0 ? 'high' : 'medium',
            impact_points: Math.abs(delta) * 1000,
            confidence: 0.8,
            time_to_fix_min: 5,
            reason: 'Visibility shifted beyond target band.',
            autofix: true,
            fix_tiers: ['tier1_diy', 'tier2_guided', 'tier3_dfy'],
            receipts: [
              {
                label: 'KPI trend',
                kpi: 'AIV',
                before: (typeof card.delta === 'number' ? 0 : 0) - delta,
                after: typeof card.delta === 'number' ? card.delta : parseFloat(String(card.delta)),
              },
            ],
            created_at: new Date().toISOString(),
            pulseCardId: card.id,
          });
        }
      }

      if (card.kind === 'sla_breach') {
        promotedIncidents.push({
          title: card.title,
          category: 'sla',
          urgency: 'high',
          impact_points: 5000,
          confidence: 1.0,
          time_to_fix_min: 15,
          reason: card.detail || 'SLA breach detected',
          autofix: false,
          fix_tiers: ['tier2_guided', 'tier3_dfy'],
          receipts: card.receipts || [],
          created_at: new Date().toISOString(),
          pulseCardId: card.id,
        });
      }
    }

    // In production, you would:
    // 1. Store cards in database
    // 2. Create incidents for promoted cards
    // 3. Emit real-time updates via WebSocket/SSE

    return NextResponse.json({
      success: true,
      cardsReceived: cards.length,
      promotedIncidents: promotedIncidents.length,
      incidents: promotedIncidents,
    });
  } catch (error: any) {
    console.error('Pulse API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    // In production, fetch from database
    // For now, return empty array
    return NextResponse.json({
      cards: [],
      filter,
      limit,
    });
  } catch (error: any) {
    console.error('Pulse GET error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

