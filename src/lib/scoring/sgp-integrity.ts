import * as cheerio from 'cheerio';
import { fetchHTML } from '../utils/html-fetcher';

export interface SGPIntegrityResult {
  score: number;
  hasSchema: boolean;
  schemaTypes: string[];
  validationErrors: string[];
  completeness: number;
}

export async function analyzeSGPIntegrity(
  domain: string
): Promise<number> {
  try {
    const result = await analyzeSGPIntegrityDetailed(domain);
    return result.score;
  } catch (error) {
    console.error('SGP Integrity analysis failed:', error);
    return 0;
  }
}

export async function analyzeSGPIntegrityDetailed(
  domain: string
): Promise<SGPIntegrityResult> {
  const url = domain.startsWith('http') ? domain : `https://${domain}`;
  const html = await fetchHTML(url);
  const $ = cheerio.load(html);

  // Extract JSON-LD structured data
  const jsonLdScripts = $('script[type="application/ld+json"]');
  const structuredData: any[] = [];
  
  jsonLdScripts.each((_, element) => {
    try {
      const jsonData = JSON.parse($(element).html() || '{}');
      structuredData.push(jsonData);
    } catch (error) {
      console.error('Failed to parse JSON-LD:', error);
    }
  });

  // Check for LocalBusiness schema
  const hasLocalBusiness = structuredData.some(
    data => data['@type'] === 'LocalBusiness' || 
            data['@type'] === 'AutomotiveBusiness' ||
            data['@type'] === 'AutoDealer'
  );

  // Extract schema types
  const schemaTypes = structuredData
    .map(data => data['@type'])
    .filter(Boolean);

  // Validation errors
  const validationErrors: string[] = [];
  
  if (structuredData.length === 0) {
    validationErrors.push('No structured data found');
  }
  
  if (!hasLocalBusiness) {
    validationErrors.push('Missing LocalBusiness/AutoDealer schema');
  }

  // Check required fields for LocalBusiness
  const localBusiness = structuredData.find(
    data => data['@type'] === 'LocalBusiness' || 
            data['@type'] === 'AutomotiveBusiness' ||
            data['@type'] === 'AutoDealer'
  );

  const requiredFields = ['name', 'address', 'telephone', 'url'];
  const optionalFields = ['image', 'openingHours', 'priceRange', 'geo'];
  
  let completenessScore = 0;
  if (localBusiness) {
    // Required fields (60% weight)
    const hasRequired = requiredFields.filter(field => localBusiness[field]);
    completenessScore += (hasRequired.length / requiredFields.length) * 60;

    // Optional fields (40% weight)
    const hasOptional = optionalFields.filter(field => localBusiness[field]);
    completenessScore += (hasOptional.length / optionalFields.length) * 40;

    // Check for missing required fields
    requiredFields.forEach(field => {
      if (!localBusiness[field]) {
        validationErrors.push(`Missing required field: ${field}`);
      }
    });
  } else {
    validationErrors.push('No LocalBusiness schema found');
  }

  // Calculate overall score
  let score = 0;
  
  // Has structured data (30 points)
  if (structuredData.length > 0) score += 30;
  
  // Has LocalBusiness schema (30 points)
  if (hasLocalBusiness) score += 30;
  
  // Completeness (40 points)
  score += (completenessScore / 100) * 40;
  
  // Deduct for validation errors (max -20)
  score -= Math.min(validationErrors.length * 5, 20);
  
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    hasSchema: structuredData.length > 0,
    schemaTypes,
    validationErrors,
    completeness: Math.round(completenessScore),
  };
}
