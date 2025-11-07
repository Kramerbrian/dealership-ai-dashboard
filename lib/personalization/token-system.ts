/**
 * Personalization Token System
 * 
 * Dynamic tokens for context-aware personalization within DealershipAI Opportunity Engine.
 * Version: 3.6
 */

export interface RoleContext {
  role: 'GM' | 'GSM' | 'Marketing Director' | 'BDC Manager' | 'Internet Director' | 'Service Manager';
  focus_metric: 'ROI' | 'Ad Spend' | 'Close Rate' | 'Lead Efficiency' | 'Customer Retention';
  decision_window_days: number;
  tone_profile: 'executive' | 'advisory' | 'tactical';
}

export interface StoreProfile {
  store_id: string;
  store_type: 'Volume' | 'Luxury' | 'Hybrid' | 'Used Only' | 'Multi-Brand';
  monthly_units: number;
  avg_gross_per_sale: number;
  market_region: 'Midwest' | 'Southeast' | 'West Coast' | 'Northeast';
  ad_budget: number;
  gross_target: number;
}

export interface PerformanceContext {
  DPI_trend: string; // e.g., "↑3.8%" or raw number 0.042
  DLOC_delta: string; // e.g., "-$12,400"
  DLOC_reduction?: number; // Raw reduction amount (e.g., 19800)
  LEE_change: string; // e.g., "+5.2%" or raw number 0.045
  trend_direction: 'improving' | 'declining' | 'stable';
  historical_loss_trend: string; // e.g., "-$18,000 vs prior 30 days"
  improvement_velocity: string; // e.g., "4.2%"
  campaign_cadence_score: string; // e.g., "B+"
  // Normalized values (calculated)
  DPI_trend_normalized?: number;
  LEE_change_normalized?: number;
  DLOC_ratio?: number;
  trend_direction_modifier?: number;
}

export interface EngagementMetrics {
  alert_ack_rate: number; // 0.83 = 83%
  action_follow_through_rate: number; // 0.75 = 75%
  avg_response_time_hours: number; // 2.5 hours
}

export interface ConfidenceMetrics {
  confidence_score: number; // 0.91 = 91%
  confidence_tier: 'High' | 'Medium' | 'Low';
  roi_forecast_confidence_multiplier: number; // 1.12 = 12% boost
  tone_profile: 'strategic' | 'executive' | 'advisory' | 'tactical';
  forecast_variance_reduction: string; // "-9.2%" = 9.2% reduction in variance
}

export interface CommunicationChannel {
  channel: 'slack' | 'dashboard' | 'email' | 'sms';
  urgency_level: 'info' | 'warning' | 'critical';
  visual_mode: 'compact' | 'detailed';
  timestamp: string; // ISO8601
  alert_color: 'green' | 'yellow' | 'red';
}

export interface UserEngagement {
  user_id: string;
  engagement_score: number;
  last_login: string; // ISO8601
  response_lag_hours: number;
  preferred_cadence: 'weekly' | 'bi-weekly' | 'monthly';
}

export interface TokenGroups {
  role_context: RoleContext;
  store_profile: StoreProfile;
  performance_context: PerformanceContext;
  communication_channel: CommunicationChannel;
  user_engagement: UserEngagement;
  engagement_metrics?: EngagementMetrics;
  confidence_metrics?: ConfidenceMetrics;
}

export interface TokenSystemConfig {
  version: string;
  namespace: string;
  description: string;
  token_groups: TokenGroups;
  output_integration: {
    merge_mode: 'token_injection';
    priority_order: Array<keyof TokenGroups>;
    output_templates: {
      slack_alert: string;
      dashboard_hovercard: string;
      forecast_snippet: string;
    };
  };
}

/**
 * Flatten token groups into a single object for easy access
 */
export function flattenTokens(tokenGroups: TokenGroups): Record<string, any> {
  // Calculate normalized metrics
  const normalizedPerformance = calculateNormalizedMetrics(tokenGroups.performance_context);

  const tokens: Record<string, any> = {
    // Role context
    role: tokenGroups.role_context.role,
    focus_metric: tokenGroups.role_context.focus_metric,
    decision_window_days: tokenGroups.role_context.decision_window_days,
    tone_profile: tokenGroups.role_context.tone_profile,
    
    // Store profile
    store_id: tokenGroups.store_profile.store_id,
    store_type: tokenGroups.store_profile.store_type,
    monthly_units: tokenGroups.store_profile.monthly_units,
    avg_gross_per_sale: tokenGroups.store_profile.avg_gross_per_sale,
    market_region: tokenGroups.store_profile.market_region,
    ad_budget: tokenGroups.store_profile.ad_budget,
    gross_target: tokenGroups.store_profile.gross_target,
    
    // Performance context
    DPI_trend: normalizedPerformance.DPI_trend,
    DPI_trend_normalized: normalizedPerformance.DPI_trend_normalized,
    DLOC_delta: normalizedPerformance.DLOC_delta,
    DLOC_reduction: normalizedPerformance.DLOC_reduction,
    DLOC_ratio: normalizedPerformance.DLOC_ratio,
    LEE_change: normalizedPerformance.LEE_change,
    LEE_change_normalized: normalizedPerformance.LEE_change_normalized,
    trend_direction: normalizedPerformance.trend_direction,
    trend_direction_modifier: normalizedPerformance.trend_direction_modifier,
    historical_loss_trend: normalizedPerformance.historical_loss_trend,
    improvement_velocity: normalizedPerformance.improvement_velocity,
    campaign_cadence_score: normalizedPerformance.campaign_cadence_score,
    
    // Communication channel
    channel: tokenGroups.communication_channel.channel,
    urgency_level: tokenGroups.communication_channel.urgency_level,
    visual_mode: tokenGroups.communication_channel.visual_mode,
    timestamp: tokenGroups.communication_channel.timestamp,
    alert_color: tokenGroups.communication_channel.alert_color,
    
    // User engagement
    user_id: tokenGroups.user_engagement.user_id,
    engagement_score: tokenGroups.user_engagement.engagement_score,
    last_login: tokenGroups.user_engagement.last_login,
    response_lag_hours: tokenGroups.user_engagement.response_lag_hours,
    preferred_cadence: tokenGroups.user_engagement.preferred_cadence,
  };

  // Add engagement metrics if available
  if (tokenGroups.engagement_metrics) {
    tokens.alert_ack_rate = tokenGroups.engagement_metrics.alert_ack_rate;
    tokens.action_follow_through_rate = tokenGroups.engagement_metrics.action_follow_through_rate;
    tokens.avg_response_time_hours = tokenGroups.engagement_metrics.avg_response_time_hours;
  }

  // Add confidence metrics if available
  if (tokenGroups.confidence_metrics) {
    tokens.confidence_score = tokenGroups.confidence_metrics.confidence_score;
    tokens.confidence_tier = tokenGroups.confidence_metrics.confidence_tier;
    tokens.roi_forecast_confidence_multiplier = tokenGroups.confidence_metrics.roi_forecast_confidence_multiplier;
    tokens.forecast_variance_reduction = tokenGroups.confidence_metrics.forecast_variance_reduction;
    // Override tone_profile if confidence metrics provide it
    if (tokenGroups.confidence_metrics.tone_profile) {
      tokens.tone_profile = tokenGroups.confidence_metrics.tone_profile;
    }
  }

  return tokens;
}

/**
 * Resolve template tokens with values
 */
export function resolveTemplate(
  template: string,
  tokens: Record<string, any>,
  additionalData?: Record<string, any>
): string {
  let resolved = template;
  const allTokens = { ...tokens, ...additionalData };

  // Replace {{token}} or {{token|filter}} patterns
  const tokenPattern = /\{\{(\w+)(?:\|(\w+))?\}\}/g;
  
  resolved = resolved.replace(tokenPattern, (match, token, filter) => {
    const value = allTokens[token];
    
    if (value === undefined || value === null) {
      return match; // Keep original if token not found
    }

    let resolvedValue = String(value);

    // Apply filters
    if (filter === 'upper') {
      resolvedValue = resolvedValue.toUpperCase();
    } else if (filter === 'lower') {
      resolvedValue = resolvedValue.toLowerCase();
    } else if (filter === 'currency') {
      resolvedValue = formatCurrency(resolvedValue);
    } else if (filter === 'percent') {
      resolvedValue = formatPercent(resolvedValue);
    }

    return resolvedValue;
  });

  return resolved;
}

/**
 * Format value as currency
 */
function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return value.toString();
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format value as percent
 */
function formatPercent(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return value.toString();
  return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
}

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Extract numeric value from string (handles percentages, currency, etc.)
 */
function extractNumeric(value: string | number): number {
  if (typeof value === 'number') return value;
  // Remove currency symbols, percentages, arrows, etc.
  const cleaned = value.replace(/[↑↓$%,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Normalize DPI trend: clamp((DPI_trend / 0.05), 0, 1)
 */
export function normalizeDPITrend(dpiTrend: string | number): number {
  const value = extractNumeric(dpiTrend);
  return clamp(value / 0.05, 0, 1);
}

/**
 * Normalize LEE change: clamp((LEE_change / 0.07), 0, 1)
 */
export function normalizeLEEChange(leeChange: string | number): number {
  const value = extractNumeric(leeChange);
  return clamp(value / 0.07, 0, 1);
}

/**
 * Calculate DLOC ratio: min(DLOC_reduction / 25000, 1)
 */
export function calculateDLOCRatio(dlocReduction: number): number {
  return Math.min(dlocReduction / 25000, 1);
}

/**
 * Get trend direction modifier: 1 if improving, 0.5 if stable, 0.25 if declining
 */
export function getTrendDirectionModifier(trendDirection: 'improving' | 'declining' | 'stable'): number {
  switch (trendDirection) {
    case 'improving':
      return 1.0;
    case 'stable':
      return 0.5;
    case 'declining':
      return 0.25;
    default:
      return 0.5;
  }
}

/**
 * Calculate normalized performance metrics
 */
export function calculateNormalizedMetrics(performanceContext: PerformanceContext): PerformanceContext {
  const normalized = { ...performanceContext };

  // Normalize DPI trend
  if (performanceContext.DPI_trend) {
    normalized.DPI_trend_normalized = normalizeDPITrend(performanceContext.DPI_trend);
  }

  // Normalize LEE change
  if (performanceContext.LEE_change) {
    normalized.LEE_change_normalized = normalizeLEEChange(performanceContext.LEE_change);
  }

  // Calculate DLOC ratio
  if (performanceContext.DLOC_reduction !== undefined) {
    normalized.DLOC_ratio = calculateDLOCRatio(performanceContext.DLOC_reduction);
  }

  // Get trend direction modifier
  normalized.trend_direction_modifier = getTrendDirectionModifier(performanceContext.trend_direction);

  return normalized;
}

/**
 * Generate personalized message using token system
 */
export function generatePersonalizedMessage(
  templateType: 'slack_alert' | 'dashboard_hovercard' | 'forecast_snippet',
  tokenGroups: TokenGroups,
  additionalData?: Record<string, any>
): string {
  const config: TokenSystemConfig = {
    version: '3.6',
    namespace: 'personalization.tokens',
    description: 'Dynamic tokens for context-aware personalization',
    token_groups: tokenGroups,
    output_integration: {
      merge_mode: 'token_injection',
      priority_order: ['role_context', 'store_profile', 'performance_context', 'communication_channel', 'user_engagement'],
      output_templates: {
        slack_alert: '🚨 **{{urgency_level|upper}} Alert ({{role}})** — {{focus_metric}} deviation detected. LEE™: {{LEE_change}} | D-LOC: {{DLOC_delta}}. Recommend action: {{recommendation}} (Recoverable ROI: {{roi_projection}})',
        dashboard_hovercard: '{{role}} view — DPI: {{DPI_trend}} | LEE™: {{LEE_change}} | Recoverable Profit: {{roi_projection}} | Trend: {{trend_direction}}',
        forecast_snippet: 'Based on {{improvement_velocity}} engagement velocity, recoverable ROI for {{decision_window_days}} days is projected at {{roi_projection}}.',
      },
    },
  };

  const template = config.output_integration.output_templates[templateType];
  const tokens = flattenTokens(tokenGroups);
  
  return resolveTemplate(template, tokens, additionalData);
}

/**
 * Get default token groups (for testing/fallback)
 */
export function getDefaultTokenGroups(): TokenGroups {
  const performanceContext: PerformanceContext = {
    DPI_trend: '↑3.8%',
    DLOC_delta: '-$12,400',
    DLOC_reduction: 12400,
    LEE_change: '+5.2%',
    trend_direction: 'improving',
    historical_loss_trend: '-$18,000 vs prior 30 days',
    improvement_velocity: '4.2%',
    campaign_cadence_score: 'B+',
  };

  return {
    role_context: {
      role: 'GM',
      focus_metric: 'ROI',
      decision_window_days: 14,
      tone_profile: 'executive',
    },
    store_profile: {
      store_id: 'default-store',
      store_type: 'Volume',
      monthly_units: 240,
      avg_gross_per_sale: 1850,
      market_region: 'Midwest',
      ad_budget: 32000,
      gross_target: 450000,
    },
    performance_context: calculateNormalizedMetrics(performanceContext),
    communication_channel: {
      channel: 'dashboard',
      urgency_level: 'info',
      visual_mode: 'detailed',
      timestamp: new Date().toISOString(),
      alert_color: 'green',
    },
    user_engagement: {
      user_id: 'default-user',
      engagement_score: 82,
      last_login: new Date().toISOString(),
      response_lag_hours: 3.1,
      preferred_cadence: 'weekly',
    },
    engagement_metrics: {
      alert_ack_rate: 0.83,
      action_follow_through_rate: 0.75,
      avg_response_time_hours: 2.5,
    },
    confidence_metrics: {
      confidence_score: 0.91,
      confidence_tier: 'High',
      roi_forecast_confidence_multiplier: 1.12,
      tone_profile: 'strategic',
      forecast_variance_reduction: '-9.2%',
    },
  };
}

