/**
 * GPT Interaction Logs API
 * 
 * Stores and retrieves GPT interaction logs for analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { InteractionLog } from '@/lib/gpt/feedback-schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// In-memory store (use Supabase in production)
const logsStore: InteractionLog[] = [];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const log: InteractionLog = await req.json();

    // Validate log structure
    if (!log.interactionId || !log.userQuery || !log.botResponse) {
      return NextResponse.json(
        { error: 'Invalid log structure' },
        { status: 400 }
      );
    }

    // Store log (in production, save to database)
    logsStore.push(log);
    
    // Keep only last 1000 logs in memory
    if (logsStore.length > 1000) {
      logsStore.shift();
    }

    // In production, also save to Supabase:
    // await supabase.from('gpt_interactions').insert(log);

    return NextResponse.json({ success: true, interactionId: log.interactionId });

  } catch (error) {
    console.error('Save log error:', error);
    return NextResponse.json(
      { error: 'Failed to save log' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const userId = searchParams.get('userId');
    const outcome = searchParams.get('outcome');

    // Filter logs
    let filtered = logsStore;

    if (userId) {
      filtered = filtered.filter(log => log.userId === userId);
    }

    if (outcome) {
      filtered = filtered.filter(log => log.outcome === outcome);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      logs: filtered.slice(0, limit),
      total: filtered.length
    });

  } catch (error) {
    console.error('Get logs error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve logs' },
      { status: 500 }
    );
  }
}

