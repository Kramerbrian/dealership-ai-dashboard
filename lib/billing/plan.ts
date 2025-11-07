import { getIntegration } from "@/lib/integrations/store";

export async function getPlan(tenantId: string): Promise<"free"|"pro"|"enterprise"> {
  const integ = await getIntegration(tenantId, "billing");
  return (integ?.metadata?.plan as "pro"|"enterprise") || "free";
}

export function gate<T>(plan: "free"|"pro"|"enterprise", requirement: "free"|"pro"|"enterprise", value: T, fallback: T): T {
  const hierarchy = { free: 0, pro: 1, enterprise: 2 };
  return hierarchy[plan] >= hierarchy[requirement] ? value : fallback;
}

