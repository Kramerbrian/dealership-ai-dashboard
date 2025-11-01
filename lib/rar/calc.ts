import { prisma } from '@/lib/prisma';
import { updateAIScores } from '@/lib/rar/scoreSync';

const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export async function computeMonthlyRaR({ dealerId, month }: { dealerId: string; month: string }) {
  const m = new Date(month);
  const events = await prisma.raREvent.findMany({
    where: { dealerId, month: m }
  });

  if (!events.length) {
    return { ok: true, message: 'no events' };
  }

  let lostSessions = 0;
  let lostLeads = 0;
  let lostSales = 0;
  let rar = 0;
  let recoverable = 0;
  const intentAgg: Record<string, number> = {};

  for (const e of events) {
    // Sessions with AI present
    const sessAI = e.impressions * e.shareAISnippet * e.ctrBaseline;
    // Zero-click lost sessions
    const zcs = sessAI * e.ctrDropWhenAI;
    const lostLeadsCh = zcs * e.leadCR;
    const lostSalesCh = lostLeadsCh * e.closeRate;
    const rarCh = lostSalesCh * e.avgGross;
    const recCh = rarCh * e.recoverableShare;

    lostSessions += zcs;
    lostLeads += lostLeadsCh;
    lostSales += lostSalesCh;
    rar += rarCh;
    recoverable += recCh;

    if (e.intentCluster) {
      intentAgg[e.intentCluster] = (intentAgg[e.intentCluster] || 0) + rarCh;
    }
  }

  const topLosingIntents = Object.entries(intentAgg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => ({ intent: k, rar: round(v) }));

  // Find existing record first (Prisma doesn't support compound unique in upsert where)
  const existing = await prisma.raRMonthly.findFirst({
    where: {
      dealerId,
      month: m,
    }
  });

  const row = existing
    ? await prisma.raRMonthly.update({
        where: { id: existing.id },
        data: {
          lostSessions: Math.round(lostSessions),
          lostLeads: Math.round(lostLeads),
          lostSales: round(lostSales),
          rar: round(rar),
          recoverable: round(recoverable),
          topLosingIntents,
          computedAt: new Date(),
        }
      })
    : await prisma.raRMonthly.create({
        data: {
          dealerId,
          month: m,
          lostSessions: Math.round(lostSessions),
          lostLeads: Math.round(lostLeads),
          lostSales: round(lostSales),
          rar: round(rar),
          recoverable: round(recoverable),
          topLosingIntents,
          computedAt: new Date(),
        }
      });

  await updateAIScores({ dealerId, rar: row.rar, recoverable: row.recoverable });
  
  return { ok: true, row };
}

