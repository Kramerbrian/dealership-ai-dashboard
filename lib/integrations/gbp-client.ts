/**
 * Google Business Profile (GBP) Client
 *
 * Provides integration with Google My Business API for:
 * - Location data retrieval
 * - NAP (Name, Address, Phone) validation
 * - Location updates
 * - Multi-location management
 *
 * @see https://developers.google.com/my-business/reference/rest
 */

import { google } from 'googleapis';

export interface GBPLocation {
  name: string;
  title: string;
  locationId: string;
  address: {
    streetAddress: string;
    locality: string;
    region: string;
    postalCode: string;
    country: string;
  };
  phoneNumbers: {
    primaryPhone: string;
    additionalPhones?: string[];
  };
  websiteUri?: string;
  categories: Array<{
    categoryId: string;
    displayName: string;
  }>;
  metadata?: {
    placeId?: string;
  };
}

export interface NAPValidation {
  isConsistent: boolean;
  name: {
    value: string;
    isValid: boolean;
    issues?: string[];
  };
  address: {
    value: string;
    isValid: boolean;
    issues?: string[];
  };
  phone: {
    value: string;
    isValid: boolean;
    issues?: string[];
  };
  lastChecked: Date;
  confidenceScore: number; // 0-1
}

export class GBPClient {
  private mybusiness: any;
  private accountId: string;

  constructor(serviceAccountKey?: any) {
    try {
      // Initialize Google Auth
      const credentials = serviceAccountKey ||
        (process.env.GBP_SERVICE_ACCOUNT ?
          JSON.parse(process.env.GBP_SERVICE_ACCOUNT) : null);

      if (!credentials) {
        console.warn('[GBPClient] No credentials provided, running in mock mode');
        return;
      }

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/business.manage']
      });

      this.mybusiness = google.mybusinessbusinessinformation({
        version: 'v1',
        auth
      });

      this.accountId = process.env.GBP_ACCOUNT_ID || '';

      console.log('[GBPClient] Initialized successfully');
    } catch (error) {
      console.error('[GBPClient] Initialization error:', error);
      throw new Error('Failed to initialize GBP client');
    }
  }

  /**
   * Get location details by location ID
   */
  async getLocation(locationId: string): Promise<GBPLocation | null> {
    try {
      if (!this.mybusiness) {
        return this.getMockLocation(locationId);
      }

      const response = await this.mybusiness.locations.get({
        name: `locations/${locationId}`,
        readMask: 'name,title,storefrontAddress,phoneNumbers,websiteUri,categories,metadata'
      });

      const location = response.data;

      return {
        name: location.name,
        title: location.title,
        locationId: locationId,
        address: {
          streetAddress: location.storefrontAddress?.addressLines?.[0] || '',
          locality: location.storefrontAddress?.locality || '',
          region: location.storefrontAddress?.administrativeArea || '',
          postalCode: location.storefrontAddress?.postalCode || '',
          country: location.storefrontAddress?.regionCode || 'US'
        },
        phoneNumbers: {
          primaryPhone: location.phoneNumbers?.primaryPhone || '',
          additionalPhones: location.phoneNumbers?.additionalPhones || []
        },
        websiteUri: location.websiteUri,
        categories: location.categories || [],
        metadata: location.metadata
      };
    } catch (error) {
      console.error('[GBPClient] Error fetching location:', error);
      return null;
    }
  }

  /**
   * List all locations for the account
   */
  async listLocations(): Promise<GBPLocation[]> {
    try {
      if (!this.mybusiness) {
        return [this.getMockLocation('mock-location-1')];
      }

      const response = await this.mybusiness.locations.list({
        parent: `accounts/${this.accountId}`,
        readMask: 'name,title,storefrontAddress,phoneNumbers,websiteUri'
      });

      return (response.data.locations || []).map((loc: any) => ({
        name: loc.name,
        title: loc.title,
        locationId: loc.name.split('/').pop(),
        address: {
          streetAddress: loc.storefrontAddress?.addressLines?.[0] || '',
          locality: loc.storefrontAddress?.locality || '',
          region: loc.storefrontAddress?.administrativeArea || '',
          postalCode: loc.storefrontAddress?.postalCode || '',
          country: loc.storefrontAddress?.regionCode || 'US'
        },
        phoneNumbers: {
          primaryPhone: loc.phoneNumbers?.primaryPhone || '',
          additionalPhones: loc.phoneNumbers?.additionalPhones || []
        },
        websiteUri: loc.websiteUri,
        categories: loc.categories || []
      }));
    } catch (error) {
      console.error('[GBPClient] Error listing locations:', error);
      return [];
    }
  }

  /**
   * Update location information
   */
  async updateLocation(
    locationId: string,
    updates: Partial<GBPLocation>
  ): Promise<GBPLocation | null> {
    try {
      if (!this.mybusiness) {
        console.log('[GBPClient] Mock mode - would update:', updates);
        return this.getMockLocation(locationId);
      }

      const updateMask: string[] = [];
      const updateData: any = {};

      if (updates.title) {
        updateData.title = updates.title;
        updateMask.push('title');
      }

      if (updates.address) {
        updateData.storefrontAddress = {
          addressLines: [updates.address.streetAddress],
          locality: updates.address.locality,
          administrativeArea: updates.address.region,
          postalCode: updates.address.postalCode,
          regionCode: updates.address.country
        };
        updateMask.push('storefrontAddress');
      }

      if (updates.phoneNumbers?.primaryPhone) {
        updateData.phoneNumbers = {
          primaryPhone: updates.phoneNumbers.primaryPhone,
          additionalPhones: updates.phoneNumbers.additionalPhones || []
        };
        updateMask.push('phoneNumbers');
      }

      if (updates.websiteUri) {
        updateData.websiteUri = updates.websiteUri;
        updateMask.push('websiteUri');
      }

      const response = await this.mybusiness.locations.patch({
        name: `locations/${locationId}`,
        updateMask: updateMask.join(','),
        requestBody: updateData
      });

      return this.parseLocation(response.data);
    } catch (error) {
      console.error('[GBPClient] Error updating location:', error);
      return null;
    }
  }

  /**
   * Validate NAP consistency
   */
  async validateNAP(locationId: string, expectedNAP?: {
    name?: string;
    address?: string;
    phone?: string;
  }): Promise<NAPValidation> {
    try {
      const location = await this.getLocation(locationId);

      if (!location) {
        throw new Error('Location not found');
      }

      const validation: NAPValidation = {
        isConsistent: true,
        name: {
          value: location.title,
          isValid: true,
          issues: []
        },
        address: {
          value: this.formatAddress(location.address),
          isValid: true,
          issues: []
        },
        phone: {
          value: location.phoneNumbers.primaryPhone,
          isValid: true,
          issues: []
        },
        lastChecked: new Date(),
        confidenceScore: 1.0
      };

      // Validate name
      if (expectedNAP?.name) {
        const nameMatch = this.calculateSimilarity(
          location.title.toLowerCase(),
          expectedNAP.name.toLowerCase()
        );

        if (nameMatch < 0.9) {
          validation.name.isValid = false;
          validation.name.issues?.push(
            `Name mismatch: GBP shows "${location.title}", expected "${expectedNAP.name}"`
          );
          validation.isConsistent = false;
          validation.confidenceScore -= 0.3;
        }
      }

      // Validate address
      if (expectedNAP?.address) {
        const addressMatch = this.calculateSimilarity(
          this.formatAddress(location.address).toLowerCase(),
          expectedNAP.address.toLowerCase()
        );

        if (addressMatch < 0.85) {
          validation.address.isValid = false;
          validation.address.issues?.push(
            `Address mismatch: GBP shows "${this.formatAddress(location.address)}", expected "${expectedNAP.address}"`
          );
          validation.isConsistent = false;
          validation.confidenceScore -= 0.4;
        }
      }

      // Validate phone
      if (expectedNAP?.phone) {
        const normalizedGBP = this.normalizePhone(location.phoneNumbers.primaryPhone);
        const normalizedExpected = this.normalizePhone(expectedNAP.phone);

        if (normalizedGBP !== normalizedExpected) {
          validation.phone.isValid = false;
          validation.phone.issues?.push(
            `Phone mismatch: GBP shows "${location.phoneNumbers.primaryPhone}", expected "${expectedNAP.phone}"`
          );
          validation.isConsistent = false;
          validation.confidenceScore -= 0.3;
        }
      }

      // Check for missing data
      if (!location.phoneNumbers.primaryPhone) {
        validation.phone.isValid = false;
        validation.phone.issues?.push('Missing primary phone number');
        validation.isConsistent = false;
      }

      if (!location.address.streetAddress) {
        validation.address.isValid = false;
        validation.address.issues?.push('Missing street address');
        validation.isConsistent = false;
      }

      return validation;
    } catch (error) {
      console.error('[GBPClient] Error validating NAP:', error);
      throw error;
    }
  }

  /**
   * Check NAP consistency across multiple sources
   */
  async crossPlatformNAPCheck(
    locationId: string,
    sources: Array<{ platform: string; name: string; address: string; phone: string }>
  ): Promise<{
    overallConsistency: number;
    gbpData: NAPValidation;
    inconsistencies: Array<{ platform: string; issues: string[] }>;
  }> {
    const gbpValidation = await this.validateNAP(locationId);
    const inconsistencies: Array<{ platform: string; issues: string[] }> = [];

    for (const source of sources) {
      const platformValidation = await this.validateNAP(locationId, {
        name: source.name,
        address: source.address,
        phone: source.phone
      });

      if (!platformValidation.isConsistent) {
        inconsistencies.push({
          platform: source.platform,
          issues: [
            ...platformValidation.name.issues || [],
            ...platformValidation.address.issues || [],
            ...platformValidation.phone.issues || []
          ]
        });
      }
    }

    const overallConsistency =
      inconsistencies.length === 0 ? 100 :
      ((sources.length - inconsistencies.length) / sources.length) * 100;

    return {
      overallConsistency,
      gbpData: gbpValidation,
      inconsistencies
    };
  }

  // Helper methods

  private parseLocation(data: any): GBPLocation {
    return {
      name: data.name,
      title: data.title,
      locationId: data.name.split('/').pop(),
      address: {
        streetAddress: data.storefrontAddress?.addressLines?.[0] || '',
        locality: data.storefrontAddress?.locality || '',
        region: data.storefrontAddress?.administrativeArea || '',
        postalCode: data.storefrontAddress?.postalCode || '',
        country: data.storefrontAddress?.regionCode || 'US'
      },
      phoneNumbers: {
        primaryPhone: data.phoneNumbers?.primaryPhone || '',
        additionalPhones: data.phoneNumbers?.additionalPhones || []
      },
      websiteUri: data.websiteUri,
      categories: data.categories || [],
      metadata: data.metadata
    };
  }

  private formatAddress(address: GBPLocation['address']): string {
    return `${address.streetAddress}, ${address.locality}, ${address.region} ${address.postalCode}`;
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Levenshtein distance-based similarity
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private getMockLocation(locationId: string): GBPLocation {
    return {
      name: `locations/${locationId}`,
      title: 'Germain Toyota of Naples',
      locationId: locationId,
      address: {
        streetAddress: '13315 Tamiami Trail North',
        locality: 'Naples',
        region: 'FL',
        postalCode: '34110',
        country: 'US'
      },
      phoneNumbers: {
        primaryPhone: '+1-239-643-1100',
        additionalPhones: []
      },
      websiteUri: 'https://www.germaintoyotanaples.com',
      categories: [
        { categoryId: 'gcid:car_dealer', displayName: 'Car Dealer' },
        { categoryId: 'gcid:toyota_dealer', displayName: 'Toyota Dealer' }
      ]
    };
  }
}

export default GBPClient;
