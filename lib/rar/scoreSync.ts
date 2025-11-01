import { prisma } from '@/lib/prisma';
import { postToSlack } from '@/lib/slack';

/**
 * Hook RaR into AIV/ATI/QAI weighting:
 * Penalize trust/visibility when RaR is high, reward when decreasing.
 */
export async function updateAIScores({
  dealerId,
  rar,
  recoverable,
}: {
  dealerId: string;
  rar: number;
  recoverable: number;
}) {
  // Scale factor 0..1 over $0..$100k
  const cap = 100000;
  const pressure = Math.min(rar / cap, 1);

  // Store rar_pressure in secondaryMetrics
  const existing = await prisma.secondaryMetrics.findUnique({
    where: {
      dealerId_key: {
        dealerId,
        key: 'rar_pressure',
      }
    } as any,
  });

  if (existing) {
    await prisma.secondaryMetrics.update({
      where: { id: existing.id },
      data: {
        valueNum: pressure,
        updatedAt: new Date(),
      }
    });
  } else {
    await prisma.secondaryMetrics.create({
      data: {
        dealerId,
        key: 'rar_pressure',
        valueNum: pressure,
      }
    });
  }

  // Slack alert for awareness
  if (rar > 0) {
    await postToSlack(
      `⚠️ RaR update for ${dealerId}: $${Math.round(rar).toLocaleString()} at risk; recoverable ~ $${Math.round(recoverable).toLocaleString()}.`
    );
  }
}

