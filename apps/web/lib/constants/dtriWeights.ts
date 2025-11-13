// Digital Trust Revenue Index (DTRI) Weighting Configuration
// Vertical-specific β coefficients for trust-to-revenue elasticity modeling

export const DTRI_WEIGHTS = {
  sales: {
    EEAT: 0.25,
    Rep: 0.25,
    Tech: 0.20,
    LocVis: 0.30,
    description: "Marketing exposure & AI visibility focus"
  },
  acquisition: {
    EEAT: 0.30,
    Rep: 0.30,
    Tech: 0.15,
    LocVis: 0.25,
    description: "Consumer trust in 'sell my car' flow"
  },
  service: {
    EEAT: 0.40,
    Rep: 0.35,
    Tech: 0.15,
    LocVis: 0.10,
    description: "Trust in after-sale support"
  },
  parts: {
    EEAT: 0.25,
    Rep: 0.25,
    Tech: 0.30,
    LocVis: 0.20,
    description: "Transactional confidence & fulfillment accuracy"
  }
} as const;

// Supporting Indices Configuration
export const SUPPORTING_INDICES = {
  DELI: {
    name: "Digital Experience Loss Index",
    description: "Technical SEO + Core Web Vitals degradation cost",
    dataSource: "Lighthouse, CWV API",
    weight: 0.15
  },
  LVRI: {
    name: "Local Visibility Revenue Index", 
    description: "Geo rank × revenue multiplier",
    dataSource: "GMB + Google Ads data",
    weight: 0.20
  },
  ATS: {
    name: "Algorithmic Trust Score",
    description: "AI model confidence from GPT/Perplexity/Gemini",
    dataSource: "AI response evaluation",
    weight: 0.25
  },
  PIQR: {
    name: "Performance Impact Quality Risk",
    description: "Revenue lost per % drop in QAI",
    dataSource: "QAI engine",
    weight: 0.20
  },
  QAI: {
    name: "Quantum Authority Index",
    description: "Global clarity & authority composite",
    dataSource: "AIV subsystem",
    weight: 0.20
  }
} as const;

// Elasticity calculation parameters
export const ELASTICITY_CONFIG = {
  MIN_DTRI_DELTA: 1.0, // Minimum DTRI change to calculate elasticity
  MIN_REVENUE_DELTA: 100, // Minimum revenue change in dollars
  LOOKBACK_DAYS: 90, // Days to look back for trend calculation
  CONFIDENCE_THRESHOLD: 0.7 // Minimum confidence for elasticity calculation
} as const;

// DTRI scoring thresholds
export const DTRI_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 80,
  FAIR: 70,
  POOR: 60,
  CRITICAL: 50
} as const;

// Revenue impact multipliers by vertical
export const REVENUE_IMPACT_MULTIPLIERS = {
  sales: 1000, // $1000 per DTRI point
  acquisition: 1200, // $1200 per DTRI point  
  service: 800, // $800 per DTRI point
  parts: 600 // $600 per DTRI point
} as const;

// E-E-A-T penalty mapping
export const EEAT_PENALTIES = {
  EXPERIENCE: {
    keywords: ['poor service', 'bad experience', 'disappointed', 'unprofessional'],
    impact: 0.15,
    enhancer: 'Improve customer service training and response protocols'
  },
  EXPERTISE: {
    keywords: ['unqualified', 'inexperienced', 'wrong diagnosis', 'mistake'],
    impact: 0.20,
    enhancer: 'Enhance technician training and certification programs'
  },
  AUTHORITATIVENESS: {
    keywords: ['not authorized', 'unauthorized', 'fake', 'scam'],
    impact: 0.25,
    enhancer: 'Strengthen brand authority and certification displays'
  },
  TRUSTWORTHINESS: {
    keywords: ['deceptive', 'hidden fees', 'bait and switch', 'dishonest'],
    impact: 0.30,
    enhancer: 'Improve transparency and pricing clarity'
  }
} as const;

// Vertical types
export const DTRI_VERTICALS = {
  SALES: 'sales',
  ACQUISITION: 'acquisition', 
  SERVICE: 'service',
  PARTS: 'parts'
} as const;

// Component types for DTRI calculation
export const DTRI_COMPONENTS = {
  EEAT: 'eeat',
  REPUTATION: 'rep',
  TECHNICAL: 'tech',
  LOCAL_VISIBILITY: 'locvis'
} as const;

export type DTRIWeights = typeof DTRI_WEIGHTS;
export type SupportingIndices = typeof SUPPORTING_INDICES;
export type ElasticityConfig = typeof ELASTICITY_CONFIG;
export type DTRIThresholds = typeof DTRI_THRESHOLDS;
export type RevenueImpactMultipliers = typeof REVENUE_IMPACT_MULTIPLIERS;
export type EEATPenalties = typeof EEAT_PENALTIES;
export type DTRIVerticals = typeof DTRI_VERTICALS;
export type DTRIComponents = typeof DTRI_COMPONENTS;
