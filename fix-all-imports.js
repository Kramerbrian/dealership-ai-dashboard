const fs = require('fs');
const path = require('path');

// List of all API files that need fixing
const filesToFix = [
  'app/api/chat/route.ts',
  'app/api/competitors/intelligence/route.ts',
  'app/api/dashboard/ai-health/route.ts',
  'app/api/dashboard/overview-live/route.ts',
  'app/api/dashboard/overview/route.ts',
  'app/api/dashboard/reviews/route.ts',
  'app/api/dashboard/schema/route.ts',
  'app/api/dashboard/website/route.ts',
  'app/api/geo/domain-location/route.ts',
  'app/api/geo/market-analysis/route.ts',
  'app/api/leads/capture/route.ts',
  'app/api/leads/route.ts',
  'app/api/observability/route.ts',
  'app/api/onboarding/analyze/route.ts',
  'app/api/performance-test/route.ts',
  'app/api/performance/monitor/route.ts',
  'app/api/settings/audit/route.ts',
  'app/api/settings/dealer/route.ts',
  'app/api/stripe/create-checkout/route.ts',
  'app/api/stripe/verify-session/route.ts',
  'app/api/visibility/aeo/route.ts',
  'app/api/visibility/geo/route.ts',
  'app/api/visibility/seo/route.ts',
  'app/api/websocket/route.ts',
  'app/api/growth/viral-reports/route.ts',
  'app/api/test/route.ts',
  'app/api/qai/simple/route.ts',
  'app/api/qai/calculate/route.ts',
  'app/api/eeat/route.ts',
  'app/api/mystery-shop/route.ts',
  'app/api/growth/analytics/route.ts',
  'app/api/ai/trust-optimization/route.ts',
  'app/api/ai/visibility-index/route.ts',
  'app/api/analytics/ga4/route.ts',
  'app/api/analyze/route.ts',
  'app/api/stripe/checkout/route.ts',
  'app/api/stripe/portal/route.ts',
  'app/api/competitive/route.ts',
  'app/api/automation/fix/route.ts',
  'app/api/partners/route.ts',
  'app/api/recommendations/route.ts',
  'app/api/stripe/webhook/route.ts',
  'app/api/calculator/ai-scores/route.ts',
  'app/api/alerts/prioritization/route.ts',
  'app/api/console/query/route.ts',
  'app/api/targeting/underperforming-dealers/route.ts',
  'app/api/integrations/google/route.ts',
  'app/api/integrations/ai-platforms/route.ts',
  'app/api/integrations/reviews/route.ts',
  'app/api/performance/cache/route.ts',
  'app/api/security/rate-limit/route.ts',
  'app/api/monitoring/metrics/route.ts',
  'app/api/viral/audit-complete/route.ts',
  'app/api/viral/metrics/route.ts',
  'app/api/dealerships/[id]/quick-wins/route.ts',
  'app/api/dealerships/[id]/competitors/route.ts',
  'app/api/dealerships/[id]/qai/route.ts',
  'app/api/schema-validation/route.ts',
  'app/api/enhanced-dai/route.ts',
  'app/api/quick-audit/route.ts',
  'app/api/optimizer/top-opportunity/route.ts',
  'app/api/onboarding/progress/route.ts',
  'app/api/health/route.ts',
  'app/api/dealership/profile/route.ts'
];

console.log('🔧 Fixing all NextRequest imports...');

filesToFix.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove NextRequest from imports if it's not used
    if (!content.includes('NextRequest')) {
      content = content.replace(/import { NextRequest, NextResponse } from 'next\/server';/g, "import { NextResponse } from 'next/server';");
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${filePath}`);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('🎉 All NextRequest imports fixed!');
