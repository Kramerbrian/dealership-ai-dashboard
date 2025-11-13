import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const TENANT = process.env.SEED_TENANT_ID || '00000000-0000-0000-0000-000000000000'

async function main() {
  await prisma.seoVariantPrior.upsert({
    where: { tenantId_variantId: { tenantId: TENANT, variantId: 'v1' } },
    update: { a: 12, b: 8 },
    create: { tenantId: TENANT, variantId: 'v1', a: 12, b: 8 },
  })
  console.log('Seed complete')
}

main().finally(() => prisma.$disconnect())