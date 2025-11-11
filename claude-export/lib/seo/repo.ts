import { prisma } from '@/lib/prisma'

export async function updatePosteriorFromBatch(tenantId: string, batch: Array<{ variantId: string; clicks?: number; impressions?: number }>) {
  const grouped = new Map<string, { imp: number; clk: number }>()
  for (const r of batch) {
    const g = grouped.get(r.variantId) || { imp: 0, clk: 0 }
    g.imp += r.impressions ?? 0
    g.clk += r.clicks ?? 0
    grouped.set(r.variantId, g)
  }
  const ops = Array.from(grouped.entries()).map(([variantId, g]) =>
    prisma.seoVariantPrior.upsert({
      where: { tenantId_variantId: { tenantId, variantId } },
      update: { a: { increment: g.clk }, b: { increment: Math.max(0, g.imp - g.clk) } },
      create: { tenantId, variantId, a: 1 + g.clk, b: 1 + Math.max(0, g.imp - g.clk) },
    })
  )
  await prisma.$transaction(ops)
}
