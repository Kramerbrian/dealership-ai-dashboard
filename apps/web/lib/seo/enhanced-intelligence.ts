// Enhanced dAI SEO Intelligence Engine
// DealershipAI - Complete Product Description Optimization Suite

import { 
  analyzeSemanticIntent,
  extractCompetitiveEdges,
  generateKeywordStrategy,
  generateConversionHooks,
  generateABVariants,
  calculateATIScore,
  calculateClarityScore,
  ProductInput,
  SemanticIntent,
  CompetitiveEdge,
  DescriptionVariant
} from '@/lib/seo/intelligence';

import { 
  analyzeBrandVoice, 
  adaptToBrandVoice, 
  generateToneConsistentDescription,
  BrandVoiceProfile,
  ToneAdaptation
} from '@/lib/seo/brand-voice';

import { 
  analyzeProductImages, 
  generateVisionInsights, 
  generateSEOAltText,
  ImageAnalysis,
  VisionInsights
} from '@/lib/seo/vision-analyzer';

import { 
  localizeKeywords, 
  generateLocalizedContent, 
  getMarketInsights,
  LocalizedKeywords,
  LocalizedContent,
  MarketInsights
} from '@/lib/seo/localization';

export interface EnhancedProductInput extends ProductInput {
  brandVoice?: BrandVoiceProfile;
  targetLocales?: string[];
  brandSamples?: string[]; // Sample brand text for voice analysis
}

export interface EnhancedDescriptionVariant extends DescriptionVariant {
  brandConsistency: {
    score: number;
    adaptations: ToneAdaptation;
  };
  visionInsights: {
    altTexts: string[];
    imageKeywords: string[];
    visualFeatures: string[];
  };
  localization: {
    primaryLocale: LocalizedContent;
    additionalLocales: LocalizedContent[];
  };
  marketInsights: MarketInsights[];
}

export interface ComprehensiveAnalysis {
  semanticIntents: SemanticIntent[];
  competitiveEdges: CompetitiveEdge[];
  conversionHooks: string[];
  brandVoice: BrandVoiceProfile;
  visionInsights: VisionInsights;
  marketInsights: MarketInsights[];
  variants: EnhancedDescriptionVariant[];
  recommendations: {
    bestVariant: string;
    topMarkets: string[];
    optimizationTips: string[];
    brandConsistencyScore: number;
    globalOpportunityScore: number;
  };
}

/**
 * Generate comprehensive SEO analysis with all advanced features
 */
export async function generateComprehensiveAnalysis(
  product: EnhancedProductInput
): Promise<ComprehensiveAnalysis> {
  // 1. Analyze brand voice
  const brandVoice = product.brandVoice || await analyzeBrandVoiceFromSamples(
    product.brandSamples || [],
    'default-tenant',
    'Brand Voice'
  );
  
  // 2. Analyze semantic intent
  const semanticIntents = analyzeSemanticIntent(product.targetKeywords, product.category);
  
  // 3. Extract competitive edges
  const competitiveEdges = extractCompetitiveEdges(product);
  
  // 4. Generate conversion hooks
  const conversionHooks = generateConversionHooks(product);
  
  // 5. Analyze product images
  const imageAnalyses = await analyzeProductImages(product.images || [], product.category);
  const visionInsights = generateVisionInsights(imageAnalyses);
  
  // 6. Get market insights
  const targetLocales = product.targetLocales || ['en-US', 'en-GB', 'de-DE', 'fr-FR'];
  const marketInsights = getMarketInsights(targetLocales, product.category);
  
  // 7. Generate enhanced variants
  const variants = await generateEnhancedVariants(product, brandVoice, visionInsights, targetLocales);
  
  // 8. Calculate comprehensive recommendations
  const recommendations = calculateComprehensiveRecommendations(
    variants,
    marketInsights,
    brandVoice
  );
  
  return {
    semanticIntents,
    competitiveEdges,
    conversionHooks,
    brandVoice,
    visionInsights,
    marketInsights,
    variants,
    recommendations
  };
}

/**
 * Generate enhanced variants with all features
 */
async function generateEnhancedVariants(
  product: EnhancedProductInput,
  brandVoice: BrandVoiceProfile,
  visionInsights: VisionInsights,
  targetLocales: string[]
): Promise<EnhancedDescriptionVariant[]> {
  const baseVariants = generateABVariants(product, product.description || '');
  const enhancedVariants: EnhancedDescriptionVariant[] = [];
  
  for (const variant of baseVariants) {
    // Apply brand voice consistency
    const brandAdaptation = adaptToBrandVoice(variant.description, brandVoice);
    
    // Generate vision-enhanced alt texts
    const altTexts = visionInsights.seoKeywords.map(keyword => 
      generateSEOAltText(visionInsights.primaryFeatures, product.name, product.category, [keyword])
    );
    
    // Generate localized content
    const localizedContent = generateLocalizedContent(
      {
        title: variant.title,
        description: variant.description,
        metaDescription: variant.metaDescription,
        bulletPoints: variant.bulletPoints,
        keywords: variant.keywords
      },
      targetLocales,
      product.category
    );
    
    const primaryLocale = localizedContent.find(l => l.locale === 'en-US') || localizedContent[0];
    const additionalLocales = localizedContent.filter(l => l.locale !== primaryLocale.locale);
    
    // Get market insights for this variant
    const variantMarketInsights = getMarketInsights(targetLocales, product.category);
    
    const enhancedVariant: EnhancedDescriptionVariant = {
      ...variant,
      brandConsistency: {
        score: brandAdaptation.consistencyScore,
        adaptations: brandAdaptation
      },
      visionInsights: {
        altTexts,
        imageKeywords: visionInsights.seoKeywords,
        visualFeatures: visionInsights.primaryFeatures.map(f => f.name)
      },
      localization: {
        primaryLocale,
        additionalLocales
      },
      marketInsights: variantMarketInsights
    };
    
    enhancedVariants.push(enhancedVariant);
  }
  
  return enhancedVariants;
}

/**
 * Analyze brand voice from sample texts
 */
async function analyzeBrandVoiceFromSamples(
  samples: string[],
  tenantId: string,
  brandName: string
): Promise<BrandVoiceProfile> {
  if (samples.length === 0) {
    // Return default brand voice
    return {
      id: crypto.randomUUID(),
      tenantId,
      name: brandName,
      tone: 'professional',
      personality: {
        trust: 0.7,
        excitement: 0.5,
        urgency: 0.3,
        sophistication: 0.6
      },
      vocabulary: {
        preferred: ['quality', 'premium', 'reliable', 'innovative'],
        avoided: ['cheap', 'basic', 'simple'],
        industry: ['technology', 'innovation', 'performance']
      },
      sentenceStructure: {
        avgLength: 15,
        complexity: 'moderate',
        voice: 'active'
      },
      examples: samples,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
  
  return analyzeBrandVoice(samples, tenantId, brandName);
}

/**
 * Calculate comprehensive recommendations
 */
function calculateComprehensiveRecommendations(
  variants: EnhancedDescriptionVariant[],
  marketInsights: MarketInsights[],
  brandVoice: BrandVoiceProfile
) {
  // Find best variant
  const bestVariant = variants.reduce((best, current) => {
    const bestScore = (best.atiScore + best.clarityScore + best.conversionScore + best.seoScore + best.brandConsistency.score) / 5;
    const currentScore = (current.atiScore + current.clarityScore + current.conversionScore + current.seoScore + current.brandConsistency.score) / 5;
    return currentScore > bestScore ? current : best;
  });
  
  // Find top markets
  const topMarkets = marketInsights
    .sort((a, b) => b.opportunity - a.opportunity)
    .slice(0, 3)
    .map(m => m.locale);
  
  // Generate optimization tips
  const optimizationTips = generateOptimizationTips(variants, brandVoice);
  
  // Calculate brand consistency score
  const brandConsistencyScore = variants.reduce((sum, v) => sum + v.brandConsistency.score, 0) / variants.length;
  
  // Calculate global opportunity score
  const globalOpportunityScore = marketInsights.reduce((sum, m) => sum + m.opportunity, 0) / marketInsights.length;
  
  return {
    bestVariant: bestVariant.id,
    topMarkets,
    optimizationTips,
    brandConsistencyScore,
    globalOpportunityScore
  };
}

/**
 * Generate optimization tips
 */
function generateOptimizationTips(
  variants: EnhancedDescriptionVariant[],
  brandVoice: BrandVoiceProfile
): string[] {
  const tips: string[] = [];
  
  // Brand consistency tips
  if (brandVoice.personality.trust < 0.7) {
    tips.push('Increase trust-building language to match brand voice');
  }
  
  if (brandVoice.personality.excitement < 0.5) {
    tips.push('Add more engaging language to boost excitement');
  }
  
  // SEO tips
  const avgSEOScore = variants.reduce((sum, v) => sum + v.seoScore, 0) / variants.length;
  if (avgSEOScore < 80) {
    tips.push('Optimize keyword placement and density for better SEO performance');
  }
  
  // Conversion tips
  const avgConversionScore = variants.reduce((sum, v) => sum + v.conversionScore, 0) / variants.length;
  if (avgConversionScore < 80) {
    tips.push('Add more conversion-focused language and psychological triggers');
  }
  
  // Vision tips
  const hasVisionInsights = variants.some(v => v.visionInsights.altTexts.length > 0);
  if (hasVisionInsights) {
    tips.push('Leverage visual features in descriptions for better image SEO');
  }
  
  // Localization tips
  const hasLocalization = variants.some(v => v.localization.additionalLocales.length > 0);
  if (hasLocalization) {
    tips.push('Expand to additional markets for increased global reach');
  }
  
  return tips;
}

/**
 * Generate tone-consistent description with all features
 */
export function generateToneConsistentDescriptionWithFeatures(
  product: EnhancedProductInput,
  brandVoice: BrandVoiceProfile,
  visionInsights: VisionInsights,
  targetLocale: string = 'en-US'
): string {
  // Generate base description
  const baseDescription = generateToneConsistentDescription(
    {
      name: product.name,
      features: product.usp || [],
      benefits: product.competitiveAdvantages || [],
      category: product.category
    },
    brandVoice,
    'benefit-focused'
  );
  
  // Add vision insights
  const visualFeatures = visionInsights.primaryFeatures
    .slice(0, 2)
    .map(f => f.name)
    .join(' and ');
  
  if (visualFeatures) {
    const enhancedDescription = `${baseDescription} Visually featuring ${visualFeatures}.`;
    return enhancedDescription;
  }
  
  return baseDescription;
}

/**
 * Get comprehensive SEO score
 */
export function getComprehensiveSEOScore(variant: EnhancedDescriptionVariant): number {
  const scores = [
    variant.atiScore,
    variant.clarityScore,
    variant.conversionScore,
    variant.seoScore,
    variant.brandConsistency.score,
    variant.localization.primaryLocale.adaptationScore
  ];
  
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * Export all enhanced features for use in other modules
 */
export {
  analyzeBrandVoice,
  adaptToBrandVoice,
  generateToneConsistentDescription,
  analyzeProductImages,
  generateVisionInsights,
  generateSEOAltText,
  localizeKeywords,
  generateLocalizedContent,
  getMarketInsights
};
