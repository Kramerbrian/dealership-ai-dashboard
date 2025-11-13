/**
 * AEO (Answer Engine Optimization) Analyzer
 * Analyzes content quality and AI-friendliness for LLMs and answer engines
 */

import type { CheerioAPI } from 'cheerio';
import { extractJsonLd } from '../scraper/fetch-page';

export interface AEOAnalysis {
  score: number;
  signals: {
    hasFAQSchema: boolean;
    hasQAContent: boolean;
    hasServicePages: boolean;
    hasDetailedContent: boolean;
    hasContactInfo: boolean;
    hasInventoryInfo: boolean;
    avgSentenceLength: number;
    paragraphCount: number;
  };
  issues: string[];
  strengths: string[];
  contentQuality: {
    wordCount: number;
    hasQuestions: number;
    hasAnswers: number;
    readabilityScore: number;
  };
}

/**
 * Analyze AEO factors
 * Focuses on content that AI models can understand and extract
 */
export function analyzeAEO($: CheerioAPI): AEOAnalysis {
  const jsonLdData = extractJsonLd($);
  const pageText = $('body').text();
  const issues: string[] = [];
  const strengths: string[] = [];

  // Check for FAQ schema
  const hasFAQSchema = jsonLdData.some((ld) => {
    const type = Array.isArray(ld['@type']) ? ld['@type'] : [ld['@type']];
    return type.includes('FAQPage') || ld.mainEntity?.['@type'] === 'Question';
  });

  // Detect Q&A patterns in content
  const questionPatterns = /\b(what|who|where|when|why|how|do|does|can|is|are)\b[^.?!]*\?/gi;
  const questions = pageText.match(questionPatterns) || [];
  const hasQAContent = questions.length >= 3;

  // Check for service-related pages/content
  const serviceKeywords = [
    'service',
    'maintenance',
    'repair',
    'oil change',
    'inspection',
    'warranty',
    'parts',
    'financing',
    'trade-in',
    'schedule',
  ];
  const hasServicePages = serviceKeywords.some((keyword) =>
    pageText.toLowerCase().includes(keyword)
  );

  // Analyze content depth
  const paragraphs = $('p').length;
  const wordCount = pageText.split(/\s+/).length;
  const hasDetailedContent = wordCount > 500 && paragraphs > 5;

  // Check for contact information
  const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
  const hasPhone = phoneRegex.test(pageText);
  const hasEmail = emailRegex.test(pageText);
  const hasContactInfo = hasPhone || hasEmail;

  // Check for inventory/vehicle information
  const inventoryKeywords = ['inventory', 'vehicles', 'stock', 'available', 'certified pre-owned'];
  const hasInventoryInfo = inventoryKeywords.some((kw) =>
    pageText.toLowerCase().includes(kw)
  );

  // Calculate readability (simplified Flesch-Kincaid approximation)
  const sentences = pageText.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const avgSentenceLength = sentences.length > 0 ? wordCount / sentences.length : 0;
  const readabilityScore = avgSentenceLength < 20 ? 80 : avgSentenceLength < 30 ? 60 : 40;

  const signals = {
    hasFAQSchema,
    hasQAContent,
    hasServicePages,
    hasDetailedContent,
    hasContactInfo,
    hasInventoryInfo,
    avgSentenceLength: Math.round(avgSentenceLength),
    paragraphCount: paragraphs,
  };

  // Calculate score (0-100)
  let score = 0;
  const weights = {
    faqSchema: 25,
    qaContent: 20,
    detailedContent: 20,
    servicePages: 15,
    contactInfo: 10,
    inventoryInfo: 10,
  };

  if (hasFAQSchema) {
    score += weights.faqSchema;
    strengths.push('FAQ schema markup found');
  } else {
    issues.push('Missing FAQ schema (helps AI extract Q&A)');
  }

  if (hasQAContent) {
    score += weights.qaContent;
    strengths.push(`Found ${questions.length} question-answer pairs`);
  } else {
    issues.push('Limited Q&A content for AI extraction');
  }

  if (hasDetailedContent) {
    score += weights.detailedContent;
    strengths.push('Sufficient content depth for AI understanding');
  } else {
    issues.push('Content too sparse for AI comprehension');
  }

  if (hasServicePages) {
    score += weights.servicePages;
    strengths.push('Service information available');
  } else {
    issues.push('Missing service information');
  }

  if (hasContactInfo) {
    score += weights.contactInfo;
  } else {
    issues.push('Contact information not clearly visible');
  }

  if (hasInventoryInfo) {
    score += weights.inventoryInfo;
  } else {
    issues.push('Inventory information unclear');
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    signals,
    issues,
    strengths,
    contentQuality: {
      wordCount,
      hasQuestions: questions.length,
      hasAnswers: hasQAContent ? Math.floor(questions.length * 0.8) : 0,
      readabilityScore,
    },
  };
}
