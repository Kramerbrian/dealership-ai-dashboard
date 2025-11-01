import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rarQueue } from '@/lib/queues/rarQueue';

const EventSchema = z.object({
  dealerId: z.string(),
  month: z.string(), // YYYY-MM-01
  channel: z.string(),
  impressions: z.number().int().nonnegative(),
  shareAISnippet: z.number().min(0).max(1),
  ctrBaseline: z.number().min(0).max(1),
  ctrDropWhenAI: z.number().min(0).max(1),
  leadCR: z.number().min(0).max(1),
  closeRate: z.number().min(0).max(1),
  avgGross: z.number().nonnegative(),
  recoverableShare: z.number().min(0).max(1),
  intentCluster: z.string().optional()
});

export async function POST(req: Request) {
  const { userId } = await getAuth(req as any);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  
  const body = await req.json();
  const parsed = EventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const e = parsed.data;
  const month = new Date(e.month);

  await prisma.raREvent.create({ data: { ...e, month } });
  await rarQueue.add('computeMonthly', { dealerId: e.dealerId, month: e.month }, { jobId: `${e.dealerId}:${e.month}` });

  return NextResponse.json({ ok: true });
}
