/**
 * GEO (Geographic/Local Search) Analyzer
 * Analyzes local SEO factors and NAP consistency
 */

import type { CheerioAPI } from 'cheerio';
import { extractJsonLd, extractNAP } from '../scraper/fetch-page';

export interface GEOAnalysis {
  score: number;
  signals: {
    hasLocalBusinessSchema: boolean;
    hasNAPData: boolean;
    hasAddressSchema: boolean;
    hasGeoCoordinates: boolean;
    hasOpeningHours: boolean;
    hasAreaServed: boolean;
  };
  location: {
    name: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    phone: string | null;
    lat: number | null;
    lng: number | null;
  };
  issues: string[];
  strengths: string[];
}

/**
 * Extract location from LocalBusiness schema
 */
function extractLocationFromSchema(jsonLdData: any[]): {
  name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
} {
  for (const ld of jsonLdData) {
    const types = Array.isArray(ld['@type']) ? ld['@type'] : [ld['@type']];
    const isLocalBusiness =
      types.includes('LocalBusiness') ||
      types.includes('AutomotiveBusiness') ||
      types.includes('AutoDealer') ||
      types.includes('CarDealer');

    if (isLocalBusiness) {
      const address = ld.address || {};
      const geo = ld.geo || {};

      return {
        name: ld.name || null,
        address: address.streetAddress || null,
        city: address.addressLocality || null,
        state: address.addressRegion || null,
        phone: ld.telephone || null,
        lat: geo.latitude ? parseFloat(geo.latitude) : null,
        lng: geo.longitude ? parseFloat(geo.longitude) : null,
      };
    }
  }

  return {
    name: null,
    address: null,
    city: null,
    state: null,
    phone: null,
    lat: null,
    lng: null,
  };
}

/**
 * Analyze GEO/Local SEO factors
 */
export function analyzeGEO($: CheerioAPI): GEOAnalysis {
  const jsonLdData = extractJsonLd($);
  const napData = extractNAP($);
  const schemaLocation = extractLocationFromSchema(jsonLdData);
  const issues: string[] = [];
  const strengths: string[] = [];

  // Merge location data (prioritize schema)
  const location = {
    name: schemaLocation.name || napData.name,
    address: schemaLocation.address || napData.address,
    city: schemaLocation.city || napData.city,
    state: schemaLocation.state || napData.state,
    phone: schemaLocation.phone || napData.phone,
    lat: schemaLocation.lat,
    lng: schemaLocation.lng,
  };

  // Check signals
  const hasLocalBusinessSchema = jsonLdData.some((ld) => {
    const types = Array.isArray(ld['@type']) ? ld['@type'] : [ld['@type']];
    return (
      types.includes('LocalBusiness') ||
      types.includes('AutomotiveBusiness') ||
      types.includes('AutoDealer') ||
      types.includes('CarDealer')
    );
  });

  const hasNAPData = !!(location.name && location.phone);

  const hasAddressSchema = jsonLdData.some((ld) => {
    return ld.address?.['@type'] === 'PostalAddress';
  });

  const hasGeoCoordinates = !!(location.lat && location.lng);

  const hasOpeningHours = jsonLdData.some((ld) => {
    return ld.openingHours || ld.openingHoursSpecification;
  });

  const hasAreaServed = jsonLdData.some((ld) => {
    return ld.areaServed;
  });

  const signals = {
    hasLocalBusinessSchema,
    hasNAPData,
    hasAddressSchema,
    hasGeoCoordinates,
    hasOpeningHours,
    hasAreaServed,
  };

  // Calculate score (0-100)
  let score = 0;
  const weights = {
    localBusinessSchema: 30,
    napData: 25,
    addressSchema: 15,
    geoCoordinates: 15,
    openingHours: 10,
    areaServed: 5,
  };

  if (hasLocalBusinessSchema) {
    score += weights.localBusinessSchema;
    strengths.push('LocalBusiness schema found');
  } else {
    issues.push('Missing LocalBusiness schema.org markup');
  }

  if (hasNAPData) {
    score += weights.napData;
    strengths.push('NAP (Name, Address, Phone) data present');
  } else {
    issues.push('NAP data incomplete or missing');
  }

  if (hasAddressSchema) {
    score += weights.addressSchema;
    strengths.push('Structured address (PostalAddress) found');
  } else {
    issues.push('Missing PostalAddress schema');
  }

  if (hasGeoCoordinates) {
    score += weights.geoCoordinates;
    strengths.push('Geographic coordinates (lat/lng) found');
  } else {
    issues.push('Missing geographic coordinates in schema');
  }

  if (hasOpeningHours) {
    score += weights.openingHours;
    strengths.push('Opening hours data found');
  } else {
    issues.push('Missing opening hours schema');
  }

  if (hasAreaServed) {
    score += weights.areaServed;
  } else {
    issues.push('Missing areaServed property');
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    signals,
    location,
    issues,
    strengths,
  };
}
