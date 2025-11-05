/**
 * PIQR v3 Calculation System
 * 
 * Composite intelligence and data quality index (Performance, Intelligence, Quality, Readiness)
 * Modifies DPI in real time.
 * 
 * Formulas:
 * - PIQR_v2.3 = (0.30 × Performance) + (0.25 × Intelligence) + (0.25 × Quality) + (0.20 × Readiness)
 * - PIQR_v3 = (0.35 × Data Completeness) + (0.30 × AI Confidence) + (0.20 × Trust Integrity) + (0.15 × System Harmony)
 * - PIQR_custom = f(KPI_alignment, Hovercard_accuracy, DPI_correlation)
 * - PIQR_score = (0.25 × PIQR_v2.3) + (0.50 × PIQR_v3) + (0.25 × PIQR_custom)
 * - DPI_adjusted = DPI_base × (1 + (PIQR_score / 100) × 0.15)
 */

export interface PIQR_v2_3_Inputs {
  performance: number;    // DMS uptime logs, API metrics (0-100)
  intelligence: number;  // AI inference telemetry, Pulse model trust (0-100)
  quality: number;       // Schema validators, Search APIs (0-100)
  readiness: number;     // CRM logs, Automation coverage (0-100)
}

export interface PIQR_v3_Inputs {
  dataCompleteness: number;  // VIN registry, OEM feeds (0-100)
  aiConfidence: number;       // Model outputs (AppraiseAI, DiagnosticsAI) (0-100)
  trustIntegrity: number;     // Review APIs, GBP consistency (0-100)
  systemHarmony: number;      // SSE + dashboard diff telemetry (0-100)
}

export interface PIQR_custom_Inputs {
  kpiAlignment: number;        // KPI alignment score (0-100)
  hovercardAccuracy: number;   // Hovercard accuracy score (0-100)
  dpiCorrelation: number;      // DPI correlation score (0-100)
}

export interface PIQR_CalculationResult {
  piqr_v2_3: number;
  piqr_v3: number;
  piqr_custom: number;
  piqr_score: number;
  dpi_adjusted: number;
  dpi_base: number;
  breakdown: {
    v2_3: {
      performance: number;
      intelligence: number;
      quality: number;
      readiness: number;
    };
    v3: {
      dataCompleteness: number;
      aiConfidence: number;
      trustIntegrity: number;
      systemHarmony: number;
    };
    custom: {
      kpiAlignment: number;
      hovercardAccuracy: number;
      dpiCorrelation: number;
    };
  };
}

/**
 * Calculate PIQR_v2.3
 */
export function calculatePIQR_v2_3(inputs: PIQR_v2_3_Inputs): number {
  return (
    0.30 * inputs.performance +
    0.25 * inputs.intelligence +
    0.25 * inputs.quality +
    0.20 * inputs.readiness
  );
}

/**
 * Calculate PIQR_v3
 */
export function calculatePIQR_v3(inputs: PIQR_v3_Inputs): number {
  return (
    0.35 * inputs.dataCompleteness +
    0.30 * inputs.aiConfidence +
    0.20 * inputs.trustIntegrity +
    0.15 * inputs.systemHarmony
  );
}

/**
 * Calculate PIQR_custom
 * Custom function combining KPI alignment, hovercard accuracy, and DPI correlation
 */
export function calculatePIQR_custom(inputs: PIQR_custom_Inputs): number {
  // Weighted average with equal weights
  const weights = {
    kpiAlignment: 0.33,
    hovercardAccuracy: 0.33,
    dpiCorrelation: 0.34,
  };
  
  return (
    weights.kpiAlignment * inputs.kpiAlignment +
    weights.hovercardAccuracy * inputs.hovercardAccuracy +
    weights.dpiCorrelation * inputs.dpiCorrelation
  );
}

/**
 * Calculate final PIQR score
 */
export function calculatePIQRScore(
  v2_3: number,
  v3: number,
  custom: number
): number {
  return (
    0.25 * v2_3 +
    0.50 * v3 +
    0.25 * custom
  );
}

/**
 * Calculate DPI adjusted by PIQR score
 */
export function calculateDPIAdjusted(
  dpiBase: number,
  piqrScore: number
): number {
  return dpiBase * (1 + (piqrScore / 100) * 0.15);
}

/**
 * Main PIQR calculation function
 */
export function calculatePIQR(
  v2_3_inputs: PIQR_v2_3_Inputs,
  v3_inputs: PIQR_v3_Inputs,
  custom_inputs: PIQR_custom_Inputs,
  dpiBase: number = 100
): PIQR_CalculationResult {
  const piqr_v2_3 = calculatePIQR_v2_3(v2_3_inputs);
  const piqr_v3 = calculatePIQR_v3(v3_inputs);
  const piqr_custom = calculatePIQR_custom(custom_inputs);
  const piqr_score = calculatePIQRScore(piqr_v2_3, piqr_v3, piqr_custom);
  const dpi_adjusted = calculateDPIAdjusted(dpiBase, piqr_score);

  return {
    piqr_v2_3: parseFloat(piqr_v2_3.toFixed(2)),
    piqr_v3: parseFloat(piqr_v3.toFixed(2)),
    piqr_custom: parseFloat(piqr_custom.toFixed(2)),
    piqr_score: parseFloat(piqr_score.toFixed(2)),
    dpi_adjusted: parseFloat(dpi_adjusted.toFixed(2)),
    dpi_base: dpiBase,
    breakdown: {
      v2_3: {
        performance: parseFloat((v2_3_inputs.performance * 0.30).toFixed(2)),
        intelligence: parseFloat((v2_3_inputs.intelligence * 0.25).toFixed(2)),
        quality: parseFloat((v2_3_inputs.quality * 0.25).toFixed(2)),
        readiness: parseFloat((v2_3_inputs.readiness * 0.20).toFixed(2)),
      },
      v3: {
        dataCompleteness: parseFloat((v3_inputs.dataCompleteness * 0.35).toFixed(2)),
        aiConfidence: parseFloat((v3_inputs.aiConfidence * 0.30).toFixed(2)),
        trustIntegrity: parseFloat((v3_inputs.trustIntegrity * 0.20).toFixed(2)),
        systemHarmony: parseFloat((v3_inputs.systemHarmony * 0.15).toFixed(2)),
      },
      custom: {
        kpiAlignment: parseFloat((custom_inputs.kpiAlignment * 0.33).toFixed(2)),
        hovercardAccuracy: parseFloat((custom_inputs.hovercardAccuracy * 0.33).toFixed(2)),
        dpiCorrelation: parseFloat((custom_inputs.dpiCorrelation * 0.34).toFixed(2)),
      },
    },
  };
}

/**
 * Get data source descriptions for each element
 */
export const PIQR_DATA_SOURCES = {
  performance: "DMS uptime logs, API metrics",
  intelligence: "AI inference telemetry, Pulse model trust",
  quality: "Schema validators, Search APIs",
  readiness: "CRM logs, Automation coverage",
  dataCompleteness: "VIN registry, OEM feeds",
  aiConfidence: "Model outputs (AppraiseAI, DiagnosticsAI)",
  trustIntegrity: "Review APIs, GBP consistency",
  systemHarmony: "SSE + dashboard diff telemetry",
  kpiAlignment: "KPI alignment metrics",
  hovercardAccuracy: "Hovercard accuracy metrics",
  dpiCorrelation: "DPI correlation metrics",
} as const;

