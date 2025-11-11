/**
 * Schema Validation Service
 * Persist schema validation snapshots and emit delta metrics
 */

import { prisma } from '@/lib/prisma';

/** Save a schema validation snapshot and emit delta metrics */
export async function saveSchemaValidation(input: {
  dealerId: string;
  page?: string;
  richResults: boolean;
  gpt4Score: number;
  geminiScore?: number;
  claudeScore?: number;
  deltaAIV: number;
  deltaATI: number;
}) {
  const row = await prisma.schemaValidation.create({
    data: {
      dealerId: input.dealerId,
      page: input.page ?? null,
      richResults: input.richResults,
      gpt4Score: input.gpt4Score,
      geminiScore: input.geminiScore ?? null,
      claudeScore: input.claudeScore ?? null,
      deltaAIV: input.deltaAIV,
      deltaATI: input.deltaATI,
    },
  });

  // Emit deltas as agentic metrics for dashboard
  await prisma.agenticMetric.createMany({
    data: [
      { dealerId: input.dealerId, metric: 'delta_aiv', value: input.deltaAIV },
      { dealerId: input.dealerId, metric: 'delta_ati', value: input.deltaATI },
    ],
  });

  return row;
}

export async function getLastSchemaValidation(dealerId: string) {
  const row = await prisma.schemaValidation.findFirst({
    where: { dealerId },
    orderBy: { updatedAt: 'desc' },
  });
  
  if (!row) return null;
  
  return {
    dealerId,
    page: row.page ?? undefined,
    rich_results: row.richResults,
    gpt4_parse_score: row.gpt4Score,
    deltas: { AIV: row.deltaAIV, ATI: row.deltaATI },
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Write an arbitrary agentic metric point */
export async function emitAgenticMetric(
  dealerId: string,
  metric: string,
  value: number,
  ts?: Date
) {
  return prisma.agenticMetric.create({
    data: { dealerId, metric, value, ts: ts ?? new Date() },
  });
}
