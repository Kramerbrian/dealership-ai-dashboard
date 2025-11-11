export type PiqrInputs = {
  complianceFails: number              // hard fails count
  warningMultipliers: number[]         // existing M_warning list
  schemaLatencyMin?: number            // minutes between DMS/VDP change → JSON-LD update
  schemaLatencyBudgetMin?: number      // policy budget, default 60
  dupHashCollisionRate?: number        // 0..1 identical text/img across VDPs
}

export function calculatePIQR({
  complianceFails,
  warningMultipliers,
  schemaLatencyMin = 0,
  schemaLatencyBudgetMin = 60,
  dupHashCollisionRate = 0,
}: PiqrInputs) {
  const base = (1 + complianceFails * 0.25) * warningMultipliers.reduce((a, b) => a * b, 1)

  // Schema Latency Score (SLS): ratio > 1 => penalties
  const ratio = schemaLatencyBudgetMin > 0 ? schemaLatencyMin / schemaLatencyBudgetMin : 0
  const sls = ratio <= 1 ? 1 : Math.min(2.0, 1 + 0.25 * (ratio - 1)) // +25% per budget overage, capped 2.0

  // Duplicate Detector (DD): penalize repeated text/media (0..1)
  const dd = dupHashCollisionRate <= 0 ? 1 : Math.min(1.5, 1 + 0.5 * dupHashCollisionRate) // up to +50%

  return base * sls * dd
}
