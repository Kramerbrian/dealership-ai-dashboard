/**
 * DealershipAI Funnel Visualization
 * Visual representation of commerce funnel stages and conversion metrics
 */

export interface FunnelStage {
  name: string;
  count: number;
  conversionRate: number;
  revenue?: number;
  color: string;
}

export interface FunnelMetrics {
  stages: FunnelStage[];
  totalLeads: number;
  totalRevenue: number;
  overallConversion: number;
  cacTarget: number;
  ltvTarget: number;
}

/**
 * Generate funnel visualization data
 */
export function generateFunnelData(totalVisitors: number): FunnelMetrics {
  const freeScanConversion = 0.35;
  const emailNurtureConversion = 0.15;
  const trialConversion = 0.25;
  const paidConversion = 0.60;

  const freeScans = Math.round(totalVisitors * freeScanConversion);
  const emailLeads = Math.round(freeScans * emailNurtureConversion);
  const trials = Math.round(emailLeads * trialConversion);
  const paid = Math.round(trials * paidConversion);

  return {
    stages: [
      {
        name: 'Free Scan',
        count: freeScans,
        conversionRate: freeScanConversion,
        color: '#3b82f6',
      },
      {
        name: 'Email Nurture',
        count: emailLeads,
        conversionRate: emailNurtureConversion,
        color: '#8b5cf6',
      },
      {
        name: 'Trial Signup',
        count: trials,
        conversionRate: trialConversion,
        color: '#10b981',
      },
      {
        name: 'Paid Conversion',
        count: paid,
        conversionRate: paidConversion,
        revenue: paid * 499,
        color: '#059669',
      },
    ],
    totalLeads: freeScans,
    totalRevenue: paid * 499,
    overallConversion: paid / totalVisitors,
    cacTarget: 150,
    ltvTarget: 5988,
  };
}

/**
 * Generate SVG funnel visualization
 */
export function generateFunnelSVG(metrics: FunnelMetrics): string {
  const width = 400;
  const height = 500;
  const stageHeight = 80;
  const spacing = 20;

  let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

  metrics.stages.forEach((stage, index) => {
    const y = index * (stageHeight + spacing);
    const stageWidth = width * (1 - index * 0.15);
    const x = (width - stageWidth) / 2;

    svg += `
      <rect x="${x}" y="${y}" width="${stageWidth}" height="${stageHeight}"
        fill="${stage.color}" rx="4" />
      <text x="${width / 2}" y="${y + 30}"
        text-anchor="middle" fill="white" font-size="18" font-weight="bold">
        ${stage.name}
      </text>
      <text x="${width / 2}" y="${y + 55}"
        text-anchor="middle" fill="white" font-size="14">
        ${stage.count.toLocaleString()} (${(stage.conversionRate * 100).toFixed(1)}%)
      </text>
    `;
  });

  svg += '</svg>';
  return svg;
}

/**
 * Export funnel data as JSON for visualization libraries
 */
export function exportFunnelJSON(metrics: FunnelMetrics): string {
  return JSON.stringify(metrics, null, 2);
}
