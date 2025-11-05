import type { SCSInput, SCSScore } from "@/types/metrics";

export function computeSCS(input: SCSInput, errorsDetected = 0, authorityWeight = 1): SCSScore {
  const base = (input.parsedFields / Math.max(1, input.expectedFields)) * input.validationHealth * input.sourceTrust;
  const penalty = Math.max(0, 1 - Math.min(errorsDetected * 0.02, 0.3));
  const scsPct = Math.max(0, Math.min(100, Math.round(base * penalty * 100)));
  return { scsPct, errorsDetected, authorityWeight };
}


