"use client";

/**
 * Example: How to use TierGate in your components
 * 
 * This demonstrates real-world usage patterns for gating features
 * based on billing plans.
 */

import { TierGate } from './TierGate';
import { useState } from 'react';

interface ExampleProps {
  tenantId: string;
}

export function TierGateExample({ tenantId }: ExampleProps) {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold text-gray-900">Feature Examples</h2>

      {/* Example 1: Basic Pro Feature */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Advanced Analytics (Pro)</h3>
        <TierGate
          tenantId={tenantId}
          requiredPlan="pro"
          featureName="Advanced Analytics"
          description="Get detailed insights, competitor analysis, and trend forecasting"
        >
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              This is the Advanced Analytics dashboard. Only Pro users can see this content.
            </p>
            <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
              Run Analysis
            </button>
          </div>
        </TierGate>
      </div>

      {/* Example 2: Enterprise Feature */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">AI Autopilot (Enterprise)</h3>
        <TierGate
          tenantId={tenantId}
          requiredPlan="enterprise"
          featureName="AI Autopilot"
          description="Automated fixes, optimizations, and continuous monitoring"
        >
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-700">
              This is the AI Autopilot feature. Only Enterprise users can access this.
            </p>
            <button className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-lg">
              Enable Autopilot
            </button>
          </div>
        </TierGate>
      </div>

      {/* Example 3: Always Visible (Free) */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Basic Dashboard (Free)</h3>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">
            This basic dashboard is available to all users, including free tier.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Server Component Example (for API routes)
 * 
 * ```tsx
 * import { getPlan, gate } from '@/lib/billing/plan';
 * import { requireTenant } from '@/lib/auth/tenant';
 * 
 * export async function GET(req: Request) {
 *   const { tenantId } = requireTenant();
 *   const plan = await getPlan(tenantId);
 * 
 *   // Gate feature access
 *   if (!gate(plan, 'pro', true, false)) {
 *     return NextResponse.json(
 *       { error: 'Pro plan required' },
 *       { status: 403 }
 *     );
 *   }
 * 
 *   // Return pro feature data
 *   return NextResponse.json({ data: 'pro feature data' });
 * }
 * ```
 */

