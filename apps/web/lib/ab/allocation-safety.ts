/**
 * A/B Testing Allocation Safety Module
 * Ensures safe traffic allocation and prevents over-allocation
 */

export interface AllocationSafetyConfig {
  maxTrafficAllocation: number // Maximum percentage of traffic to allocate
  minSampleSize: number // Minimum sample size per variant
  maxVariants: number // Maximum number of variants allowed
  safetyBuffer: number // Safety buffer percentage
}

export interface AllocationRequest {
  variants: string[]
  trafficBudget: number
  currentAllocations?: Record<string, number>
}

export interface AllocationSafetyResult {
  safe: boolean
  warnings: string[]
  recommendations: string[]
  maxSafeAllocation: number
  suggestedAllocations: Record<string, number>
}

export const DEFAULT_ALLOCATION_CONFIG: AllocationSafetyConfig = {
  maxTrafficAllocation: 95, // 95% max allocation
  minSampleSize: 100, // 100 minimum samples
  maxVariants: 10, // 10 variants max
  safetyBuffer: 5 // 5% safety buffer
}

/**
 * Check allocation safety
 */
export function checkAllocationSafety(
  request: AllocationRequest,
  config: AllocationSafetyConfig = DEFAULT_ALLOCATION_CONFIG
): AllocationSafetyResult {
  const warnings: string[] = []
  const recommendations: string[] = []
  
  // Check variant count
  if (request.variants.length > config.maxVariants) {
    warnings.push(`Too many variants: ${request.variants.length} > ${config.maxVariants}`)
    recommendations.push('Reduce number of variants or increase max variants limit')
  }
  
  // Check traffic budget
  if (request.trafficBudget > config.maxTrafficAllocation) {
    warnings.push(`Traffic budget too high: ${request.trafficBudget}% > ${config.maxTrafficAllocation}%`)
    recommendations.push('Reduce traffic budget to stay within safety limits')
  }
  
  // Calculate safe allocation
  const maxSafeAllocation = Math.min(
    config.maxTrafficAllocation - config.safetyBuffer,
    request.trafficBudget
  )
  
  // Calculate suggested allocations
  const suggestedAllocations: Record<string, number> = {}
  const allocationPerVariant = maxSafeAllocation / request.variants.length
  
  for (const variant of request.variants) {
    suggestedAllocations[variant] = Math.round(allocationPerVariant * 100) / 100
  }
  
  // Check minimum sample size
  const totalSamples = (request.trafficBudget / 100) * 10000 // Assuming 10k daily traffic
  const samplesPerVariant = totalSamples / request.variants.length
  
  if (samplesPerVariant < config.minSampleSize) {
    warnings.push(`Insufficient sample size: ${Math.round(samplesPerVariant)} < ${config.minSampleSize}`)
    recommendations.push('Increase traffic budget or reduce number of variants')
  }
  
  // Check current allocations if provided
  if (request.currentAllocations) {
    const currentTotal = Object.values(request.currentAllocations).reduce((sum, val) => sum + val, 0)
    if (currentTotal + request.trafficBudget > config.maxTrafficAllocation) {
      warnings.push(`Total allocation would exceed limit: ${currentTotal + request.trafficBudget}% > ${config.maxTrafficAllocation}%`)
      recommendations.push('Reduce traffic budget or reallocate existing traffic')
    }
  }
  
  const safe = warnings.length === 0
  
  return {
    safe,
    warnings,
    recommendations,
    maxSafeAllocation,
    suggestedAllocations
  }
}

/**
 * Validate allocation request
 */
export function validateAllocationRequest(request: AllocationRequest): string[] {
  const errors: string[] = []
  
  if (!request.variants || request.variants.length === 0) {
    errors.push('At least one variant is required')
  }
  
  if (request.trafficBudget <= 0 || request.trafficBudget > 100) {
    errors.push('Traffic budget must be between 0 and 100')
  }
  
  if (request.variants && request.variants.length > 1) {
    const uniqueVariants = new Set(request.variants)
    if (uniqueVariants.size !== request.variants.length) {
      errors.push('Duplicate variants are not allowed')
    }
  }
  
  return errors
}

/**
 * Calculate statistical power for allocation
 */
export function calculateStatisticalPower(
  variantCount: number,
  trafficAllocation: number,
  expectedEffectSize: number = 0.1
): number {
  // Simplified power calculation
  const sampleSize = (trafficAllocation / 100) * 10000 / variantCount
  const power = Math.min(0.95, Math.max(0.5, sampleSize / 1000 * expectedEffectSize * 10))
  
  return Math.round(power * 100) / 100
}

/**
 * Check data quality for allocation
 */
export function checkDataQuality(data: any[]): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  
  if (!Array.isArray(data)) {
    issues.push('Data must be an array')
  }
  
  if (data.length === 0) {
    issues.push('Data array is empty')
  }
  
  // Check for required fields
  const requiredFields = ['variantId', 'trafficAllocation']
  data.forEach((item, index) => {
    requiredFields.forEach(field => {
      if (!(field in item)) {
        issues.push(`Item ${index} missing required field: ${field}`)
      }
    })
  })
  
  return {
    valid: issues.length === 0,
    issues
  }
}

/**
 * Check emergency stop conditions
 */
export function checkEmergencyStop(
  currentAllocations: Record<string, number>,
  threshold: number = 0.95
): { shouldStop: boolean; reason?: string } {
  const totalAllocation = Object.values(currentAllocations).reduce((sum, val) => sum + val, 0)
  
  if (totalAllocation > threshold * 100) {
    return {
      shouldStop: true,
      reason: `Total allocation ${totalAllocation}% exceeds threshold ${threshold * 100}%`
    }
  }
  
  return { shouldStop: false }
}

/**
 * Generate allocation safety report
 */
export function generateAllocationSafetyReport(
  request: AllocationRequest,
  config: AllocationSafetyConfig = DEFAULT_ALLOCATION_CONFIG
): any {
  const safetyCheck = checkAllocationSafety(request, config)
  const dataQuality = checkDataQuality(request.variants.map(v => ({ variantId: v })))
  const emergencyStop = checkEmergencyStop(request.currentAllocations || {})
  
  return {
    timestamp: new Date().toISOString(),
    request,
    config,
    safetyCheck,
    dataQuality,
    emergencyStop,
    recommendations: [
      ...safetyCheck.recommendations,
      ...dataQuality.issues,
      ...(emergencyStop.shouldStop ? [emergencyStop.reason] : [])
    ]
  }
}

/**
 * Calculate optimal allocation
 */
export function calculateOptimalAllocation(
  variants: string[],
  trafficBudget: number,
  weights?: Record<string, number>
): Record<string, number> {
  const allocation: Record<string, number> = {}
  
  if (weights) {
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)
    variants.forEach(variant => {
      allocation[variant] = (weights[variant] || 1) / totalWeight * trafficBudget
    })
  } else {
    const equalAllocation = trafficBudget / variants.length
    variants.forEach(variant => {
      allocation[variant] = equalAllocation
    })
  }
  
  return allocation
}

export const DEFAULT_CONFIG = {
  minTrafficPerArmPerDay: 100,
  maxTrafficPerArmPerDay: 10000,
  minDataQualityScore: 0.8,
  maxStalenessHours: 24,
  emergencyStopThreshold: 0.1
}