import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    aiHealth: [
      {
        platform: 'ChatGPT',
        visible: true,
        visibility: 0.91,
        latencyMs: 640,
        trend: '+2%',
        last: new Date().toISOString()
      },
      {
        platform: 'Claude',
        visible: true,
        visibility: 0.88,
        latencyMs: 540,
        trend: '+1%',
        last: new Date().toISOString()
      },
      {
        platform: 'Perplexity',
        visible: true,
        visibility: 0.84,
        latencyMs: 510,
        trend: '+1%',
        last: new Date().toISOString()
      }
    ]
  });
}

