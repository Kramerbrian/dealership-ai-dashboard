// Allocation Safety
// DealershipAI - Traffic allocation safety and data quality guards

export interface AllocationConfig {
  minTrafficPerArm: number;     // Minimum daily traffic per arm
  maxTrafficPerArm: number;     // Maximum daily traffic per arm
  dataQualityThreshold: number; // Hours before data quality alert
  freezeOnDataQuality: boolean; // Whether to freeze on data quality issues
  maxAllocationSkew: number;    // Maximum allowed allocation skew (0.1 = 10%)
}

export interface AllocationStatus {
  isHealthy: boolean;
  canAllocate: boolean;
  warnings: string[];
  errors: string[];
  lastDataUpdate: Date;
  dataQualityScore: number;
  allocationSkew: number;
}

export interface TrafficAllocation {
  variantId: string;
  allocation: number; // 0.0 to 1.0
  minTraffic: number;
  maxTraffic: number;
  currentTraffic: number;
  isFrozen: boolean;
}

/**
 * Check allocation safety for a tenant
 */
export async function checkAllocationSafety(
  tenantId: string,
  config: AllocationConfig,
  currentAllocations: TrafficAllocation[]
): Promise<AllocationStatus> {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check data quality
  const dataQuality = await checkDataQuality(tenantId);
  const dataQualityScore = dataQuality.score;
  const lastDataUpdate = dataQuality.lastUpdate;
  
  if (dataQualityScore < 0.8) {
    warnings.push(`Data quality score is low: ${(dataQualityScore * 100).toFixed(1)}%`);
  }
  
  if (dataQuality.hoursSinceUpdate > config.dataQualityThreshold) {
    errors.push(`Data quality issue: Last update was ${dataQuality.hoursSinceUpdate} hours ago`);
  }
  
  // Check allocation skew
  const allocationSkew = calculateAllocationSkew(currentAllocations);
  if (allocationSkew > config.maxAllocationSkew) {
    warnings.push(`Allocation skew is high: ${(allocationSkew * 100).toFixed(1)}%`);
  }
  
  // Check minimum traffic per arm
  const lowTrafficArms = currentAllocations.filter(
    alloc => alloc.currentTraffic < config.minTrafficPerArm
  );
  
  if (lowTrafficArms.length > 0) {
    warnings.push(`${lowTrafficArms.length} arms have traffic below minimum threshold`);
  }
  
  // Check maximum traffic per arm
  const highTrafficArms = currentAllocations.filter(
    alloc => alloc.currentTraffic > config.maxTrafficPerArm
  );
  
  if (highTrafficArms.length > 0) {
    warnings.push(`${highTrafficArms.length} arms have traffic above maximum threshold`);
  }
  
  // Determine if allocation is healthy
  const isHealthy = errors.length === 0 && warnings.length <= 2;
  const canAllocate = isHealthy && (!config.freezeOnDataQuality || dataQualityScore >= 0.8);
  
  return {
    isHealthy,
    canAllocate,
    warnings,
    errors,
    lastDataUpdate,
    dataQualityScore,
    allocationSkew
  };
}

/**
 * Check data quality metrics
 */
async function checkDataQuality(tenantId: string): Promise<{
  score: number;
  lastUpdate: Date;
  hoursSinceUpdate: number;
}> {
  // In production, this would check actual data sources
  // For now, return mock data
  const lastUpdate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
  const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60);
  
  // Calculate quality score based on recency and completeness
  let score = 1.0;
  
  if (hoursSinceUpdate > 24) {
    score -= 0.5; // Heavy penalty for stale data
  } else if (hoursSinceUpdate > 12) {
    score -= 0.2; // Moderate penalty
  } else if (hoursSinceUpdate > 6) {
    score -= 0.1; // Light penalty
  }
  
  return {
    score: Math.max(0, score),
    lastUpdate,
    hoursSinceUpdate
  };
}

/**
 * Calculate allocation skew
 */
function calculateAllocationSkew(allocations: TrafficAllocation[]): number {
  if (allocations.length === 0) return 0;
  
  const totalAllocation = allocations.reduce((sum, alloc) => sum + alloc.allocation, 0);
  const expectedAllocation = 1.0;
  const skew = Math.abs(totalAllocation - expectedAllocation);
  
  return skew;
}

/**
 * Validate traffic allocation
 */
export function validateAllocation(
  allocations: TrafficAllocation[],
  config: AllocationConfig
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check total allocation
  const totalAllocation = allocations.reduce((sum, alloc) => sum + alloc.allocation, 0);
  if (Math.abs(totalAllocation - 1.0) > 0.01) {
    errors.push(`Total allocation must equal 1.0, got ${totalAllocation.toFixed(3)}`);
  }
  
  // Check individual allocations
  for (const alloc of allocations) {
    if (alloc.allocation < 0 || alloc.allocation > 1) {
      errors.push(`Allocation for ${alloc.variantId} must be between 0 and 1, got ${alloc.allocation}`);
    }
    
    if (alloc.currentTraffic < config.minTrafficPerArm) {
      errors.push(`Traffic for ${alloc.variantId} is below minimum threshold`);
    }
    
    if (alloc.currentTraffic > config.maxTrafficPerArm) {
      errors.push(`Traffic for ${alloc.variantId} is above maximum threshold`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Create safe allocation with minimum traffic guarantees
 */
export function createSafeAllocation(
  variantIds: string[],
  config: AllocationConfig,
  currentTraffic: Record<string, number>
): TrafficAllocation[] {
  const allocations: TrafficAllocation[] = [];
  
  // Calculate base allocation
  const baseAllocation = 1.0 / variantIds.length;
  
  for (const variantId of variantIds) {
    const currentTrafficCount = currentTraffic[variantId] || 0;
    
    // Adjust allocation based on current traffic
    let allocation = baseAllocation;
    
    if (currentTrafficCount < config.minTrafficPerArm) {
      // Boost allocation for low-traffic arms
      allocation = Math.min(0.6, baseAllocation * 1.5);
    } else if (currentTrafficCount > config.maxTrafficPerArm) {
      // Reduce allocation for high-traffic arms
      allocation = Math.max(0.1, baseAllocation * 0.5);
    }
    
    allocations.push({
      variantId,
      allocation,
      minTraffic: config.minTrafficPerArm,
      maxTraffic: config.maxTrafficPerArm,
      currentTraffic: currentTrafficCount,
      isFrozen: currentTrafficCount < config.minTrafficPerArm
    });
  }
  
  // Normalize allocations to sum to 1.0
  const totalAllocation = allocations.reduce((sum, alloc) => sum + alloc.allocation, 0);
  for (const alloc of allocations) {
    alloc.allocation = alloc.allocation / totalAllocation;
  }
  
  return allocations;
}

/**
 * Default allocation configuration
 */
export function getDefaultAllocationConfig(): AllocationConfig {
  return {
    minTrafficPerArm: 100,
    maxTrafficPerArm: 10000,
    dataQualityThreshold: 24,
    freezeOnDataQuality: true,
    maxAllocationSkew: 0.1
  };
}
