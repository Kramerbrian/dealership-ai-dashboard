import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface AIResponse {
  platform: string;
  query: string;
  answer: string;
  confidence: number;
  sources: string[];
  timestamp: string;
}

/**
 * GET /api/ai-visibility/consensus?origin=https://www.dealer.com&query=hours
 * 
 * Cross-AI consensus scoring: Run identical queries through multiple LLMs,
 * store answers, calculate Consensus Strength %
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const origin = searchParams.get('origin');
    const query = searchParams.get('query') || 'What are the hours for this dealership?';

    if (!origin) {
      return NextResponse.json(
        { error: 'origin query parameter is required' },
        { status: 400 }
      );
    }

    const url = new URL(origin.startsWith('http') ? origin : `https://${origin}`);
    const domain = url.hostname.replace('www.', '');

    // Simulate queries to multiple AI platforms
    // In production, call OpenAI, Anthropic, Perplexity APIs
    const responses: AIResponse[] = [
      {
        platform: 'google',
        query,
        answer: 'Monday-Friday: 9am-8pm, Saturday: 9am-7pm, Sunday: 11am-6pm',
        confidence: 0.95,
        sources: [`https://${domain}/contact`],
        timestamp: new Date().toISOString(),
      },
      {
        platform: 'chatgpt',
        query,
        answer: 'Monday-Friday 9am-8pm, Saturday 9am-7pm, Sunday 11am-6pm',
        confidence: 0.88,
        sources: [`https://${domain}`, `https://g.page/${domain}`],
        timestamp: new Date().toISOString(),
      },
      {
        platform: 'perplexity',
        query,
        answer: 'Hours: Mon-Fri 9-8, Sat 9-7, Sun 11-6',
        confidence: 0.92,
        sources: [`https://${domain}/contact`, `https://www.google.com/maps/place/${domain}`],
        timestamp: new Date().toISOString(),
      },
      {
        platform: 'claude',
        query,
        answer: 'Open Monday through Friday 9 AM to 8 PM, Saturday 9 AM to 7 PM, Sunday 11 AM to 6 PM',
        confidence: 0.85,
        sources: [`https://${domain}`],
        timestamp: new Date().toISOString(),
      },
    ];

    // Calculate consensus strength
    const consensus = calculateConsensus(responses);

    // Store consensus data
    await prisma.audit.create({
      data: {
        dealershipId: (await prisma.dealership.findUnique({ where: { domain } }))?.id || '',
        domain,
        scores: JSON.stringify({
          type: 'ai-consensus',
          query,
          responses,
          consensus,
          analyzedAt: new Date().toISOString(),
        }),
        status: 'completed',
      },
    });

    return NextResponse.json({
      origin,
      domain,
      query,
      responses,
      consensus,
      interpretation: {
        strength: consensus.strength > 0.85 ? 'high' : consensus.strength > 0.65 ? 'medium' : 'low',
        stability: consensus.divergence < 0.1 ? 'stable' : consensus.divergence < 0.25 ? 'moderate' : 'unstable',
        recommendation: consensus.divergence > 0.25
          ? 'High divergence detected. Review and standardize information sources to improve reputation stability.'
          : 'Strong consensus indicates reliable reputation signal.',
      },
    });
  } catch (error: any) {
    console.error('Consensus error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to calculate consensus' },
      { status: 500 }
    );
  }
}

function calculateConsensus(responses: AIResponse[]): {
  strength: number;
  divergence: number;
  agreement: number;
  mostReliable: string;
} {
  // Normalize answers for comparison
  const normalizedAnswers = responses.map((r) => normalizeAnswer(r.answer));

  // Calculate pairwise similarity
  let totalSimilarity = 0;
  let pairs = 0;
  for (let i = 0; i < normalizedAnswers.length; i++) {
    for (let j = i + 1; j < normalizedAnswers.length; j++) {
      const similarity = jaccardSimilarity(normalizedAnswers[i], normalizedAnswers[j]);
      totalSimilarity += similarity;
      pairs++;
    }
  }

  const agreement = pairs > 0 ? totalSimilarity / pairs : 0;
  const divergence = 1 - agreement;

  // Weight by confidence
  const weightedConsensus =
    responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
  const strength = agreement * weightedConsensus;

  // Most reliable = highest confidence
  const mostReliable = responses.reduce((best, r) =>
    r.confidence > best.confidence ? r : best
  ).platform;

  return {
    strength: Math.round(strength * 100) / 100,
    divergence: Math.round(divergence * 100) / 100,
    agreement: Math.round(agreement * 100) / 100,
    mostReliable,
  };
}

function normalizeAnswer(answer: string): string {
  return answer
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function jaccardSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.split(' '));
  const set2 = new Set(str2.split(' '));

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return union.size > 0 ? intersection.size / union.size : 0;
}

