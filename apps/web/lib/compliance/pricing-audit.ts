/**
 * DealershipAI Pricing Transparency Audit System
 * Ensures compliance with Google's Dishonest Pricing Policy (Oct 28, 2025)
 */

export interface VehicleListing {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  price: number;
  msrp?: number;
  condition: 'new' | 'used';
  mileage?: number;
  dealerFees: DealerFee[];
  financingTerms?: FinancingTerms;
  location: string;
  lastUpdated: string;
}

export interface DealerFee {
  type: 'documentation' | 'prep' | 'handling' | 'processing' | 'delivery' | 'other';
  name: string;
  amount: number;
  required: boolean;
  disclosed: boolean;
  location: 'ad' | 'landing' | 'checkout' | 'hidden';
}

export interface FinancingTerms {
  downPayment: number;
  monthlyPayment: number;
  termMonths: number;
  interestRate: number;
  totalFinanced: number;
  finalPrice: number;
  disclosed: boolean;
}

export interface PricingAuditResult {
  listingId: string;
  overallScore: number; // 0-100
  complianceStatus: 'compliant' | 'warning' | 'violation' | 'critical';
  issues: PricingIssue[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAudited: string;
}

export interface PricingIssue {
  type: 'hidden_fee' | 'price_mismatch' | 'bait_switch' | 'unclear_terms' | 'missing_disclosure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: string;
  suggestedFix: string;
  deadline?: string;
}

export class PricingAuditEngine {
  private readonly complianceThresholds = {
    hiddenFees: 0, // Zero tolerance for hidden fees
    priceMismatch: 0.05, // 5% tolerance for price discrepancies
    disclosureClarity: 0.8, // 80% of fees must be clearly disclosed
    baitSwitch: 0, // Zero tolerance for bait-and-switch
  };

  /**
   * Audit a single vehicle listing for pricing compliance
   */
  async auditListing(listing: VehicleListing): Promise<PricingAuditResult> {
    const issues: PricingIssue[] = [];
    let score = 100;

    // Check for hidden fees
    const hiddenFeeIssues = this.checkHiddenFees(listing);
    issues.push(...hiddenFeeIssues);
    score -= hiddenFeeIssues.length * 20;

    // Check price consistency
    const priceIssues = this.checkPriceConsistency(listing);
    issues.push(...priceIssues);
    score -= priceIssues.length * 15;

    // Check bait-and-switch tactics
    const baitSwitchIssues = this.checkBaitSwitch(listing);
    issues.push(...baitSwitchIssues);
    score -= baitSwitchIssues.length * 25;

    // Check disclosure clarity
    const disclosureIssues = this.checkDisclosureClarity(listing);
    issues.push(...disclosureIssues);
    score -= disclosureIssues.length * 10;

    // Check financing terms transparency
    const financingIssues = this.checkFinancingTransparency(listing);
    issues.push(...financingIssues);
    score -= financingIssues.length * 15;

    const complianceStatus = this.determineComplianceStatus(score, issues);
    const riskLevel = this.calculateRiskLevel(issues);
    const recommendations = this.generateRecommendations(issues);

    return {
      listingId: listing.id,
      overallScore: Math.max(0, score),
      complianceStatus,
      issues,
      recommendations,
      riskLevel,
      lastAudited: new Date().toISOString(),
    };
  }

  /**
   * Audit multiple listings in batch
   */
  async auditBatch(listings: VehicleListing[]): Promise<PricingAuditResult[]> {
    const results = await Promise.all(
      listings.map(listing => this.auditListing(listing))
    );
    return results;
  }

  /**
   * Generate compliance report for dashboard
   */
  generateComplianceReport(results: PricingAuditResult[]): ComplianceReport {
    const totalListings = results.length;
    const compliantListings = results.filter(r => r.complianceStatus === 'compliant').length;
    const warningListings = results.filter(r => r.complianceStatus === 'warning').length;
    const violationListings = results.filter(r => r.complianceStatus === 'violation').length;
    const criticalListings = results.filter(r => r.complianceStatus === 'critical').length;

    const averageScore = results.reduce((sum, r) => sum + r.overallScore, 0) / totalListings;
    
    const issueBreakdown = this.analyzeIssueBreakdown(results);
    const topRecommendations = this.getTopRecommendations(results);

    return {
      summary: {
        totalListings,
        compliantListings,
        warningListings,
        violationListings,
        criticalListings,
        complianceRate: (compliantListings / totalListings) * 100,
        averageScore,
        lastAudited: new Date().toISOString(),
      },
      issueBreakdown,
      topRecommendations,
      criticalActions: this.getCriticalActions(results),
      nextAuditDue: this.calculateNextAuditDate(),
    };
  }

  private checkHiddenFees(listing: VehicleListing): PricingIssue[] {
    const issues: PricingIssue[] = [];
    
    listing.dealerFees.forEach(fee => {
      if (!fee.disclosed || fee.location === 'hidden') {
        issues.push({
          type: 'hidden_fee',
          severity: fee.required ? 'critical' : 'high',
          description: `Hidden ${fee.type} fee: $${fee.amount}`,
          location: fee.location,
          suggestedFix: `Disclose ${fee.name} fee of $${fee.amount} prominently in ad and landing page`,
          deadline: '2025-10-28',
        });
      }
    });

    return issues;
  }

  private checkPriceConsistency(listing: VehicleListing): PricingIssue[] {
    const issues: PricingIssue[] = [];
    
    // Calculate total price including all fees
    const totalFees = listing.dealerFees.reduce((sum, fee) => sum + fee.amount, 0);
    const totalPrice = listing.price + totalFees;
    
    // Check if financing terms match advertised price
    if (listing.financingTerms) {
      const financingTotal = listing.financingTerms.downPayment + 
        (listing.financingTerms.monthlyPayment * listing.financingTerms.termMonths);
      
      const priceDifference = Math.abs(totalPrice - financingTotal) / totalPrice;
      
      if (priceDifference > this.complianceThresholds.priceMismatch) {
        issues.push({
          type: 'price_mismatch',
          severity: 'high',
          description: `Price mismatch: Ad shows $${listing.price} but total with fees is $${totalPrice}`,
          location: 'ad_vs_checkout',
          suggestedFix: 'Update ad price to reflect total cost including all fees',
        });
      }
    }

    return issues;
  }

  private checkBaitSwitch(listing: VehicleListing): PricingIssue[] {
    const issues: PricingIssue[] = [];
    
    // Check for unrealistic low prices
    if (listing.msrp && listing.price < listing.msrp * 0.7) {
      issues.push({
        type: 'bait_switch',
        severity: 'critical',
        description: `Suspiciously low price: $${listing.price} vs MSRP $${listing.msrp}`,
        location: 'ad_pricing',
        suggestedFix: 'Verify price accuracy and ensure all conditions are clearly stated',
      });
    }

    // Check for "from" pricing without clear conditions
    if (listing.price.toString().includes('from') || listing.price < 1000) {
      issues.push({
        type: 'bait_switch',
        severity: 'high',
        description: 'Teaser pricing without clear conditions',
        location: 'ad_pricing',
        suggestedFix: 'Replace "from" pricing with specific price or add clear conditions',
      });
    }

    return issues;
  }

  private checkDisclosureClarity(listing: VehicleListing): PricingIssue[] {
    const issues: PricingIssue[] = [];
    
    const disclosedFees = listing.dealerFees.filter(fee => fee.disclosed).length;
    const totalFees = listing.dealerFees.length;
    const disclosureRate = totalFees > 0 ? disclosedFees / totalFees : 1;
    
    if (disclosureRate < this.complianceThresholds.disclosureClarity) {
      issues.push({
        type: 'missing_disclosure',
        severity: 'medium',
        description: `Only ${(disclosureRate * 100).toFixed(0)}% of fees are clearly disclosed`,
        location: 'ad_landing',
        suggestedFix: 'Add clear fee breakdown to ad and landing page',
      });
    }

    return issues;
  }

  private checkFinancingTransparency(listing: VehicleListing): PricingIssue[] {
    const issues: PricingIssue[] = [];
    
    if (listing.financingTerms && !listing.financingTerms.disclosed) {
      issues.push({
        type: 'unclear_terms',
        severity: 'high',
        description: 'Financing terms not clearly disclosed',
        location: 'ad_landing',
        suggestedFix: 'Add clear financing terms and total cost breakdown',
      });
    }

    return issues;
  }

  private determineComplianceStatus(score: number, issues: PricingIssue[]): 'compliant' | 'warning' | 'violation' | 'critical' {
    const hasCriticalIssues = issues.some(issue => issue.severity === 'critical');
    const hasHighIssues = issues.some(issue => issue.severity === 'high');
    
    if (hasCriticalIssues || score < 50) return 'critical';
    if (hasHighIssues || score < 70) return 'violation';
    if (score < 85) return 'warning';
    return 'compliant';
  }

  private calculateRiskLevel(issues: PricingIssue[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = issues.filter(i => i.severity === 'critical').length;
    const highCount = issues.filter(i => i.severity === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (highCount > 0 || issues.length > 3) return 'medium';
    return 'low';
  }

  private generateRecommendations(issues: PricingIssue[]): string[] {
    const recommendations = new Set<string>();
    
    issues.forEach(issue => {
      if (issue.suggestedFix) {
        recommendations.add(issue.suggestedFix);
      }
    });

    return Array.from(recommendations);
  }

  private analyzeIssueBreakdown(results: PricingAuditResult[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    results.forEach(result => {
      result.issues.forEach(issue => {
        breakdown[issue.type] = (breakdown[issue.type] || 0) + 1;
      });
    });

    return breakdown;
  }

  private getTopRecommendations(results: PricingAuditResult[]): string[] {
    const allRecommendations = results.flatMap(r => r.recommendations);
    const frequency: Record<string, number> = {};
    
    allRecommendations.forEach(rec => {
      frequency[rec] = (frequency[rec] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([rec]) => rec);
  }

  private getCriticalActions(results: PricingAuditResult[]): string[] {
    const criticalResults = results.filter(r => r.riskLevel === 'critical');
    const actions: string[] = [];
    
    if (criticalResults.length > 0) {
      actions.push(`Fix ${criticalResults.length} critical pricing violations immediately`);
    }
    
    const hiddenFeeCount = results.reduce((sum, r) => 
      sum + r.issues.filter(i => i.type === 'hidden_fee').length, 0);
    
    if (hiddenFeeCount > 0) {
      actions.push(`Disclose ${hiddenFeeCount} hidden fees across all listings`);
    }

    return actions;
  }

  private calculateNextAuditDate(): string {
    const nextAudit = new Date();
    nextAudit.setDate(nextAudit.getDate() + 7); // Weekly audits
    return nextAudit.toISOString();
  }
}

export interface ComplianceReport {
  summary: {
    totalListings: number;
    compliantListings: number;
    warningListings: number;
    violationListings: number;
    criticalListings: number;
    complianceRate: number;
    averageScore: number;
    lastAudited: string;
  };
  issueBreakdown: Record<string, number>;
  topRecommendations: string[];
  criticalActions: string[];
  nextAuditDue: string;
}
