/**
 * DealershipAI Feed Pipeline Validation System
 * Ensures price consistency across all touchpoints for Google compliance
 */

export interface FeedValidationConfig {
  priceTolerance: number; // Percentage tolerance for price differences
  requiredFields: string[];
  optionalFields: string[];
  priceFields: string[];
  feeFields: string[];
}

export interface FeedRecord {
  id: string;
  source: 'merchant_center' | 'google_ads' | 'landing_page' | 'api';
  data: Record<string, any>;
  timestamp: string;
  url?: string;
}

export interface ValidationResult {
  recordId: string;
  isValid: boolean;
  score: number; // 0-100
  issues: ValidationIssue[];
  warnings: ValidationWarning[];
  recommendations: string[];
}

export interface ValidationIssue {
  field: string;
  type: 'missing' | 'invalid' | 'mismatch' | 'format_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  expected?: any;
  actual?: any;
  fix?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion: string;
}

export class FeedValidator {
  private config: FeedValidationConfig;

  constructor(config?: Partial<FeedValidationConfig>) {
    this.config = {
      priceTolerance: 0.05, // 5%
      requiredFields: ['id', 'price', 'condition', 'make', 'model', 'year'],
      optionalFields: ['vin', 'mileage', 'color', 'trim', 'body_style'],
      priceFields: ['price', 'msrp', 'sale_price', 'final_price'],
      feeFields: ['dealer_fee', 'doc_fee', 'prep_fee', 'delivery_fee'],
      ...config,
    };
  }

  /**
   * Validate a single feed record
   */
  async validateRecord(record: FeedRecord): Promise<ValidationResult> {
    const issues: ValidationIssue[] = [];
    const warnings: ValidationWarning[] = [];
    let score = 100;

    // Check required fields
    const missingFields = this.checkRequiredFields(record);
    issues.push(...missingFields);
    score -= missingFields.length * 15;

    // Check price consistency
    const priceIssues = await this.checkPriceConsistency(record);
    issues.push(...priceIssues);
    score -= priceIssues.length * 20;

    // Check data format
    const formatIssues = this.checkDataFormat(record);
    issues.push(...formatIssues);
    score -= formatIssues.length * 10;

    // Check field completeness
    const completenessWarnings = this.checkCompleteness(record);
    warnings.push(...completenessWarnings);

    const recommendations = this.generateRecommendations(issues, warnings);

    return {
      recordId: record.id,
      isValid: issues.filter(i => i.severity === 'critical').length === 0,
      score: Math.max(0, score),
      issues,
      warnings,
      recommendations,
    };
  }

  /**
   * Validate multiple records and check cross-source consistency
   */
  async validateBatch(records: FeedRecord[]): Promise<ValidationResult[]> {
    const results = await Promise.all(
      records.map(record => this.validateRecord(record))
    );

    // Check cross-source consistency
    const consistencyIssues = this.checkCrossSourceConsistency(records);
    
    // Add consistency issues to relevant records
    results.forEach(result => {
      const record = records.find(r => r.id === result.recordId);
      if (record && consistencyIssues[record.id]) {
        result.issues.push(...consistencyIssues[record.id]);
        result.score = Math.max(0, result.score - consistencyIssues[record.id].length * 10);
      }
    });

    return results;
  }

  /**
   * Generate feed health report
   */
  generateHealthReport(results: ValidationResult[]): FeedHealthReport {
    const totalRecords = results.length;
    const validRecords = results.filter(r => r.isValid).length;
    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalRecords;

    const issueBreakdown = this.analyzeIssues(results);
    const topIssues = this.getTopIssues(results);
    const criticalIssues = results.filter(r => 
      r.issues.some(i => i.severity === 'critical')
    ).length;

    return {
      summary: {
        totalRecords,
        validRecords,
        invalidRecords: totalRecords - validRecords,
        averageScore,
        healthScore: (validRecords / totalRecords) * 100,
        criticalIssues,
        lastValidated: new Date().toISOString(),
      },
      issueBreakdown,
      topIssues,
      recommendations: this.getTopRecommendations(results),
      nextValidationDue: this.calculateNextValidationDate(),
    };
  }

  private checkRequiredFields(record: FeedRecord): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    this.config.requiredFields.forEach(field => {
      if (!record.data[field] || record.data[field] === '') {
        issues.push({
          field,
          type: 'missing',
          severity: 'critical',
          message: `Required field '${field}' is missing`,
          fix: `Add ${field} to the feed record`,
        });
      }
    });

    return issues;
  }

  private async checkPriceConsistency(record: FeedRecord): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];
    
    // Check if price fields are numeric
    this.config.priceFields.forEach(field => {
      if (record.data[field] && isNaN(Number(record.data[field]))) {
        issues.push({
          field,
          type: 'invalid',
          severity: 'high',
          message: `Price field '${field}' is not a valid number`,
          actual: record.data[field],
          fix: 'Ensure price fields contain only numeric values',
        });
      }
    });

    // Check price logic
    const price = Number(record.data.price);
    const msrp = Number(record.data.msrp);
    
    if (price && msrp && price > msrp) {
      issues.push({
        field: 'price',
        type: 'invalid',
        severity: 'medium',
        message: 'Price cannot be higher than MSRP',
        actual: price,
        expected: `<= ${msrp}`,
        fix: 'Verify price accuracy or update MSRP',
      });
    }

    // Check for negative prices
    if (price && price < 0) {
      issues.push({
        field: 'price',
        type: 'invalid',
        severity: 'critical',
        message: 'Price cannot be negative',
        actual: price,
        fix: 'Set a valid positive price',
      });
    }

    return issues;
  }

  private checkDataFormat(record: FeedRecord): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    
    // Check VIN format
    if (record.data.vin && !this.isValidVIN(record.data.vin)) {
      issues.push({
        field: 'vin',
        type: 'format_error',
        severity: 'high',
        message: 'Invalid VIN format',
        actual: record.data.vin,
        fix: 'Use 17-character VIN format',
      });
    }

    // Check year format
    if (record.data.year) {
      const year = Number(record.data.year);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        issues.push({
          field: 'year',
          type: 'format_error',
          severity: 'medium',
          message: 'Invalid year format',
          actual: year,
          expected: `1900-${currentYear + 1}`,
          fix: 'Use valid 4-digit year',
        });
      }
    }

    // Check condition values
    const validConditions = ['new', 'used', 'certified'];
    if (record.data.condition && !validConditions.includes(record.data.condition)) {
      issues.push({
        field: 'condition',
        type: 'format_error',
        severity: 'high',
        message: 'Invalid condition value',
        actual: record.data.condition,
        expected: validConditions.join(', '),
        fix: 'Use valid condition: new, used, or certified',
      });
    }

    return issues;
  }

  private checkCompleteness(record: FeedRecord): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    this.config.optionalFields.forEach(field => {
      if (!record.data[field] || record.data[field] === '') {
        warnings.push({
          field,
          message: `Optional field '${field}' is missing`,
          suggestion: `Consider adding ${field} for better listing quality`,
        });
      }
    });

    return warnings;
  }

  private checkCrossSourceConsistency(records: FeedRecord[]): Record<string, ValidationIssue[]> {
    const issues: Record<string, ValidationIssue[]> = {};
    
    // Group records by ID
    const recordsById = records.reduce((acc, record) => {
      if (!acc[record.id]) acc[record.id] = [];
      acc[record.id].push(record);
      return acc;
    }, {} as Record<string, FeedRecord[]>);

    // Check consistency within each ID group
    Object.entries(recordsById).forEach(([id, groupRecords]) => {
      if (groupRecords.length > 1) {
        const priceIssues = this.checkPriceConsistencyAcrossSources(groupRecords);
        if (priceIssues.length > 0) {
          issues[id] = priceIssues;
        }
      }
    });

    return issues;
  }

  private checkPriceConsistencyAcrossSources(records: FeedRecord[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const prices = records.map(r => Number(r.data.price)).filter(p => !isNaN(p));
    
    if (prices.length > 1) {
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const difference = (maxPrice - minPrice) / minPrice;
      
      if (difference > this.config.priceTolerance) {
        issues.push({
          field: 'price',
          type: 'mismatch',
          severity: 'high',
          message: `Price inconsistency across sources: $${minPrice} - $${maxPrice}`,
          actual: { min: minPrice, max: maxPrice },
          fix: 'Ensure consistent pricing across all touchpoints',
        });
      }
    }

    return issues;
  }

  private isValidVIN(vin: string): boolean {
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
  }

  private generateRecommendations(issues: ValidationIssue[], warnings: ValidationWarning[]): string[] {
    const recommendations = new Set<string>();
    
    issues.forEach(issue => {
      if (issue.fix) {
        recommendations.add(issue.fix);
      }
    });

    warnings.forEach(warning => {
      if (warning.suggestion) {
        recommendations.add(warning.suggestion);
      }
    });

    return Array.from(recommendations);
  }

  private analyzeIssues(results: ValidationResult[]): Record<string, number> {
    const breakdown: Record<string, number> = {};
    
    results.forEach(result => {
      result.issues.forEach(issue => {
        const key = `${issue.type}_${issue.severity}`;
        breakdown[key] = (breakdown[key] || 0) + 1;
      });
    });

    return breakdown;
  }

  private getTopIssues(results: ValidationResult[]): string[] {
    const issueCounts: Record<string, number> = {};
    
    results.forEach(result => {
      result.issues.forEach(issue => {
        const key = `${issue.field}: ${issue.message}`;
        issueCounts[key] = (issueCounts[key] || 0) + 1;
      });
    });

    return Object.entries(issueCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([issue]) => issue);
  }

  private getTopRecommendations(results: ValidationResult[]): string[] {
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

  private calculateNextValidationDate(): string {
    const nextValidation = new Date();
    nextValidation.setHours(nextValidation.getHours() + 24); // Daily validation
    return nextValidation.toISOString();
  }
}

export interface FeedHealthReport {
  summary: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    averageScore: number;
    healthScore: number;
    criticalIssues: number;
    lastValidated: string;
  };
  issueBreakdown: Record<string, number>;
  topIssues: string[];
  recommendations: string[];
  nextValidationDue: string;
}
