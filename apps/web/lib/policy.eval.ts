/**
 * Policy Evaluation Engine
 * DealershipAI - Policy-as-Data Implementation
 * 
 * This module provides policy evaluation functions for compliance,
 * risk management, and automated decision-making with preview capabilities.
 */

export interface Policy {
  offerIntegrity: {
    priceDelta: {
      sev1: number
      sev2: number
      sev3: number
    }
    undisclosedFeeCodes?: string[]
    strikethroughThreshold?: number
  }
  gate: {
    blockOn: string[]
    autoQuarantine?: boolean
    sev3Threshold?: number
  }
  staleness?: {
    ttl: number
    autoDecay: boolean
    archiveAfter: number
  }
}

export interface PolicyEvaluationResult {
  severity: number
  rule: string
  action: 'allow' | 'warn' | 'block' | 'quarantine'
  message: string
  metadata: Record<string, any>
}

export interface PolicyPreviewResult {
  wouldBlock: number
  wouldUnblock: number
  severityBreakdown: {
    s1: number
    s2: number
    s3: number
  }
  ociForecast_usd: number
  elasticity_usd_per_point: number
  sample: Array<{
    id: string
    vin?: string
    rule: string
    severity: number
    sevCalc: number
    block: boolean
    delta_price?: number
    undisclosed_count?: number
  }>
}

/**
 * Calculate price delta severity based on policy
 */
export function priceDeltaSeverity(delta: number, policy: Policy): number {
  const { sev1, sev2, sev3 } = policy.offerIntegrity.priceDelta
  const absDelta = Math.abs(delta)
  
  if (absDelta >= sev3) return 3
  if (absDelta >= sev2) return 2
  if (absDelta >= sev1) return 1
  return 0
}

/**
 * Calculate undisclosed fees severity
 */
export function undisclosedFeesSeverity(
  undisclosedCount: number, 
  policy: Policy
): number {
  const maxAllowed = policy.offerIntegrity.undisclosedFeeCodes?.length || 3
  
  if (undisclosedCount > maxAllowed) return 3
  if (undisclosedCount > 0) return 2
  return 0
}

/**
 * Calculate strikethrough abuse severity
 */
export function strikethroughAbuseSeverity(
  ratio: number, 
  policy: Policy
): number {
  const threshold = policy.offerIntegrity.strikethroughThreshold || 0.2
  
  if (ratio >= threshold) return 3
  if (ratio >= threshold * 0.5) return 2
  if (ratio > 0) return 1
  return 0
}

/**
 * Determine if a rule should be blocked based on policy
 */
export function shouldBlock(
  rule: string, 
  severity: number, 
  policy: Policy
): boolean {
  const blockTokens = new Set(policy.gate.blockOn)
  
  // Check for specific severity blocking
  if (blockTokens.has(`${rule}.sev${severity}`)) {
    return true
  }
  
  // Check for general rule blocking
  if (blockTokens.has(rule)) {
    return true
  }
  
  // Check for severity-based blocking
  if (severity === 3 && blockTokens.has('sev3')) {
    return true
  }
  
  if (severity >= 2 && blockTokens.has('sev2+')) {
    return true
  }
  
  return false
}

/**
 * Evaluate a single violation against policy
 */
export function evaluateViolation(
  violation: {
    id: string
    rule: string
    severity: number
    delta_price?: number
    undisclosed_count?: number
    strikethrough_ratio?: number
  },
  policy: Policy
): PolicyEvaluationResult {
  let calculatedSeverity = violation.severity
  let message = `Rule ${violation.rule} with severity ${violation.severity}`
  
  // Recalculate severity based on current policy
  switch (violation.rule) {
    case 'PRICE_DELTA':
      if (violation.delta_price !== undefined) {
        calculatedSeverity = priceDeltaSeverity(violation.delta_price, policy)
        message = `Price delta of $${Math.abs(violation.delta_price).toLocaleString()} (severity ${calculatedSeverity})`
      }
      break
      
    case 'UNDISCLOSED_FEE':
      if (violation.undisclosed_count !== undefined) {
        calculatedSeverity = undisclosedFeesSeverity(violation.undisclosed_count, policy)
        message = `${violation.undisclosed_count} undisclosed fees (severity ${calculatedSeverity})`
      }
      break
      
    case 'STRIKETHROUGH_ABUSE':
      if (violation.strikethrough_ratio !== undefined) {
        calculatedSeverity = strikethroughAbuseSeverity(violation.strikethrough_ratio, policy)
        message = `Strikethrough ratio ${(violation.strikethrough_ratio * 100).toFixed(1)}% (severity ${calculatedSeverity})`
      }
      break
  }
  
  const shouldBlockResult = shouldBlock(violation.rule, calculatedSeverity, policy)
  
  let action: 'allow' | 'warn' | 'block' | 'quarantine'
  if (shouldBlockResult) {
    action = calculatedSeverity === 3 ? 'quarantine' : 'block'
  } else if (calculatedSeverity >= 2) {
    action = 'warn'
  } else {
    action = 'allow'
  }
  
  return {
    severity: calculatedSeverity,
    rule: violation.rule,
    action,
    message,
    metadata: {
      originalSeverity: violation.severity,
      calculatedSeverity,
      shouldBlock: shouldBlockResult,
      violation
    }
  }
}

/**
 * Preview policy impact on existing violations
 */
export function previewPolicyImpact(
  violations: Array<{
    id: string
    vin?: string
    rule: string
    severity: number
    delta_price?: number
    undisclosed_count?: number
    strikethrough_ratio?: number
  }>,
  policy: Policy,
  elasticity_usd_per_point: number = 250
): PolicyPreviewResult {
  let wouldBlock = 0
  let wouldUnblock = 0
  const severityBreakdown = { s1: 0, s2: 0, s3: 0 }
  
  const evaluatedViolations = violations.map(violation => {
    const evaluation = evaluateViolation(violation, policy)
    const block = evaluation.action === 'block' || evaluation.action === 'quarantine'
    
    if (block) {
      wouldBlock++
      if (evaluation.severity === 3) severityBreakdown.s3++
      else if (evaluation.severity === 2) severityBreakdown.s2++
      else if (evaluation.severity === 1) severityBreakdown.s1++
    } else {
      wouldUnblock++
    }
    
    return {
      ...violation,
      sevCalc: evaluation.severity,
      block,
      evaluation
    }
  })
  
  // Calculate OCI forecast using same formula as OCI Live view
  // sev3=2pts, sev2=1pt, sev1=0.5pt
  const points = severityBreakdown.s3 * 2 + severityBreakdown.s2 * 1 + severityBreakdown.s1 * 0.5
  const ociForecast_usd = Math.round(points * elasticity_usd_per_point)
  
  return {
    wouldBlock,
    wouldUnblock,
    severityBreakdown,
    ociForecast_usd,
    elasticity_usd_per_point,
    sample: evaluatedViolations.slice(0, 50).map(v => ({
      id: v.id,
      vin: v.vin,
      rule: v.rule,
      severity: v.severity,
      sevCalc: v.sevCalc,
      block: v.block,
      delta_price: v.delta_price,
      undisclosed_count: v.undisclosed_count
    }))
  }
}

/**
 * Validate policy configuration
 */
export function validatePolicy(policy: Policy): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Validate offer integrity settings
  if (!policy.offerIntegrity?.priceDelta) {
    errors.push('offerIntegrity.priceDelta is required')
  } else {
    const { sev1, sev2, sev3 } = policy.offerIntegrity.priceDelta
    if (sev1 >= sev2 || sev2 >= sev3) {
      errors.push('Price delta thresholds must be in ascending order (sev1 < sev2 < sev3)')
    }
    if (sev1 <= 0 || sev2 <= 0 || sev3 <= 0) {
      errors.push('Price delta thresholds must be positive')
    }
  }
  
  // Validate gate settings
  if (!policy.gate?.blockOn || !Array.isArray(policy.gate.blockOn)) {
    errors.push('gate.blockOn must be an array')
  }
  
  // Validate staleness settings if present
  if (policy.staleness) {
    if (policy.staleness.ttl <= 0) {
      errors.push('staleness.ttl must be positive')
    }
    if (policy.staleness.archiveAfter <= 0) {
      errors.push('staleness.archiveAfter must be positive')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Get default policy configuration
 */
export function getDefaultPolicy(): Policy {
  return {
    offerIntegrity: {
      priceDelta: {
        sev1: 100,
        sev2: 250,
        sev3: 500
      },
      undisclosedFeeCodes: ['UNDISCLOSED_FEE'],
      strikethroughThreshold: 0.2
    },
    gate: {
      blockOn: ['PRICE_DELTA.sev3', 'UNDISCLOSED_FEE'],
      autoQuarantine: true,
      sev3Threshold: 5
    },
    staleness: {
      ttl: 24,
      autoDecay: true,
      archiveAfter: 90
    }
  }
}

/**
 * Merge policy configurations
 */
export function mergePolicies(base: Policy, override: Partial<Policy>): Policy {
  return {
    offerIntegrity: {
      ...base.offerIntegrity,
      ...override.offerIntegrity,
      priceDelta: {
        ...base.offerIntegrity.priceDelta,
        ...override.offerIntegrity?.priceDelta
      }
    },
    gate: {
      ...base.gate,
      ...override.gate
    },
    staleness: {
      ...base.staleness,
      ...override.staleness
    }
  }
}
