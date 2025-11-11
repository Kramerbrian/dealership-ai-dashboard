// dAI SEO Intelligence Engine
// DealershipAI - Advanced Product Description Optimization

export interface ProductInput {
  name: string;
  description?: string;
  specifications?: Record<string, string>;
  usp?: string[]; // Unique Selling Points
  competitiveAdvantages?: string[];
  targetKeywords: string[];
  tone: 'professional' | 'casual' | 'premium' | 'friendly' | 'urgent';
  images?: string[]; // Image URLs
  reviews?: Array<{ rating: number; text: string }>;
  stockLevel?: 'in_stock' | 'low_stock' | 'out_of_stock';
  price?: number;
  category: string;
}

export interface SemanticIntent {
  keyword: string;
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  confidence: number;
  relatedKeywords: string[];
  buyerPersona: string;
}

export interface CompetitiveEdge {
  advantage: string;
  strength: number; // 0-1
  evidence: string[];
  keywords: string[];
}

export interface DescriptionVariant {
  id: string;
  title: string;
  description: string;
  metaDescription: string;
  bulletPoints: string[];
  altTexts: string[];
  keywords: string[];
  atiScore: number; // Algorithmic Trust Index
  clarityScore: number;
  conversionScore: number;
  seoScore: number;
}

/**
 * Analyze semantic intent for keywords
 */
export function analyzeSemanticIntent(
  keywords: string[],
  category: string
): SemanticIntent[] {
  // Mock implementation - in production, use transformer embeddings
  const intentMap: Record<string, SemanticIntent> = {
    'buy': { intent: 'transactional', confidence: 0.9, relatedKeywords: ['purchase', 'order'], buyerPersona: 'ready_to_buy' },
    'best': { intent: 'commercial', confidence: 0.8, relatedKeywords: ['top', 'quality'], buyerPersona: 'researching' },
    'how': { intent: 'informational', confidence: 0.9, relatedKeywords: ['guide', 'tutorial'], buyerPersona: 'learning' },
    'review': { intent: 'commercial', confidence: 0.8, relatedKeywords: ['rating', 'feedback'], buyerPersona: 'evaluating' },
    'compare': { intent: 'commercial', confidence: 0.7, relatedKeywords: ['vs', 'versus'], buyerPersona: 'comparing' }
  };
  
  return keywords.map(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    const matchedIntent = Object.entries(intentMap).find(([pattern]) => 
      lowerKeyword.includes(pattern)
    );
    
    if (matchedIntent) {
      return {
        keyword,
        intent: matchedIntent[1].intent,
        confidence: matchedIntent[1].confidence,
        relatedKeywords: matchedIntent[1].relatedKeywords,
        buyerPersona: matchedIntent[1].buyerPersona
      };
    }
    
    // Default to commercial intent for product keywords
    return {
      keyword,
      intent: 'commercial',
      confidence: 0.6,
      relatedKeywords: [],
      buyerPersona: 'browsing'
    };
  });
}

/**
 * Extract competitive advantages from USP and specifications
 */
export function extractCompetitiveEdges(
  product: ProductInput
): CompetitiveEdge[] {
  const edges: CompetitiveEdge[] = [];
  
  // Analyze USP
  if (product.usp) {
    product.usp.forEach(usp => {
      edges.push({
        advantage: usp,
        strength: 0.8,
        evidence: [usp],
        keywords: extractKeywordsFromText(usp)
      });
    });
  }
  
  // Analyze competitive advantages
  if (product.competitiveAdvantages) {
    product.competitiveAdvantages.forEach(adv => {
      edges.push({
        advantage: adv,
        strength: 0.9,
        evidence: [adv],
        keywords: extractKeywordsFromText(adv)
      });
    });
  }
  
  // Analyze specifications for technical advantages
  if (product.specifications) {
    Object.entries(product.specifications).forEach(([key, value]) => {
      if (isAdvantageousSpec(key, value)) {
        edges.push({
          advantage: `${key}: ${value}`,
          strength: 0.7,
          evidence: [`Specification: ${key} = ${value}`],
          keywords: [key.toLowerCase(), value.toLowerCase()]
        });
      }
    });
  }
  
  return edges;
}

/**
 * Generate dynamic keyword placement strategy
 */
export function generateKeywordStrategy(
  primaryKeywords: string[],
  secondaryKeywords: string[],
  textLength: number
): Array<{ keyword: string; position: number; type: 'primary' | 'secondary' }> {
  const strategy: Array<{ keyword: string; position: number; type: 'primary' | 'secondary' }> = [];
  
  // Primary keywords: title, first paragraph, conclusion
  primaryKeywords.forEach(keyword => {
    strategy.push({ keyword, position: 0, type: 'primary' }); // Title
    strategy.push({ keyword, position: Math.floor(textLength * 0.1), type: 'primary' }); // First paragraph
    strategy.push({ keyword, position: Math.floor(textLength * 0.8), type: 'primary' }); // Conclusion
  });
  
  // Secondary keywords: distributed throughout
  secondaryKeywords.forEach((keyword, index) => {
    const position = Math.floor((textLength * 0.2) + (index * textLength * 0.6) / secondaryKeywords.length);
    strategy.push({ keyword, position, type: 'secondary' });
  });
  
  return strategy.sort((a, b) => a.position - b.position);
}

/**
 * Generate conversion hooks based on product data
 */
export function generateConversionHooks(product: ProductInput): string[] {
  const hooks: string[] = [];
  
  // Stock-based urgency
  if (product.stockLevel === 'low_stock') {
    hooks.push('Limited stock available - order now to secure yours');
  }
  
  // Review-based social proof
  if (product.reviews && product.reviews.length > 0) {
    const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
    if (avgRating >= 4.5) {
      hooks.push(`Highly rated with ${avgRating.toFixed(1)} stars from satisfied customers`);
    }
  }
  
  // Price-based value
  if (product.price) {
    hooks.push('Exceptional value for premium quality');
  }
  
  // Category-specific hooks
  const categoryHooks: Record<string, string[]> = {
    'electronics': ['Latest technology', 'Cutting-edge features', 'Future-proof design'],
    'clothing': ['Trending style', 'Premium materials', 'Perfect fit guarantee'],
    'home': ['Transform your space', 'Premium quality', 'Lifetime durability'],
    'automotive': ['Professional grade', 'OEM quality', 'Performance tested']
  };
  
  const categorySpecific = categoryHooks[product.category] || ['Premium quality', 'Exceptional value'];
  hooks.push(...categorySpecific.slice(0, 2));
  
  return hooks;
}

/**
 * Calculate Algorithmic Trust Index for content
 */
export function calculateATIScore(
  title: string,
  description: string,
  specifications?: Record<string, string>
): number {
  let score = 50; // Base score
  
  // Factuality checks
  if (specifications && Object.keys(specifications).length > 0) {
    score += 15; // Has concrete specifications
  }
  
  // Transparency checks
  if (description.includes('guarantee') || description.includes('warranty')) {
    score += 10;
  }
  
  if (description.includes('certified') || description.includes('tested')) {
    score += 10;
  }
  
  // E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
  const expertiseWords = ['professional', 'expert', 'specialist', 'certified', 'qualified'];
  const hasExpertise = expertiseWords.some(word => 
    description.toLowerCase().includes(word)
  );
  
  if (hasExpertise) {
    score += 10;
  }
  
  // Avoid over-claiming
  const overClaimWords = ['best', 'perfect', 'amazing', 'incredible'];
  const overClaimCount = overClaimWords.reduce((count, word) => 
    count + (description.toLowerCase().split(word).length - 1), 0
  );
  
  if (overClaimCount > 3) {
    score -= 10; // Penalize excessive superlatives
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate Clarity Intelligence Score
 */
export function calculateClarityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  
  if (sentences.length === 0 || words.length === 0) return 0;
  
  const avgSentenceLength = words.length / sentences.length;
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // Clarity factors
  let score = 100;
  
  // Penalize very long sentences
  if (avgSentenceLength > 20) {
    score -= 20;
  }
  
  // Penalize very long words
  if (avgWordLength > 6) {
    score -= 15;
  }
  
  // Reward active voice indicators
  const activeVoiceWords = ['creates', 'builds', 'improves', 'enhances', 'delivers'];
  const hasActiveVoice = activeVoiceWords.some(word => 
    text.toLowerCase().includes(word)
  );
  
  if (hasActiveVoice) {
    score += 10;
  }
  
  // Reward concrete language
  const concreteWords = ['specific', 'exact', 'precise', 'detailed', 'concrete'];
  const hasConcreteLanguage = concreteWords.some(word => 
    text.toLowerCase().includes(word)
  );
  
  if (hasConcreteLanguage) {
    score += 5;
  }
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Generate A/B test variants
 */
export function generateABVariants(
  product: ProductInput,
  baseDescription: string
): DescriptionVariant[] {
  const variants: DescriptionVariant[] = [];
  
  // Variant 1: Feature-focused
  const featureVariant: DescriptionVariant = {
    id: 'feature-focused',
    title: `${product.name} - Premium ${product.category}`,
    description: baseDescription,
    metaDescription: `${product.name} features premium quality and exceptional performance. ${product.usp?.[0] || 'Discover the difference.'}`,
    bulletPoints: product.usp || [],
    altTexts: [],
    keywords: product.targetKeywords,
    atiScore: calculateATIScore(`${product.name} - Premium ${product.category}`, baseDescription, product.specifications),
    clarityScore: calculateClarityScore(baseDescription),
    conversionScore: 75,
    seoScore: 80
  };
  
  // Variant 2: Benefit-focused
  const benefitVariant: DescriptionVariant = {
    id: 'benefit-focused',
    title: `Transform Your Experience with ${product.name}`,
    description: baseDescription.replace(/features/g, 'benefits').replace(/includes/g, 'delivers'),
    metaDescription: `Experience the benefits of ${product.name}. ${product.competitiveAdvantages?.[0] || 'Quality you can trust.'}`,
    bulletPoints: product.competitiveAdvantages || [],
    altTexts: [],
    keywords: product.targetKeywords,
    atiScore: calculateATIScore(`Transform Your Experience with ${product.name}`, baseDescription, product.specifications),
    clarityScore: calculateClarityScore(baseDescription),
    conversionScore: 85,
    seoScore: 75
  };
  
  // Variant 3: Problem-solution focused
  const problemSolutionVariant: DescriptionVariant = {
    id: 'problem-solution',
    title: `Solve Your ${product.category} Needs with ${product.name}`,
    description: `Tired of subpar ${product.category}? ${product.name} solves your problems with ${product.usp?.[0] || 'superior quality'}. ${baseDescription}`,
    metaDescription: `Stop settling for less. ${product.name} delivers the ${product.category} solution you need.`,
    bulletPoints: [`Solves common ${product.category} problems`, ...(product.usp || [])],
    altTexts: [],
    keywords: product.targetKeywords,
    atiScore: calculateATIScore(`Solve Your ${product.category} Needs with ${product.name}`, baseDescription, product.specifications),
    clarityScore: calculateClarityScore(baseDescription),
    conversionScore: 80,
    seoScore: 85
  };
  
  variants.push(featureVariant, benefitVariant, problemSolutionVariant);
  
  return variants;
}

// Helper functions
function extractKeywordsFromText(text: string): string[] {
  return text.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5);
}

function isAdvantageousSpec(key: string, value: string): boolean {
  const advantageIndicators = ['premium', 'high', 'advanced', 'professional', 'certified', 'tested'];
  const keyLower = key.toLowerCase();
  const valueLower = value.toLowerCase();
  
  return advantageIndicators.some(indicator => 
    keyLower.includes(indicator) || valueLower.includes(indicator)
  );
}
