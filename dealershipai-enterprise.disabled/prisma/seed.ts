import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a superadmin tenant
  const superadminTenant = await prisma.tenant.create({
    data: {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'DealershipAI Platform',
      type: 'ENTERPRISE',
      subscription_tier: 'ENTERPRISE',
      subscription_status: 'ACTIVE',
      mrr: 0,
    },
  })

  // Create a sample dealership tenant
  const sampleDealership = await prisma.tenant.create({
    data: {
      name: 'Terry Reid Hyundai',
      type: 'DEALERSHIP',
      subscription_tier: 'TIER_1',
      subscription_status: 'ACTIVE',
      mrr: 499,
      rooftop_count: 1,
    },
  })

  // Create sample dealership data
  await prisma.dealershipData.create({
    data: {
      tenant_id: sampleDealership.id,
      ai_visibility_score: 72,
      seo_score: 85,
      aeo_score: 78,
      geo_score: 82,
      chatgpt_score: 75,
      google_aio_score: 80,
      perplexity_score: 68,
      gemini_score: 70,
      ugc_health_score: 88,
      schema_audit: {
        active: 12,
        missing: 8,
        errors: []
      },
      cwv_metrics: {
        lcp: 1.8,
        fid: 125,
        cls: 0.08
      },
      website_health: {
        performance: 92,
        seo: 73,
        accessibility: 88,
        bestPractices: 95
      },
      review_data: {
        totalReviews: 128,
        averageRating: 4.6,
        recentReviews: 12
      }
    },
  })

  // Create sample AI query results
  await prisma.aIQueryResult.createMany({
    data: [
      {
        tenant_id: sampleDealership.id,
        prompt_id: 'visibility_basic_top5',
        engine: 'chatgpt',
        query_text: 'Top 5 Hyundai dealerships in Naples, FL',
        response_text: '1. Terry Reid Hyundai 2. Naples Hyundai 3. Germain Hyundai...',
        position: 1,
        cited: true,
        sentiment: 'POSITIVE',
        cost_cents: 5,
        latency_ms: 1200,
      },
      {
        tenant_id: sampleDealership.id,
        prompt_id: 'visibility_basic_top5',
        engine: 'claude',
        query_text: 'Best Hyundai dealerships near Naples, Florida',
        response_text: 'Terry Reid Hyundai is highly recommended...',
        position: 2,
        cited: true,
        sentiment: 'POSITIVE',
        cost_cents: 7,
        latency_ms: 1500,
      },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
