// DealershipAI Risk Thresholds & Constants
// PIQR, HRP, OCI, and other critical thresholds

export interface RiskThresholds {
  piqr: {
    minPhotos: number
    optimalPhotosMin: number
    dilutionPhotosMax: number
    firstImageDisallow: string[]
    requiredFields: string[]
  }
  hrp: {
    warnThreshold: number // 0.50 = 50%
    criticalThreshold: number // 0.75 = 75%
    blockThreshold: number // 0.90 = 90%
  }
  oci: {
    lowRisk: number // $0-5K
    mediumRisk: number // $5K-15K
    highRisk: number // $15K+
  }
  ati: {
    excellent: number // 85+
    good: number // 70-84
    needsWork: number // 55-69
    critical: number // <55
  }
  funnel: {
    discover: {
      excellent: number // 80+
      good: number // 65-79
      needsWork: number // 50-64
      critical: number // <50
    }
    consider: {
      excellent: number // 75+
      good: number // 60-74
      needsWork: number // 45-59
      critical: number // <45
    }
    engage: {
      excellent: number // 70+
      good: number // 55-69
      needsWork: number // 40-54
      critical: number // <40
    }
    decide: {
      excellent: number // 80+
      good: number // 65-79
      needsWork: number // 50-64
      critical: number // <50
    }
    act: {
      excellent: number // 75+
      good: number // 60-74
      needsWork: number // 45-59
      critical: number // <45
    }
  }
}

export const RISK_THRESHOLDS: RiskThresholds = {
  piqr: {
    minPhotos: 5,
    optimalPhotosMin: 20,
    dilutionPhotosMax: 60,
    firstImageDisallow: ['placeholder', 'rear-angle', 'stock'],
    requiredFields: ['VIN', 'Price', 'Mileage', 'JSONLD.Vehicle', 'JSONLD.Offer']
  },
  hrp: {
    warnThreshold: 0.50, // 50% - red flag + human review
    criticalThreshold: 0.75, // 75% - pause auto-replies (Tier 3 only)
    blockThreshold: 0.90 // 90% - emergency stop
  },
  oci: {
    lowRisk: 5000, // $0-5K
    mediumRisk: 15000, // $5K-15K
    highRisk: 15000 // $15K+
  },
  ati: {
    excellent: 85,
    good: 70,
    needsWork: 55,
    critical: 55
  },
  funnel: {
    discover: {
      excellent: 80,
      good: 65,
      needsWork: 50,
      critical: 50
    },
    consider: {
      excellent: 75,
      good: 60,
      needsWork: 45,
      critical: 45
    },
    engage: {
      excellent: 70,
      good: 55,
      needsWork: 40,
      critical: 40
    },
    decide: {
      excellent: 80,
      good: 65,
      needsWork: 50,
      critical: 50
    },
    act: {
      excellent: 75,
      good: 60,
      needsWork: 45,
      critical: 45
    }
  }
}

export function getRiskLevel(value: number, thresholds: { excellent: number; good: number; needsWork: number; critical: number }): 'excellent' | 'good' | 'needsWork' | 'critical' {
  if (value >= thresholds.excellent) return 'excellent'
  if (value >= thresholds.good) return 'good'
  if (value >= thresholds.needsWork) return 'needsWork'
  return 'critical'
}

export function getRiskColor(level: 'excellent' | 'good' | 'needsWork' | 'critical'): string {
  switch (level) {
    case 'excellent': return 'text-emerald-400'
    case 'good': return 'text-blue-400'
    case 'needsWork': return 'text-yellow-400'
    case 'critical': return 'text-red-400'
  }
}

export function getRiskBgColor(level: 'excellent' | 'good' | 'needsWork' | 'critical'): string {
  switch (level) {
    case 'excellent': return 'bg-emerald-50 border-emerald-200'
    case 'good': return 'bg-blue-50 border-blue-200'
    case 'needsWork': return 'bg-yellow-50 border-yellow-200'
    case 'critical': return 'bg-red-50 border-red-200'
  }
}
