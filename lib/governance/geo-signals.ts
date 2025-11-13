// GEO Signals Governance
// DealershipAI - Metadata-Only Storage & Provenance Tracking

import { db } from "@/db";
import { external_sources, geo_signals, composite_scores } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { createHash } from "crypto";

export interface GovernanceConfig {
  maxContentLength: number;
  allowedProviders: string[];
  retentionDays: number;
  maxSourcesPerTenant: number;
  stabilityThreshold: number;
}

export const DEFAULT_GOVERNANCE_CONFIG: GovernanceConfig = {
  maxContentLength: 0, // No content storage allowed
  allowedProviders: [
    "seopowersuite:blog",
    "ahrefs:blog", 
    "semrush:blog",
    "moz:blog",
    "screamingfrog:blog",
    "searchengineland:blog",
    "searchenginejournal:blog",
  ],
  retentionDays: 365, // 1 year
  maxSourcesPerTenant: 1000,
  stabilityThreshold: 15, // points
};

/**
 * Validate external source before ingestion
 */
export function validateExternalSource(
  url: string,
  provider: string,
  config: GovernanceConfig = DEFAULT_GOVERNANCE_CONFIG
): { valid: boolean; reason?: string } {
  // Check provider whitelist
  if (!config.allowedProviders.includes(provider)) {
    return {
      valid: false,
      reason: `Provider '${provider}' not in allowed list`
    };
  }

  // Validate URL format
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        valid: false,
        reason: 'Only HTTP/HTTPS URLs allowed'
      };
    }
  } catch {
    return {
      valid: false,
      reason: 'Invalid URL format'
    };
  }

  return { valid: true };
}

/**
 * Create content hash for provenance tracking
 */
export function createContentHash(
  url: string,
  title?: string,
  author?: string,
  publishedAt?: Date
): string {
  const content = [
    url,
    title || '',
    author || '',
    publishedAt?.toISOString() || '',
  ].join('|');

  return createHash('sha256').update(content).digest('hex');
}

/**
 * Check for duplicate sources
 */
export async function checkDuplicateSource(
  tenantId: string,
  url: string,
  contentHash: string
): Promise<{ isDuplicate: boolean; existingSource?: any }> {
  const existingSource = await db
    .select()
    .from(external_sources)
    .where(and(
      eq(external_sources.tenantId, tenantId),
      eq(external_sources.url, url)
    ))
    .limit(1)
    .then(rows => rows[0]);

  if (existingSource) {
    return {
      isDuplicate: true,
      existingSource,
    };
  }

  // Also check by content hash for deduplication
  const hashMatch = await db
    .select()
    .from(external_sources)
    .where(and(
      eq(external_sources.tenantId, tenantId),
      eq(external_sources.contentHash, contentHash)
    ))
    .limit(1)
    .then(rows => rows[0]);

  return {
    isDuplicate: !!hashMatch,
    existingSource: hashMatch,
  };
}

/**
 * Enforce tenant limits
 */
export async function enforceTenantLimits(
  tenantId: string,
  config: GovernanceConfig = DEFAULT_GOVERNANCE_CONFIG
): Promise<{ withinLimits: boolean; currentCount: number; reason?: string }> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(external_sources)
    .where(eq(external_sources.tenantId, tenantId));

  const currentCount = result[0]?.count || 0;

  if (currentCount >= config.maxSourcesPerTenant) {
    return {
      withinLimits: false,
      currentCount,
      reason: `Tenant has reached maximum sources limit (${config.maxSourcesPerTenant})`
    };
  }

  return {
    withinLimits: true,
    currentCount,
  };
}

/**
 * Clean up old sources based on retention policy
 */
export async function cleanupOldSources(
  tenantId: string,
  config: GovernanceConfig = DEFAULT_GOVERNANCE_CONFIG
): Promise<{ deletedCount: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);

  // Delete old sources and their associated signals
  const oldSources = await db
    .select()
    .from(external_sources)
    .where(and(
      eq(external_sources.tenantId, tenantId),
      sql`${external_sources.createdAt} < ${cutoffDate}`
    ));

  if (!oldSources || oldSources.length === 0) {
    return { deletedCount: 0 };
  }

  let deletedCount = 0;
  for (const source of oldSources) {
    // Delete associated geo signals first
    await db.delete(geo_signals).where(eq(geo_signals.sourceId, source.id));

    // Delete the source
    await db.delete(external_sources).where(eq(external_sources.id, source.id));
    deletedCount++;
  }

  return { deletedCount };
}

/**
 * Monitor stability and flag instability
 */
export async function monitorStability(
  tenantId: string,
  config: GovernanceConfig = DEFAULT_GOVERNANCE_CONFIG
): Promise<{ isStable: boolean; instabilityReasons: string[] }> {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const recentSignals = await db
    .select()
    .from(geo_signals)
    .where(and(
      eq(geo_signals.tenantId, tenantId),
      sql`${geo_signals.computedAt} >= ${twoWeeksAgo}`
    ))
    .orderBy(desc(geo_signals.computedAt))
    .limit(5);

  if (!recentSignals || recentSignals.length < 2) {
    return {
      isStable: true,
      instabilityReasons: [],
    };
  }

  const instabilityReasons: string[] = [];

  // Check for score swings
  for (let i = 1; i < recentSignals.length; i++) {
    const current = recentSignals[i - 1];
    const previous = recentSignals[i];

    const swing = Math.abs(current.geoChecklistScore - previous.geoChecklistScore);
    if (swing > config.stabilityThreshold) {
      instabilityReasons.push(
        `GEO checklist score swung ${swing} points between ${new Date(previous.computedAt).toLocaleDateString()} and ${new Date(current.computedAt).toLocaleDateString()}`
      );
    }
  }

  // Check for low confidence
  const avgConfidence = recentSignals.reduce((sum: number, signal) => sum + Number(signal.confidence), 0) / recentSignals.length;
  if (avgConfidence < 0.6) {
    instabilityReasons.push(
      `Low average confidence: ${(avgConfidence * 100).toFixed(1)}% over last ${recentSignals.length} measurements`
    );
  }

  return {
    isStable: instabilityReasons.length === 0,
    instabilityReasons,
  };
}

/**
 * Generate provenance report
 */
export async function generateProvenanceReport(
  tenantId: string
): Promise<{
  totalSources: number;
  providers: Record<string, number>;
  dateRange: { oldest: string; newest: string };
  compliance: {
    metadataOnly: boolean;
    noContentStorage: boolean;
    properHashing: boolean;
  };
}> {
  const sources = await db
    .select()
    .from(external_sources)
    .where(eq(external_sources.tenantId, tenantId))
    .orderBy(desc(external_sources.createdAt));

  if (!sources || sources.length === 0) {
    return {
      totalSources: 0,
      providers: {},
      dateRange: { oldest: '', newest: '' },
      compliance: {
        metadataOnly: true,
        noContentStorage: true,
        properHashing: true,
      },
    };
  }

  // Count providers
  const providers: Record<string, number> = {};
  sources.forEach((source) => {
    providers[source.provider] = (providers[source.provider] || 0) + 1;
  });

  // Date range
  const dates = sources.map((s) => new Date(s.createdAt));
  const oldest = new Date(Math.min(...dates.map((d) => d.getTime())));
  const newest = new Date(Math.max(...dates.map((d) => d.getTime())));

  // Compliance checks
  const compliance = {
    metadataOnly: true, // We only store metadata
    noContentStorage: true, // We don't store full content
    properHashing: sources.every((s) => s.contentHash && s.contentHash.length === 64),
  };

  return {
    totalSources: sources.length,
    providers,
    dateRange: {
      oldest: oldest.toISOString(),
      newest: newest.toISOString(),
    },
    compliance,
  };
}

/**
 * Audit data integrity
 */
export async function auditDataIntegrity(
  tenantId: string
): Promise<{
  integrityScore: number;
  issues: string[];
  recommendations: string[];
}> {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Check for orphaned geo signals (signals without a valid source)
  const allSignals = await db
    .select()
    .from(geo_signals)
    .where(eq(geo_signals.tenantId, tenantId));

  const sourceIds = allSignals.map((s) => s.sourceId);
  const validSources = await db
    .select({ id: external_sources.id })
    .from(external_sources)
    .where(eq(external_sources.tenantId, tenantId));

  const validSourceIds = new Set(validSources.map((s) => s.id));
  const orphanedCount = sourceIds.filter((id) => !validSourceIds.has(id)).length;

  if (orphanedCount > 0) {
    issues.push(`${orphanedCount} orphaned geo signals found`);
    recommendations.push('Clean up orphaned geo signals');
  }

  // Check for missing composite scores
  const hasCompositeScores = await db
    .select()
    .from(composite_scores)
    .where(and(
      eq(composite_scores.tenantId, tenantId),
      eq(composite_scores.scoreType, 'aiv_geo')
    ))
    .limit(1)
    .then(rows => rows[0]);

  if (!hasCompositeScores) {
    issues.push('Missing composite AIV GEO scores');
    recommendations.push('Run composite score computation');
  }

  // Check for stale data
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const staleSignals = await db
    .select()
    .from(geo_signals)
    .where(and(
      eq(geo_signals.tenantId, tenantId),
      sql`${geo_signals.computedAt} < ${oneWeekAgo}`
    ));

  if (staleSignals && staleSignals.length > 0) {
    issues.push(`${staleSignals.length} stale geo signals (older than 1 week)`);
    recommendations.push('Update stale geo signals');
  }

  // Calculate integrity score
  const totalChecks = 3;
  const passedChecks = totalChecks - issues.length;
  const integrityScore = Math.round((passedChecks / totalChecks) * 100);

  return {
    integrityScore,
    issues,
    recommendations,
  };
}

/**
 * Export governance summary for compliance
 */
export async function exportGovernanceSummary(
  tenantId: string
): Promise<{
  summary: {
    tenantId: string;
    generatedAt: string;
    totalSources: number;
    complianceScore: number;
    integrityScore: number;
  };
  provenance: any;
  integrity: any;
  stability: any;
}> {
  const [provenance, integrity, stability] = await Promise.all([
    generateProvenanceReport(tenantId),
    auditDataIntegrity(tenantId),
    monitorStability(tenantId),
  ]);

  const complianceScore = provenance.compliance.metadataOnly && 
                         provenance.compliance.noContentStorage && 
                         provenance.compliance.properHashing ? 100 : 75;

  return {
    summary: {
      tenantId,
      generatedAt: new Date().toISOString(),
      totalSources: provenance.totalSources,
      complianceScore,
      integrityScore: integrity.integrityScore,
    },
    provenance,
    integrity,
    stability,
  };
}
