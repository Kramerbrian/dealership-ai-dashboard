/**
 * Pulse Tile Generator
 * 
 * Auto-creates and retires tiles based on signal strength and metric volatility
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface Metric {
  key: string;
  currentValue: number;
  previousValue: number;
  threshold: number;
  source: 'ga4' | 'gsc' | 'gbp' | 'crm' | 'reviews' | 'vauto' | 'custom';
  volatility: number; // 0-1, how much the metric changes
  lastUpdated: Date;
}

export interface PulseTile {
  id: string;
  tenant_id: string;
  metric_key: string;
  signal_strength: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  pulse_frequency: 'hourly' | 'daily' | 'weekly';
  title: string;
  insight: string;
  change: string;
  impact: 'low' | 'medium' | 'high';
  current_value: number;
  previous_value: number;
  threshold_value: number;
  source: string;
  anomaly_detected: boolean;
  relevance_score: number;
  priority_score: number;
  context: Record<string, any>;
}

const SIGNAL_THRESHOLD = 0.4; // Minimum signal strength to create tile
const URGENCY_THRESHOLDS = {
  critical: 0.8,
  high: 0.6,
  medium: 0.4,
  low: 0.2
};

/**
 * Calculate signal strength from metric delta
 */
function calculateSignalStrength(metric: Metric): number {
  const delta = Math.abs(metric.currentValue - metric.previousValue);
  const thresholdDelta = Math.abs(metric.currentValue - metric.threshold);
  const volatilityFactor = metric.volatility;
  
  // Signal strength = normalized delta + threshold proximity + volatility
  const deltaStrength = Math.min(delta / (metric.threshold || 1), 1);
  const thresholdStrength = Math.min(thresholdDelta / (metric.threshold || 1), 1);
  
  return (deltaStrength * 0.5 + thresholdStrength * 0.3 + volatilityFactor * 0.2);
}

/**
 * Determine urgency from signal strength and delta
 */
function determineUrgency(signalStrength: number, delta: number): 'low' | 'medium' | 'high' | 'critical' {
  if (signalStrength >= URGENCY_THRESHOLDS.critical || Math.abs(delta) > 0.2) {
    return 'critical';
  }
  if (signalStrength >= URGENCY_THRESHOLDS.high || Math.abs(delta) > 0.1) {
    return 'high';
  }
  if (signalStrength >= URGENCY_THRESHOLDS.medium || Math.abs(delta) > 0.05) {
    return 'medium';
  }
  return 'low';
}

/**
 * Determine pulse frequency from volatility
 */
function determinePulseFrequency(volatility: number): 'hourly' | 'daily' | 'weekly' {
  if (volatility > 0.7) return 'hourly';
  if (volatility > 0.4) return 'daily';
  return 'weekly';
}

/**
 * Generate AI insight (placeholder - integrate with OpenAI)
 */
async function generateInsight(metric: Metric, change: string): Promise<string> {
  // TODO: Call OpenAI function calling for insight generation
  // For now, return template-based insight
  
  const direction = metric.currentValue > metric.previousValue ? 'increased' : 'decreased';
  const magnitude = Math.abs((metric.currentValue - metric.previousValue) / metric.previousValue * 100);
  
  const templates = [
    `Your ${metric.key} ${direction} ${magnitude.toFixed(1)}% — ${metric.source} anomaly detected.`,
    `${metric.key} ${direction} ${magnitude.toFixed(1)}% — check ${metric.source} data.`,
    `${metric.key} shift: ${change} — ${metric.source} signal detected.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Create or update a pulse tile
 */
export async function createOrUpdateTile(
  tenantId: string,
  metric: Metric
): Promise<PulseTile | null> {
  if (!supabase) {
    console.warn('Supabase not configured. Tile generation disabled.');
    return null;
  }

  const signalStrength = calculateSignalStrength(metric);
  
  // Only create tile if signal strength exceeds threshold
  if (signalStrength < SIGNAL_THRESHOLD) {
    // Archive existing tile if signal is too weak
    await archiveTile(tenantId, metric.key);
    return null;
  }

  const urgency = determineUrgency(signalStrength, (metric.currentValue - metric.previousValue) / metric.previousValue);
  const pulseFrequency = determinePulseFrequency(metric.volatility);
  const change = `${metric.currentValue > metric.previousValue ? '+' : ''}${((metric.currentValue - metric.previousValue) / metric.previousValue * 100).toFixed(1)}%`;
  const insight = await generateInsight(metric, change);
  
  const impact: 'low' | 'medium' | 'high' = 
    urgency === 'critical' ? 'high' :
    urgency === 'high' ? 'medium' : 'low';

  const { data, error } = await supabase
    .from('pulse_tiles')
    .upsert({
      tenant_id: tenantId,
      metric_key: metric.key,
      signal_strength: signalStrength,
      urgency,
      pulse_frequency: pulseFrequency,
      title: `${metric.key} Alert`,
      insight,
      change,
      impact,
      current_value: metric.currentValue,
      previous_value: metric.previousValue,
      threshold_value: metric.threshold,
      source: metric.source,
      anomaly_detected: signalStrength > 0.7,
      last_seen: new Date().toISOString(),
      context: {
        volatility: metric.volatility,
        lastUpdated: metric.lastUpdated.toISOString()
      }
    }, {
      onConflict: 'tenant_id,metric_key'
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create/update tile:', error);
    return null;
  }

  // Log tile creation
  await supabase
    .from('pulse_tile_history')
    .insert({
      tile_id: data.id,
      tenant_id: tenantId,
      event_type: 'created',
      metadata: { signal_strength: signalStrength, urgency }
    });

  return data as PulseTile;
}

/**
 * Archive a tile (set resolved_at)
 */
export async function archiveTile(tenantId: string, metricKey: string): Promise<void> {
  if (!supabase) return;

  await supabase
    .from('pulse_tiles')
    .update({ resolved_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('metric_key', metricKey)
    .is('resolved_at', null);
}

/**
 * Get active tiles for a tenant (sorted by priority)
 */
export async function getActiveTiles(tenantId: string, limit = 20): Promise<PulseTile[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('pulse_tiles')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('resolved_at', null)
    .order('priority_score', { ascending: false })
    .order('relevance_score', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data as PulseTile[];
}

/**
 * Process metrics and generate tiles
 */
export async function processMetrics(tenantId: string, metrics: Metric[]): Promise<PulseTile[]> {
  const tiles: PulseTile[] = [];

  for (const metric of metrics) {
    const tile = await createOrUpdateTile(tenantId, metric);
    if (tile) {
      tiles.push(tile);
    }
  }

  return tiles;
}

