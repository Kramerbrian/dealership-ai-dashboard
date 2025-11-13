/**
 * SEO Analyzer
 * Analyzes technical SEO factors for automotive dealerships
 */

import type { CheerioAPI } from 'cheerio';
import { extractJsonLd } from '../scraper/fetch-page';

export interface SEOAnalysis {
  score: number;
  signals: {
    hasAutoSchema: boolean;
    hasOrgSchema: boolean;
    hasLocalBusinessSchema: boolean;
    hasMetaDescription: boolean;
    hasOgTags: boolean;
    hasStructuredData: boolean;
    hasH1: boolean;
    hasMobileViewport: boolean;
    hasCanonical: boolean;
  };
  issues: string[];
  strengths: string[];
}

/**
 * Analyze SEO factors
 * Focuses on schema.org markup, meta tags, and automotive-specific SEO
 */
export function analyzeSEO($: CheerioAPI, url: string): SEOAnalysis {
  const jsonLdData = extractJsonLd($);
  const signals = {
    hasAutoSchema: false,
    hasOrgSchema: false,
    hasLocalBusinessSchema: false,
    hasMetaDescription: false,
    hasOgTags: false,
    hasStructuredData: jsonLdData.length > 0,
    hasH1: $('h1').length > 0,
    hasMobileViewport: false,
    hasCanonical: false,
  };

  const issues: string[] = [];
  const strengths: string[] = [];

  // Check for automotive dealer schema
  const hasAutoDealer = jsonLdData.some((ld) => {
    const type = Array.isArray(ld['@type']) ? ld['@type'] : [ld['@type']];
    return type.includes('AutoDealer') || type.includes('CarDealer');
  });
  signals.hasAutoSchema = hasAutoDealer;

  // Check for Organization schema
  const hasOrg = jsonLdData.some((ld) => {
    const type = Array.isArray(ld['@type']) ? ld['@type'] : [ld['@type']];
    return type.includes('Organization');
  });
  signals.hasOrgSchema = hasOrg;

  // Check for LocalBusiness schema
  const hasLocalBusiness = jsonLdData.some((ld) => {
    const type = Array.isArray(ld['@type']) ? ld['@type'] : [ld['@type']];
    return type.includes('LocalBusiness') || type.includes('AutomotiveBusiness');
  });
  signals.hasLocalBusinessSchema = hasLocalBusiness;

  // Meta description
  const metaDesc = $('meta[name="description"]').attr('content');
  signals.hasMetaDescription = !!metaDesc && metaDesc.length > 50;

  // Open Graph tags
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');
  signals.hasOgTags = !!(ogTitle || ogDesc);

  // Mobile viewport
  const viewport = $('meta[name="viewport"]').attr('content');
  signals.hasMobileViewport = !!viewport;

  // Canonical URL
  signals.hasCanonical = $('link[rel="canonical"]').length > 0;

  // Calculate score (0-100)
  let score = 0;
  const weights = {
    autoSchema: 25,
    localBusinessSchema: 20,
    structuredData: 15,
    metaDescription: 10,
    ogTags: 10,
    h1: 5,
    mobileViewport: 10,
    canonical: 5,
  };

  if (signals.hasAutoSchema) {
    score += weights.autoSchema;
    strengths.push('AutoDealer schema found');
  } else {
    issues.push('Missing AutoDealer schema.org markup');
  }

  if (signals.hasLocalBusinessSchema) {
    score += weights.localBusinessSchema;
    strengths.push('LocalBusiness schema found');
  } else {
    issues.push('Missing LocalBusiness schema');
  }

  if (signals.hasStructuredData) {
    score += weights.structuredData;
    strengths.push('Structured data (JSON-LD) present');
  } else {
    issues.push('No structured data found');
  }

  if (signals.hasMetaDescription) {
    score += weights.metaDescription;
  } else {
    issues.push('Missing or short meta description');
  }

  if (signals.hasOgTags) {
    score += weights.ogTags;
  } else {
    issues.push('Missing Open Graph tags');
  }

  if (signals.hasH1) {
    score += weights.h1;
  } else {
    issues.push('No H1 heading found');
  }

  if (signals.hasMobileViewport) {
    score += weights.mobileViewport;
  } else {
    issues.push('Missing mobile viewport meta tag');
  }

  if (signals.hasCanonical) {
    score += weights.canonical;
  } else {
    issues.push('Missing canonical URL');
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    signals,
    issues,
    strengths,
  };
}
