/**
 * License Management System
 * 
 * Manages software licenses, feature access, and IP protection for HyperAIV Optimizer
 */

export interface License {
  license_key: string;
  features: string[];
  issued_date: string;
  expires_date: string;
  max_users: number;
  max_dealers: number;
  tier: 'basic' | 'professional' | 'enterprise' | 'unlimited';
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  restrictions: string[];
}

export interface FeatureAccess {
  feature_name: string;
  access_level: 'none' | 'read' | 'write' | 'admin';
  restrictions: string[];
  expires_date?: string;
}

export class LicenseManager {
  private activeLicenses: Map<string, License>;
  private featureAccess: Map<string, FeatureAccess[]>;

  constructor() {
    this.activeLicenses = new Map();
    this.featureAccess = new Map();
  }

  /**
   * Generate a new license key
   */
  generateLicenseKey(features: string[], tier: string, maxUsers: number, maxDealers: number, durationDays: number = 365): License {
    const licenseKey = this.generateSecureKey();
    const issuedDate = new Date();
    const expiresDate = new Date(issuedDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const license: License = {
      license_key: licenseKey,
      features,
      issued_date: issuedDate.toISOString(),
      expires_date: expiresDate.toISOString(),
      max_users: maxUsers,
      max_dealers: maxDealers,
      tier: tier as any,
      status: 'active',
      restrictions: this.generateRestrictions(tier)
    };

    this.activeLicenses.set(licenseKey, license);
    return license;
  }

  /**
   * Validate a license key
   */
  validateLicense(licenseKey: string): { valid: boolean; license?: License; error?: string } {
    const license = this.activeLicenses.get(licenseKey);
    
    if (!license) {
      return { valid: false, error: 'License key not found' };
    }

    if (license.status !== 'active') {
      return { valid: false, error: `License is ${license.status}` };
    }

    const now = new Date();
    const expiresDate = new Date(license.expires_date);
    
    if (now > expiresDate) {
      license.status = 'expired';
      return { valid: false, error: 'License has expired' };
    }

    return { valid: true, license };
  }

  /**
   * Check feature access for a user
   */
  checkFeatureAccess(licenseKey: string, featureName: string, userId: string): { allowed: boolean; accessLevel?: string; error?: string } {
    const licenseValidation = this.validateLicense(licenseKey);
    
    if (!licenseValidation.valid) {
      return { allowed: false, error: licenseValidation.error };
    }

    const license = licenseValidation.license!;
    
    if (!license.features.includes(featureName)) {
      return { allowed: false, error: 'Feature not included in license' };
    }

    const userFeatures = this.featureAccess.get(userId) || [];
    const featureAccess = userFeatures.find(f => f.feature_name === featureName);
    
    if (!featureAccess) {
      return { allowed: false, error: 'No access granted for this feature' };
    }

    if (featureAccess.access_level === 'none') {
      return { allowed: false, error: 'Access denied for this feature' };
    }

    if (featureAccess.expires_date) {
      const now = new Date();
      const expiresDate = new Date(featureAccess.expires_date);
      
      if (now > expiresDate) {
        return { allowed: false, error: 'Feature access has expired' };
      }
    }

    return { allowed: true, accessLevel: featureAccess.access_level };
  }

  /**
   * Grant feature access to a user
   */
  grantFeatureAccess(userId: string, featureName: string, accessLevel: string, expiresDate?: string): boolean {
    const userFeatures = this.featureAccess.get(userId) || [];
    
    // Remove existing access for this feature
    const filteredFeatures = userFeatures.filter(f => f.feature_name !== featureName);
    
    // Add new access
    const newAccess: FeatureAccess = {
      feature_name: featureName,
      access_level: accessLevel as any,
      restrictions: this.generateFeatureRestrictions(featureName, accessLevel),
      expires_date: expiresDate
    };
    
    filteredFeatures.push(newAccess);
    this.featureAccess.set(userId, filteredFeatures);
    
    return true;
  }

  /**
   * Revoke feature access for a user
   */
  revokeFeatureAccess(userId: string, featureName: string): boolean {
    const userFeatures = this.featureAccess.get(userId) || [];
    const filteredFeatures = userFeatures.filter(f => f.feature_name !== featureName);
    this.featureAccess.set(userId, filteredFeatures);
    
    return true;
  }

  /**
   * Get all features for a license
   */
  getLicenseFeatures(licenseKey: string): string[] {
    const licenseValidation = this.validateLicense(licenseKey);
    
    if (!licenseValidation.valid) {
      return [];
    }

    return licenseValidation.license!.features;
  }

  /**
   * Get user's feature access
   */
  getUserFeatures(userId: string): FeatureAccess[] {
    return this.featureAccess.get(userId) || [];
  }

  /**
   * Suspend a license
   */
  suspendLicense(licenseKey: string, reason: string): boolean {
    const license = this.activeLicenses.get(licenseKey);
    
    if (!license) {
      return false;
    }

    license.status = 'suspended';
    license.restrictions.push(`Suspended: ${reason}`);
    
    return true;
  }

  /**
   * Reactivate a suspended license
   */
  reactivateLicense(licenseKey: string): boolean {
    const license = this.activeLicenses.get(licenseKey);
    
    if (!license || license.status !== 'suspended') {
      return false;
    }

    license.status = 'active';
    license.restrictions = license.restrictions.filter(r => !r.startsWith('Suspended:'));
    
    return true;
  }

  /**
   * Revoke a license
   */
  revokeLicense(licenseKey: string, reason: string): boolean {
    const license = this.activeLicenses.get(licenseKey);
    
    if (!license) {
      return false;
    }

    license.status = 'revoked';
    license.restrictions.push(`Revoked: ${reason}`);
    
    return true;
  }

  /**
   * Get license statistics
   */
  getLicenseStats(): any {
    const totalLicenses = this.activeLicenses.size;
    const activeLicenses = Array.from(this.activeLicenses.values()).filter(l => l.status === 'active').length;
    const expiredLicenses = Array.from(this.activeLicenses.values()).filter(l => l.status === 'expired').length;
    const suspendedLicenses = Array.from(this.activeLicenses.values()).filter(l => l.status === 'suspended').length;
    const revokedLicenses = Array.from(this.activeLicenses.values()).filter(l => l.status === 'revoked').length;

    return {
      total_licenses: totalLicenses,
      active_licenses: activeLicenses,
      expired_licenses: expiredLicenses,
      suspended_licenses: suspendedLicenses,
      revoked_licenses: revokedLicenses,
      active_percentage: totalLicenses > 0 ? (activeLicenses / totalLicenses) * 100 : 0
    };
  }

  // Private helper methods
  private generateSecureKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  private generateRestrictions(tier: string): string[] {
    const restrictions: Record<string, string[]> = {
      basic: [
        'Limited to 5 dealers',
        'Basic features only',
        'No API access',
        'Standard support only'
      ],
      professional: [
        'Limited to 25 dealers',
        'Advanced features included',
        'API access with rate limits',
        'Priority support'
      ],
      enterprise: [
        'Unlimited dealers',
        'All features included',
        'Full API access',
        'Dedicated support'
      ],
      unlimited: [
        'No restrictions',
        'All features included',
        'Full API access',
        'White-label support'
      ]
    };

    return restrictions[tier] || [];
  }

  private generateFeatureRestrictions(featureName: string, accessLevel: string): string[] {
    const restrictions: Record<string, string[]> = {
      'hyperaiv_optimizer': [
        'Weekly execution limit',
        'No source code access',
        'Results watermarking required'
      ],
      'model_training': [
        'Limited training iterations',
        'No parameter modification',
        'Audit logging required'
      ],
      'api_access': [
        'Rate limiting applied',
        'Authentication required',
        'Usage monitoring enabled'
      ],
      'benchmark_reports': [
        'Watermarking required',
        'No data export',
        'Audit trail maintained'
      ]
    };

    return restrictions[featureName] || [];
  }
}

export const licenseManager = new LicenseManager();
