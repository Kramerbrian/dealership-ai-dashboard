import { prisma } from '@/lib/prisma'

export async function refreshAiZeroClickMV() {
  await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY ai_zero_click_impact_mv;`)
}