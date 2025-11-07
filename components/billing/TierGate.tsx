"use client";

/**
 * TierGate Component
 * 
 * Gates features based on billing plan using the new Stripe billing system.
 * Automatically fetches plan from Supabase and shows upgrade prompts.
 * 
 * Usage:
 * ```tsx
 * <TierGate tenantId={tenantId} requiredPlan="pro">
 *   <ProFeature />
 * </TierGate>
 * ```
 */

import React, { useEffect, useState } from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Plan = "free" | "pro" | "enterprise";

interface TierGateProps {
  tenantId: string;
  requiredPlan: Plan;
  children: React.ReactNode;
  featureName?: string;
  description?: string;
  showUpgrade?: boolean;
  className?: string;
}

const PLAN_HIERARCHY: Record<Plan, number> = {
  free: 0,
  pro: 1,
  enterprise: 2,
};

const PLAN_DISPLAY: Record<Plan, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

export function TierGate({
  tenantId,
  requiredPlan,
  children,
  featureName,
  description,
  showUpgrade = true,
  className = "",
}: TierGateProps) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPlan() {
      try {
        const response = await fetch(`/api/billing/plan?tenantId=${encodeURIComponent(tenantId)}`);
        if (response.ok) {
          const data = await response.json();
          setPlan(data.plan || "free");
        } else {
          setPlan("free");
        }
      } catch (error) {
        console.error("Failed to fetch plan:", error);
        setPlan("free");
      } finally {
        setLoading(false);
      }
    }

    if (tenantId) {
      fetchPlan();
    } else {
      setPlan("free");
      setLoading(false);
    }
  }, [tenantId]);

  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg h-32 ${className}`} />
    );
  }

  const currentLevel = PLAN_HIERARCHY[plan || "free"];
  const requiredLevel = PLAN_HIERARCHY[requiredPlan];
  const hasAccess = currentLevel >= requiredLevel;

  if (hasAccess) {
    return <div className={className}>{children}</div>;
  }

  const handleUpgrade = async () => {
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: requiredPlan }),
      });

      if (response.ok) {
        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } else {
        console.error("Failed to create checkout session");
        router.push(`/drive?upgrade=${requiredPlan}`);
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      router.push(`/drive?upgrade=${requiredPlan}`);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className="blur-sm pointer-events-none select-none opacity-50">
        {children}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full inline-block">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {featureName || `${PLAN_DISPLAY[requiredPlan]} Feature`}
          </h3>

          <p className="text-sm text-gray-600 mb-4 max-w-sm">
            {description ||
              `This feature requires ${PLAN_DISPLAY[requiredPlan]} tier access.`}
            {plan === "free" && " Upgrade to unlock advanced features."}
            {plan === "pro" && requiredPlan === "enterprise" &&
              " Upgrade to Enterprise for premium features."}
          </p>

          {showUpgrade && (
            <button
              onClick={handleUpgrade}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upgrade to {PLAN_DISPLAY[requiredPlan]}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Server-side TierGate (for API routes and server components)
 * 
 * Usage in API route:
 * ```tsx
 * const plan = await getPlan(tenantId);
 * const canAccess = gate(plan, 'pro', true, false);
 * if (!canAccess) {
 *   return NextResponse.json({ error: 'Pro plan required' }, { status: 403 });
 * }
 * ```
 */

