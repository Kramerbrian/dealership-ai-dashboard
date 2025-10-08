import * as cheerio from 'cheerio';
import { fetchHTML } from '../utils/html-fetcher';

export interface ZeroClickResult {
  score: number;
  hasFAQ: boolean;
  hasHowTo: boolean;
  hasArticle: boolean;
  faqCount: number;
  headingStructure: boolean;
}

export async function analyzeZeroClick(domain: string): Promise<number> {
  try {
    const result = await analyzeZeroClickDetailed(domain);
    return result.score;
  } catch (error) {
    console.error('Zero-Click analysis failed:', error);
    return 0;
  }
}

export async function analyzeZeroClickDetailed(
  domain: string
): Promise<ZeroClickResult> {
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
      // Ignore parse errors
    }
  });

  // Check for FAQ schema
  const hasFAQ = structuredData.some(
    data => data['@type'] === 'FAQPage' || 
            (Array.isArray(data['@graph']) && 
             data['@graph'].some((item: any) => item['@type'] === 'FAQPage'))
  );

  // Count FAQ questions
  let faqCount = 0;
  structuredData.forEach(data => {
    if (data['@type'] === 'FAQPage' && data.mainEntity) {
      faqCount += Array.isArray(data.mainEntity) ? data.mainEntity.length : 1;
    }
  });

  // Check for HowTo schema
  const hasHowTo = structuredData.some(
    data => data['@type'] === 'HowTo'
  );

  // Check for Article schema
  const hasArticle = structuredData.some(
    data => data['@type'] === 'Article' || data['@type'] === 'BlogPosting'
  );

  // Check heading structure (H1, H2, H3 hierarchy)
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  const headingStructure = h1Count === 1 && h2Count > 0 && h3Count > 0;

  // Check for meta descriptions
  const metaDescription = $('meta[name="description"]').attr('content');
  const hasMetaDescription = !!metaDescription && metaDescription.length > 50;

  // Calculate score
  let score = 0;

  // FAQ schema (30 points)
  if (hasFAQ) {
    score += 20;
    // Bonus for multiple FAQs
    score += Math.min(faqCount * 2, 10);
  }

  // HowTo schema (20 points)
  if (hasHowTo) score += 20;

  // Article schema (15 points)
  if (hasArticle) score += 15;

  // Good heading structure (20 points)
  if (headingStructure) score += 20;

  // Meta description (15 points)
  if (hasMetaDescription) score += 15;

  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    hasFAQ,
    hasHowTo,
    hasArticle,
    faqCount,
    headingStructure,
  };
}
