/**
 * Analytics Service - Database Integrated
 *
 * This service handles analytics operations with proper database integration
 * and tier-based feature access control.
 *
 * This is the NEW version that replaces backend/src/services/analytics.ts
 */

import db, { tables } from '@/lib/db';
import { subscriptionService } from '@/lib/services/subscription-service';
import { enforceFeatureAccess } from '@/lib/tier-features';
import type { SubscriptionTier } from '@/lib/tier-features';

export interface AnalysisResult {
  id: string;
  tenant_id: string;
  user_id: string;
  dealership_url: string;
  ai_visibility_score: number;
  results: any;
  is_premium: boolean;
  unlocked_at: Date | null;
  created_at: Date;
}

export interface MarketScanResult {
  id: string;
  tenant_id: string;
  dealership_id: string | null;
  market_area: string;
  scan_results: any;
  competitors_found: number;
  scanned_at: Date;
  created_at: Date;
}

export class AnalyticsService {
  /**
   * Analyze a dealership and store results
   */
  async analyzeDealership(dealershipUrl: string, clerkId: string): Promise<AnalysisResult> {
    // Check if user has access to advanced analytics
    await subscriptionService.enforceFeatureAccess(clerkId, 'advanced_analytics');

    // Get user details
    const user = await tables.users()
      .where('clerk_id', clerkId)
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const tier = await subscriptionService.getUserTier(clerkId);

    // TODO: Replace this with your actual scoring logic
    const scores = await this.calculateScores(dealershipUrl);

    // Create analysis record
    const [analysis] = await tables.analyses()
      .insert({
        tenant_id: user.tenant_id,
        user_id: user.id,
        dealership_url: dealershipUrl,
        ai_visibility_score: scores.overall,
        results: JSON.stringify(scores),
        is_premium: tier !== 'free',
        unlocked_at: new Date(),
      })
      .returning('*');

    // Also update or create dealership_data record
    await tables.dealershipData()
      .insert({
        tenant_id: user.tenant_id,
        dealership_url: dealershipUrl,
        dealership_name: scores.dealershipName || null,
        ai_visibility_score: scores.aiVisibility || 0,
        zero_click_score: scores.zeroClick || 0,
        ugc_health_score: scores.ugcHealth || 0,
        geo_trust_score: scores.geoTrust || 0,
        sgp_integrity_score: scores.sgpIntegrity || 0,
        overall_score: scores.overall || 0,
        last_analyzed: new Date(),
      })
      .onConflict(['tenant_id', 'dealership_url'])
      .merge();

    return analysis as AnalysisResult;
  }

  /**
   * Get all analyses for a user
   */
  async getAnalyses(clerkId: string, tenantId?: string): Promise<AnalysisResult[]> {
    const user = await tables.users()
      .where('clerk_id', clerkId)
      .first();

    if (!user) {
      return [];
    }

    const query = tables.analyses()
      .where('user_id', user.id);

    if (tenantId) {
      query.where('tenant_id', tenantId);
    }

    return query
      .select('*')
      .orderBy('created_at', 'desc') as Promise<AnalysisResult[]>;
  }

  /**
   * Get a specific analysis by ID
   */
  async getAnalysisById(analysisId: string, tenantId?: string): Promise<AnalysisResult | null> {
    const query = tables.analyses()
      .where('id', analysisId);

    if (tenantId) {
      query.where('tenant_id', tenantId);
    }

    return query.first() as Promise<AnalysisResult | null>;
  }

  /**
   * Get monthly scan result
   */
  async getMonthlyScan(scanId: string, clerkId: string): Promise<MarketScanResult | null> {
    const user = await tables.users()
      .where('clerk_id', clerkId)
      .first();

    if (!user) {
      return null;
    }

    return tables.marketScans()
      .where('id', scanId)
      .where('tenant_id', user.tenant_id)
      .first() as Promise<MarketScanResult | null>;
  }

  /**
   * Trigger a new monthly scan
   */
  async triggerMonthlyScan(dealershipUrl: string, clerkId: string): Promise<MarketScanResult> {
    // Check if user has access to market scans
    await subscriptionService.enforceFeatureAccess(clerkId, 'market_scans');

    // Get user details
    const user = await tables.users()
      .where('clerk_id', clerkId)
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Find dealership
    const dealership = await tables.dealerships()
      .where('tenant_id', user.tenant_id)
      .where('website_url', dealershipUrl)
      .orWhere('domain', dealershipUrl)
      .first();

    // TODO: Replace with actual market scan logic
    const scanResults = await this.performMarketScan(dealershipUrl, dealership);

    // Create market scan record
    const [scan] = await tables.marketScans()
      .insert({
        tenant_id: user.tenant_id,
        dealership_id: dealership?.id || null,
        market_area: scanResults.marketArea || 'local',
        scan_results: JSON.stringify(scanResults),
        competitors_found: scanResults.competitors?.length || 0,
        scanned_at: new Date(),
      })
      .returning('*');

    // Track usage
    await subscriptionService.incrementUsage(clerkId, 'market_scans');

    return scan as MarketScanResult;
  }

  /**
   * Get dealership scores
   */
  async getDealershipScores(dealershipUrl: string, tenantId: string) {
    return tables.dealershipData()
      .where('tenant_id', tenantId)
      .where('dealership_url', dealershipUrl)
      .first();
  }

  /**
   * Get latest scores for all dealerships in a tenant
   */
  async getTenantScores(tenantId: string) {
    return tables.dealershipData()
      .where('tenant_id', tenantId)
      .orderBy('last_analyzed', 'desc');
  }

  /**
   * Get audit history for a dealership
   */
  async getAuditHistory(dealershipId: string, tenantId: string) {
    return tables.aiVisibilityAudits()
      .where('dealership_id', dealershipId)
      .where('tenant_id', tenantId)
      .orderBy('created_at', 'desc')
      .limit(10);
  }

  /**
   * Calculate scores for a dealership (placeholder - implement your logic)
   */
  private async calculateScores(dealershipUrl: string) {
    // TODO: Implement actual scoring logic
    // This should integrate with your existing scoring algorithms
    // Import from src/core/scoring-engine.ts or wherever your scoring logic lives

    return {
      dealershipName: 'Sample Dealership',
      overall: 75,
      aiVisibility: 78,
      zeroClick: 72,
      ugcHealth: 80,
      geoTrust: 75,
      sgpIntegrity: 70,
      details: {
        // Add detailed scoring breakdown
      },
    };
  }

  /**
   * Perform market scan (placeholder - implement your logic)
   */
  private async performMarketScan(dealershipUrl: string, dealership: any) {
    // TODO: Implement actual market scanning logic
    // This should integrate with your existing competitor analysis

    return {
      marketArea: dealership?.city || 'local',
      competitors: [
        // Add competitor data
      ],
      marketShare: 0,
      averageScore: 0,
      ranking: 0,
    };
  }
}

export const analyticsService = new AnalyticsService();
