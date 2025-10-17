/**
 * Feature Flags System
 * DealershipAI - Configuration-as-Data
 * 
 * This module provides feature flags and tenant-specific configuration
 * management for controlling feature rollout and behavior.
 */

export interface TenantConfig {
  id: string
  name: string
  plan: 'ignition' | 'momentum' | 'hyperdrive'
  features: FeatureFlags
  policies: PolicyConfig
  limits: TenantLimits
  createdAt: string
  updatedAt: string
}

export interface FeatureFlags {
  zeroClick: boolean
  fixQueue: boolean
  proofPath: boolean
  redGate: boolean
  sseEvents: boolean
  edgeCaching: boolean
  circuitBreakers: boolean
  banditRouting: boolean
  counterfactualSim: boolean
  graphRAG: boolean
  consensusHeatmap: boolean
  roiLedger: boolean
  syntheticCanary: boolean
  auditChain: boolean
  driftMonitoring: boolean
}

export interface PolicyConfig {
  priceDelta: {
    sev1: number
    sev2: number
    sev3: number
  }
  undisclosedFees: {
    enabled: boolean
    maxAllowed: number
  }
  strikethroughAbuse: {
    enabled: boolean
    threshold: number
  }
  redGate: {
    enabled: boolean
    sev3Threshold: number
    autoQuarantine: boolean
  }
  staleness: {
    ttl: number // in hours
    autoDecay: boolean
    archiveAfter: number // in days
  }
}

export interface TenantLimits {
  maxCrawlsPerDay: number
  maxAPICallsPerHour: number
  maxStorageGB: number
  maxConcurrentJobs: number
  maxRetentionDays: number
}

export class FeatureFlagManager {
  private static instance: FeatureFlagManager
  private tenantConfigs: Map<string, TenantConfig> = new Map()

  private constructor() {
    this.initializeDefaultConfigs()
  }

  static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager()
    }
    return FeatureFlagManager.instance
  }

  /**
   * Get feature flags for a tenant
   */
  getFlags(tenantId: string): FeatureFlags {
    const config = this.tenantConfigs.get(tenantId)
    if (!config) {
      return this.getDefaultFlags()
    }
    return config.features
  }

  /**
   * Get policy configuration for a tenant
   */
  getPolicies(tenantId: string): PolicyConfig {
    const config = this.tenantConfigs.get(tenantId)
    if (!config) {
      return this.getDefaultPolicies()
    }
    return config.policies
  }

  /**
   * Get tenant limits
   */
  getLimits(tenantId: string): TenantLimits {
    const config = this.tenantConfigs.get(tenantId)
    if (!config) {
      return this.getDefaultLimits()
    }
    return config.limits
  }

  /**
   * Check if a specific feature is enabled for a tenant
   */
  isEnabled(tenantId: string, feature: keyof FeatureFlags): boolean {
    const flags = this.getFlags(tenantId)
    return flags[feature]
  }

  /**
   * Update tenant configuration
   */
  updateConfig(tenantId: string, updates: Partial<TenantConfig>): void {
    const existing = this.tenantConfigs.get(tenantId)
    const updated: TenantConfig = {
      ...existing,
      ...updates,
      id: tenantId,
      updatedAt: new Date().toISOString()
    } as TenantConfig

    this.tenantConfigs.set(tenantId, updated)
  }

  /**
   * Get all tenant configurations
   */
  getAllConfigs(): TenantConfig[] {
    return Array.from(this.tenantConfigs.values())
  }

  /**
   * Initialize default configurations for different plans
   */
  private initializeDefaultConfigs(): void {
    // Ignition Plan (Basic)
    this.tenantConfigs.set('ignition-demo', {
      id: 'ignition-demo',
      name: 'Ignition Demo',
      plan: 'ignition',
      features: {
        zeroClick: false,
        fixQueue: false,
        proofPath: false,
        redGate: false,
        sseEvents: true,
        edgeCaching: true,
        circuitBreakers: false,
        banditRouting: false,
        counterfactualSim: false,
        graphRAG: false,
        consensusHeatmap: false,
        roiLedger: false,
        syntheticCanary: false,
        auditChain: true,
        driftMonitoring: false
      },
      policies: this.getDefaultPolicies(),
      limits: {
        maxCrawlsPerDay: 100,
        maxAPICallsPerHour: 1000,
        maxStorageGB: 1,
        maxConcurrentJobs: 2,
        maxRetentionDays: 30
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Momentum Plan (Professional)
    this.tenantConfigs.set('momentum-demo', {
      id: 'momentum-demo',
      name: 'Momentum Demo',
      plan: 'momentum',
      features: {
        zeroClick: true,
        fixQueue: true,
        proofPath: true,
        redGate: true,
        sseEvents: true,
        edgeCaching: true,
        circuitBreakers: true,
        banditRouting: true,
        counterfactualSim: false,
        graphRAG: false,
        consensusHeatmap: true,
        roiLedger: true,
        syntheticCanary: false,
        auditChain: true,
        driftMonitoring: true
      },
      policies: this.getDefaultPolicies(),
      limits: {
        maxCrawlsPerDay: 1000,
        maxAPICallsPerHour: 10000,
        maxStorageGB: 10,
        maxConcurrentJobs: 5,
        maxRetentionDays: 90
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    // Hyperdrive Plan (Enterprise)
    this.tenantConfigs.set('hyperdrive-demo', {
      id: 'hyperdrive-demo',
      name: 'Hyperdrive Demo',
      plan: 'hyperdrive',
      features: {
        zeroClick: true,
        fixQueue: true,
        proofPath: true,
        redGate: true,
        sseEvents: true,
        edgeCaching: true,
        circuitBreakers: true,
        banditRouting: true,
        counterfactualSim: true,
        graphRAG: true,
        consensusHeatmap: true,
        roiLedger: true,
        syntheticCanary: true,
        auditChain: true,
        driftMonitoring: true
      },
      policies: this.getDefaultPolicies(),
      limits: {
        maxCrawlsPerDay: 10000,
        maxAPICallsPerHour: 100000,
        maxStorageGB: 100,
        maxConcurrentJobs: 20,
        maxRetentionDays: 365
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  }

  /**
   * Get default feature flags
   */
  private getDefaultFlags(): FeatureFlags {
    return {
      zeroClick: false,
      fixQueue: false,
      proofPath: false,
      redGate: false,
      sseEvents: true,
      edgeCaching: true,
      circuitBreakers: false,
      banditRouting: false,
      counterfactualSim: false,
      graphRAG: false,
      consensusHeatmap: false,
      roiLedger: false,
      syntheticCanary: false,
      auditChain: true,
      driftMonitoring: false
    }
  }

  /**
   * Get default policy configuration
   */
  private getDefaultPolicies(): PolicyConfig {
    return {
      priceDelta: {
        sev1: 100,
        sev2: 500,
        sev3: 1000
      },
      undisclosedFees: {
        enabled: true,
        maxAllowed: 3
      },
      strikethroughAbuse: {
        enabled: true,
        threshold: 0.2
      },
      redGate: {
        enabled: true,
        sev3Threshold: 5,
        autoQuarantine: true
      },
      staleness: {
        ttl: 24,
        autoDecay: true,
        archiveAfter: 90
      }
    }
  }

  /**
   * Get default tenant limits
   */
  private getDefaultLimits(): TenantLimits {
    return {
      maxCrawlsPerDay: 100,
      maxAPICallsPerHour: 1000,
      maxStorageGB: 1,
      maxConcurrentJobs: 2,
      maxRetentionDays: 30
    }
  }
}

// Export convenience functions
export const flags = (tenantId: string) => {
  const manager = FeatureFlagManager.getInstance()
  return manager.getFlags(tenantId)
}

export const policies = (tenantId: string) => {
  const manager = FeatureFlagManager.getInstance()
  return manager.getPolicies(tenantId)
}

export const limits = (tenantId: string) => {
  const manager = FeatureFlagManager.getInstance()
  return manager.getLimits(tenantId)
}

export const isEnabled = (tenantId: string, feature: keyof FeatureFlags) => {
  const manager = FeatureFlagManager.getInstance()
  return manager.isEnabled(tenantId, feature)
}
