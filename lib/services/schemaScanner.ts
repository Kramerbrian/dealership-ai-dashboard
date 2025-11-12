/**
 * Real-Time Schema Scanner Service
 *
 * Crawls dealership websites to extract and validate JSON-LD schemas,
 * calculate E-E-A-T scores, and provide actionable recommendations.
 */

import * as cheerio from 'cheerio';

export interface SchemaType {
  type: string;
  valid: boolean;
  data: any;
  errors?: string[];
}

export interface PageScanResult {
  url: string;
  schemas: SchemaType[];
  hasSchema: boolean;
  schemaTypes: string[];
  errors: string[];
}

export interface WebsiteScanResult {
  domain: string;
  totalPages: number;
  pagesScanned: number;
  pagesWithSchema: number;
  schemaCoverage: number;
  schemaTypes: string[];
  missingSchemaTypes: string[];
  eeatScore: number;
  eeatSignals: {
    experience: number;
    expertise: number;
    authoritativeness: number;
    trustworthiness: number;
  };
  recommendations: string[];
  pageResults: PageScanResult[];
  scannedAt: Date;
}

/**
 * Extract JSON-LD schemas from HTML content
 */
export function extractSchemas(html: string): SchemaType[] {
  const $ = cheerio.load(html);
  const schemas: SchemaType[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    try {
      const content = $(element).html();
      if (!content) return;

      const data = JSON.parse(content);
      const type = data['@type'] || 'Unknown';

      schemas.push({
        type,
        valid: true,
        data,
      });
    } catch (error) {
      schemas.push({
        type: 'Invalid',
        valid: false,
        data: null,
        errors: [(error as Error).message],
      });
    }
  });

  return schemas;
}

/**
 * Validate schema against Schema.org standards
 */
export function validateSchema(schema: SchemaType): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!schema.data) {
    errors.push('Schema data is null or undefined');
    return { valid: false, errors };
  }

  // Check for required @context
  if (!schema.data['@context']) {
    errors.push('Missing required @context property');
  } else if (!schema.data['@context'].includes('schema.org')) {
    errors.push('@context should reference schema.org');
  }

  // Check for required @type
  if (!schema.data['@type']) {
    errors.push('Missing required @type property');
  }

  // Type-specific validations
  switch (schema.type) {
    case 'LocalBusiness':
    case 'AutoDealer':
      if (!schema.data.name) errors.push('Missing required "name" property');
      if (!schema.data.address) errors.push('Missing required "address" property');
      if (!schema.data.telephone) errors.push('Missing recommended "telephone" property');
      break;

    case 'Product':
      if (!schema.data.name) errors.push('Missing required "name" property');
      if (!schema.data.description) errors.push('Missing recommended "description" property');
      break;

    case 'Review':
      if (!schema.data.author) errors.push('Missing required "author" property');
      if (!schema.data.reviewRating) errors.push('Missing required "reviewRating" property');
      break;

    case 'FAQPage':
      if (!schema.data.mainEntity || !Array.isArray(schema.data.mainEntity)) {
        errors.push('FAQPage requires mainEntity array');
      }
      break;
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calculate E-E-A-T score based on detected signals
 */
export function calculateEEATScore(pageResults: PageScanResult[]): {
  overall: number;
  signals: {
    experience: number;
    expertise: number;
    authoritativeness: number;
    trustworthiness: number;
  };
} {
  let experienceScore = 0;
  let expertiseScore = 0;
  let authoritativenessScore = 0;
  let trustworthinessScore = 0;

  const allSchemas = pageResults.flatMap(p => p.schemas);

  // Experience: Reviews, testimonials, case studies
  const hasReviews = allSchemas.some(s => s.type === 'Review' || s.type === 'AggregateRating');
  const reviewCount = allSchemas.filter(s => s.type === 'Review').length;
  experienceScore = hasReviews ? Math.min(100, 60 + (reviewCount * 5)) : 40;

  // Expertise: Author credentials, certifications, awards
  const hasAuthor = allSchemas.some(s => s.data?.author);
  const hasOrganization = allSchemas.some(s => s.type === 'Organization' || s.type === 'LocalBusiness');
  expertiseScore = (hasAuthor ? 50 : 30) + (hasOrganization ? 30 : 0);

  // Authoritativeness: Citations, references, affiliations
  const hasLocalBusiness = allSchemas.some(s => s.type === 'LocalBusiness' || s.type === 'AutoDealer');
  const hasBreadcrumbs = allSchemas.some(s => s.type === 'BreadcrumbList');
  const hasStructuredData = allSchemas.length > 3;
  authoritativenessScore = (hasLocalBusiness ? 40 : 20) + (hasBreadcrumbs ? 20 : 0) + (hasStructuredData ? 20 : 10);

  // Trustworthiness: Contact info, privacy policy, secure connection
  const hasContactPoint = allSchemas.some(s => s.data?.contactPoint || s.data?.telephone);
  const hasAddress = allSchemas.some(s => s.data?.address);
  const hasSameAs = allSchemas.some(s => s.data?.sameAs); // Social media links
  trustworthinessScore = (hasContactPoint ? 35 : 20) + (hasAddress ? 35 : 20) + (hasSameAs ? 20 : 10);

  const overall = Math.round((experienceScore + expertiseScore + authoritativenessScore + trustworthinessScore) / 4);

  return {
    overall,
    signals: {
      experience: experienceScore,
      expertise: expertiseScore,
      authoritativeness: authoritativenessScore,
      trustworthiness: trustworthinessScore,
    },
  };
}

/**
 * Generate recommendations based on scan results
 */
export function generateRecommendations(result: Partial<WebsiteScanResult>): string[] {
  const recommendations: string[] = [];

  if (!result.schemaCoverage || result.schemaCoverage < 50) {
    recommendations.push('Critical: Less than 50% of pages have schema markup. Add JSON-LD to key pages.');
  } else if (result.schemaCoverage < 75) {
    recommendations.push('Add schema markup to more pages to reach 75% coverage target.');
  } else if (result.schemaCoverage < 90) {
    recommendations.push('Good progress! Add schema to remaining pages to reach 90% coverage.');
  }

  const schemaTypes = result.schemaTypes || [];
  const missingTypes: string[] = [];

  if (!schemaTypes.includes('LocalBusiness') && !schemaTypes.includes('AutoDealer')) {
    missingTypes.push('LocalBusiness or AutoDealer');
    recommendations.push('Add AutoDealer schema to homepage for better local SEO');
  }

  if (!schemaTypes.includes('Product')) {
    missingTypes.push('Product');
    recommendations.push('Add Product schema to vehicle inventory pages');
  }

  if (!schemaTypes.includes('Review') && !schemaTypes.includes('AggregateRating')) {
    missingTypes.push('Review/AggregateRating');
    recommendations.push('Implement Review schema to showcase customer testimonials');
  }

  if (!schemaTypes.includes('FAQPage')) {
    missingTypes.push('FAQPage');
    recommendations.push('Add FAQ schema to service pages for rich snippet eligibility');
  }

  if (!schemaTypes.includes('BreadcrumbList')) {
    missingTypes.push('BreadcrumbList');
    recommendations.push('Implement BreadcrumbList schema for better navigation visibility');
  }

  const eeat = result.eeatScore || 0;
  if (eeat < 70) {
    recommendations.push('E-E-A-T Score is low. Focus on adding author information and contact details.');
  }

  if (result.eeatSignals) {
    if (result.eeatSignals.experience < 60) {
      recommendations.push('Boost Experience score by adding more customer reviews and testimonials.');
    }
    if (result.eeatSignals.expertise < 60) {
      recommendations.push('Improve Expertise by adding author credentials and certifications.');
    }
    if (result.eeatSignals.authoritativeness < 60) {
      recommendations.push('Increase Authoritativeness with industry affiliations and citations.');
    }
    if (result.eeatSignals.trustworthiness < 60) {
      recommendations.push('Strengthen Trustworthiness by ensuring complete contact info and secure connections.');
    }
  }

  return recommendations;
}

/**
 * Scan a single page for schemas
 */
export async function scanPage(url: string): Promise<PageScanResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DealershipAI Schema Scanner/1.0',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      return {
        url,
        schemas: [],
        hasSchema: false,
        schemaTypes: [],
        errors: [`HTTP ${response.status}: ${response.statusText}`],
      };
    }

    const html = await response.text();
    const schemas = extractSchemas(html);

    // Validate each schema
    const validatedSchemas = schemas.map(schema => {
      const validation = validateSchema(schema);
      return {
        ...schema,
        valid: validation.valid,
        errors: validation.errors,
      };
    });

    const schemaTypes = [...new Set(validatedSchemas.map(s => s.type))];

    return {
      url,
      schemas: validatedSchemas,
      hasSchema: schemas.length > 0,
      schemaTypes,
      errors: [],
    };
  } catch (error) {
    return {
      url,
      schemas: [],
      hasSchema: false,
      schemaTypes: [],
      errors: [(error as Error).message],
    };
  }
}

/**
 * Scan entire website (limited to key pages for performance)
 */
export async function scanWebsite(domain: string, maxPages: number = 10): Promise<WebsiteScanResult> {
  const baseUrl = domain.startsWith('http') ? domain : `https://${domain}`;

  // Define key pages to scan
  const pagesToScan = [
    '/',
    '/inventory',
    '/new-inventory',
    '/used-inventory',
    '/service',
    '/parts',
    '/about',
    '/contact',
    '/reviews',
    '/specials',
  ].slice(0, maxPages);

  const scannedAt = new Date();
  const pageResults: PageScanResult[] = [];

  // Scan pages in parallel with concurrency limit
  const batchSize = 3;
  for (let i = 0; i < pagesToScan.length; i += batchSize) {
    const batch = pagesToScan.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(path => scanPage(`${baseUrl}${path}`))
    );
    pageResults.push(...batchResults);
  }

  const pagesWithSchema = pageResults.filter(p => p.hasSchema).length;
  const schemaCoverage = Math.round((pagesWithSchema / pageResults.length) * 100);

  const allSchemaTypes = [...new Set(pageResults.flatMap(p => p.schemaTypes))];

  const recommendedTypes = ['LocalBusiness', 'AutoDealer', 'Product', 'Review', 'FAQPage', 'BreadcrumbList', 'Organization'];
  const missingSchemaTypes = recommendedTypes.filter(t => !allSchemaTypes.includes(t));

  const eeatAnalysis = calculateEEATScore(pageResults);

  const result: WebsiteScanResult = {
    domain,
    totalPages: pagesToScan.length,
    pagesScanned: pageResults.length,
    pagesWithSchema,
    schemaCoverage,
    schemaTypes: allSchemaTypes,
    missingSchemaTypes,
    eeatScore: eeatAnalysis.overall,
    eeatSignals: eeatAnalysis.signals,
    recommendations: [],
    pageResults,
    scannedAt,
  };

  result.recommendations = generateRecommendations(result);

  return result;
}

/**
 * Quick scan for dashboard (lightweight, cached)
 */
export async function quickScan(domain: string): Promise<{
  schemaCoverage: number;
  eeatScore: number;
  status: 'healthy' | 'warning' | 'critical';
  trends: {
    coverage: 'up' | 'down' | 'stable';
    eeat: 'up' | 'down' | 'stable';
  };
  recommendations: string[];
}> {
  // For quick scans, just check homepage and 2-3 key pages
  const result = await scanWebsite(domain, 3);

  let status: 'healthy' | 'warning' | 'critical';
  if (result.schemaCoverage >= 90) status = 'healthy';
  else if (result.schemaCoverage >= 75) status = 'warning';
  else status = 'critical';

  return {
    schemaCoverage: result.schemaCoverage,
    eeatScore: result.eeatScore,
    status,
    trends: {
      coverage: 'stable', // Will be calculated from historical data later
      eeat: 'stable',
    },
    recommendations: result.recommendations.slice(0, 3), // Top 3 recommendations
  };
}
