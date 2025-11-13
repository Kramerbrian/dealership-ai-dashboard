// AI Vision Product Tagger & Image Analysis
// DealershipAI - Intelligent Image-to-Text SEO Enhancement

export interface ImageAnalysis {
  id: string;
  url: string;
  features: ProductFeature[];
  altText: string;
  captions: string[];
  keywords: string[];
  confidence: number;
  analyzedAt: string;
}

export interface ProductFeature {
  name: string;
  description: string;
  category: 'material' | 'color' | 'texture' | 'style' | 'function' | 'brand' | 'size';
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface VisionInsights {
  primaryFeatures: ProductFeature[];
  materials: ProductFeature[];
  colors: ProductFeature[];
  textures: ProductFeature[];
  styles: ProductFeature[];
  functions: ProductFeature[];
  seoKeywords: string[];
  altTextSuggestions: string[];
  captionSuggestions: string[];
}

/**
 * Analyze product images for SEO enhancement
 */
export async function analyzeProductImages(
  imageUrls: string[],
  productCategory: string
): Promise<ImageAnalysis[]> {
  const analyses: ImageAnalysis[] = [];
  
  for (const url of imageUrls) {
    try {
      const analysis = await analyzeSingleImage(url, productCategory);
      analyses.push(analysis);
    } catch (error) {
      console.error(`Failed to analyze image ${url}:`, error);
      // Create fallback analysis
      analyses.push(createFallbackAnalysis(url, productCategory));
    }
  }
  
  return analyses;
}

/**
 * Analyze a single image
 */
async function analyzeSingleImage(
  url: string,
  category: string
): Promise<ImageAnalysis> {
  // Mock implementation - in production, integrate with actual vision API
  const mockFeatures = generateMockFeatures(category);
  const altText = generateAltText(mockFeatures, category);
  const captions = generateCaptions(mockFeatures, category);
  const keywords = extractKeywords(mockFeatures, category);
  
  return {
    id: crypto.randomUUID(),
    url,
    features: mockFeatures,
    altText,
    captions,
    keywords,
    confidence: 0.85,
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Generate comprehensive vision insights
 */
export function generateVisionInsights(analyses: ImageAnalysis[]): VisionInsights {
  const allFeatures = analyses.flatMap(analysis => analysis.features);
  
  const primaryFeatures = allFeatures
    .filter(f => f.confidence > 0.8)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
  
  const materials = allFeatures.filter(f => f.category === 'material');
  const colors = allFeatures.filter(f => f.category === 'color');
  const textures = allFeatures.filter(f => f.category === 'texture');
  const styles = allFeatures.filter(f => f.category === 'style');
  const functions = allFeatures.filter(f => f.category === 'function');
  
  const seoKeywords = [
    ...new Set(analyses.flatMap(analysis => analysis.keywords))
  ];
  
  const altTextSuggestions = generateAltTextSuggestions(allFeatures);
  const captionSuggestions = generateCaptionSuggestions(allFeatures);
  
  return {
    primaryFeatures,
    materials,
    colors,
    textures,
    styles,
    functions,
    seoKeywords,
    altTextSuggestions,
    captionSuggestions
  };
}

/**
 * Generate SEO-optimized alt text
 */
export function generateSEOAltText(
  features: ProductFeature[],
  productName: string,
  category: string,
  keywords: string[]
): string {
  const primaryFeatures = features
    .filter(f => f.confidence > 0.7)
    .slice(0, 3)
    .map(f => f.name)
    .join(', ');
  
  const primaryKeyword = keywords[0] || category;
  
  // Alt text should be descriptive, keyword-rich, and under 125 characters
  const baseAlt = `${productName} - ${primaryKeyword}`;
  const featureText = primaryFeatures ? ` featuring ${primaryFeatures}` : '';
  
  let altText = baseAlt + featureText;
  
  // Ensure it's under 125 characters
  if (altText.length > 125) {
    altText = `${productName} - ${primaryKeyword} with ${primaryFeatures.split(',')[0]}`;
  }
  
  return altText;
}

/**
 * Generate lifestyle captions
 */
export function generateLifestyleCaptions(
  features: ProductFeature[],
  category: string
): string[] {
  const captions: string[] = [];
  
  // Material-based captions
  const materials = features.filter(f => f.category === 'material');
  if (materials.length > 0) {
    captions.push(`Crafted from premium ${materials[0].name} for lasting quality`);
  }
  
  // Style-based captions
  const styles = features.filter(f => f.category === 'style');
  if (styles.length > 0) {
    captions.push(`${styles[0].name} design meets modern functionality`);
  }
  
  // Function-based captions
  const functions = features.filter(f => f.category === 'function');
  if (functions.length > 0) {
    captions.push(`Perfect for ${functions[0].description.toLowerCase()}`);
  }
  
  // Category-specific captions
  const categoryCaptions: Record<string, string[]> = {
    electronics: [
      'Advanced technology for modern living',
      'Cutting-edge features for tech enthusiasts',
      'Smart design for connected lifestyles'
    ],
    clothing: [
      'Style that moves with you',
      'Fashion-forward design for everyday wear',
      'Comfort meets contemporary style'
    ],
    home: [
      'Transform your space with premium quality',
      'Home decor that reflects your style',
      'Elevate your living environment'
    ],
    automotive: [
      'Professional grade automotive solutions',
      'Built for performance and reliability',
      'Engineered for automotive excellence'
    ]
  };
  
  const specificCaptions = categoryCaptions[category] || [
    'Quality craftsmanship for discerning customers',
    'Premium materials for superior performance'
  ];
  
  captions.push(...specificCaptions.slice(0, 2));
  
  return captions;
}

/**
 * Extract SEO keywords from visual features
 */
export function extractVisualKeywords(features: ProductFeature[]): string[] {
  const keywords: string[] = [];
  
  features.forEach(feature => {
    // Add feature name
    keywords.push(feature.name);
    
    // Add feature description words
    const descWords = feature.description
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 3);
    keywords.push(...descWords);
    
    // Add category-specific keywords
    switch (feature.category) {
      case 'material':
        keywords.push(`${feature.name} material`, `${feature.name} construction`);
        break;
      case 'color':
        keywords.push(`${feature.name} color`, `${feature.name} finish`);
        break;
      case 'texture':
        keywords.push(`${feature.name} texture`, `${feature.name} surface`);
        break;
      case 'style':
        keywords.push(`${feature.name} style`, `${feature.name} design`);
        break;
      case 'function':
        keywords.push(`${feature.name} function`, `${feature.name} feature`);
        break;
    }
  });
  
  return [...new Set(keywords)];
}

// Helper functions
function generateMockFeatures(category: string): ProductFeature[] {
  const featureTemplates: Record<string, ProductFeature[]> = {
    electronics: [
      { name: 'sleek design', description: 'modern minimalist aesthetic', category: 'style', confidence: 0.9 },
      { name: 'black finish', description: 'matte black surface', category: 'color', confidence: 0.8 },
      { name: 'aluminum body', description: 'premium aluminum construction', category: 'material', confidence: 0.85 },
      { name: 'wireless connectivity', description: 'bluetooth and wifi enabled', category: 'function', confidence: 0.9 },
      { name: 'touch interface', description: 'responsive touch controls', category: 'function', confidence: 0.8 }
    ],
    clothing: [
      { name: 'cotton blend', description: 'soft cotton and polyester blend', category: 'material', confidence: 0.9 },
      { name: 'navy blue', description: 'classic navy blue color', category: 'color', confidence: 0.8 },
      { name: 'smooth texture', description: 'soft and comfortable feel', category: 'texture', confidence: 0.85 },
      { name: 'casual style', description: 'relaxed everyday wear', category: 'style', confidence: 0.8 },
      { name: 'breathable fabric', description: 'moisture-wicking material', category: 'function', confidence: 0.75 }
    ],
    home: [
      { name: 'wood construction', description: 'solid wood build', category: 'material', confidence: 0.9 },
      { name: 'natural finish', description: 'natural wood grain', category: 'color', confidence: 0.8 },
      { name: 'smooth surface', description: 'polished smooth finish', category: 'texture', confidence: 0.85 },
      { name: 'modern design', description: 'contemporary styling', category: 'style', confidence: 0.8 },
      { name: 'storage function', description: 'multi-purpose storage', category: 'function', confidence: 0.9 }
    ],
    automotive: [
      { name: 'steel construction', description: 'heavy-duty steel build', category: 'material', confidence: 0.9 },
      { name: 'chrome finish', description: 'polished chrome surface', category: 'color', confidence: 0.8 },
      { name: 'textured grip', description: 'non-slip textured surface', category: 'texture', confidence: 0.85 },
      { name: 'professional grade', description: 'commercial quality design', category: 'style', confidence: 0.8 },
      { name: 'performance enhancement', description: 'improves vehicle performance', category: 'function', confidence: 0.9 }
    ]
  };
  
  return featureTemplates[category] || featureTemplates.electronics;
}

function generateAltText(features: ProductFeature[], category: string): string {
  const primaryFeatures = features
    .filter(f => f.confidence > 0.7)
    .slice(0, 2)
    .map(f => f.name)
    .join(' and ');
  
  return `${category} product featuring ${primaryFeatures}`;
}

function generateCaptions(features: ProductFeature[], category: string): string[] {
  return generateLifestyleCaptions(features, category);
}

function extractKeywords(features: ProductFeature[], category: string): string[] {
  return extractVisualKeywords(features);
}

function createFallbackAnalysis(url: string, category: string): ImageAnalysis {
  return {
    id: crypto.randomUUID(),
    url,
    features: generateMockFeatures(category),
    altText: `${category} product image`,
    captions: [`High-quality ${category} product`],
    keywords: [category, 'product', 'quality'],
    confidence: 0.5,
    analyzedAt: new Date().toISOString()
  };
}

function generateAltTextSuggestions(features: ProductFeature[]): string[] {
  const suggestions: string[] = [];
  
  // Feature-focused alt text
  const primaryFeatures = features
    .filter(f => f.confidence > 0.8)
    .slice(0, 3)
    .map(f => f.name)
    .join(', ');
  
  if (primaryFeatures) {
    suggestions.push(`Product featuring ${primaryFeatures}`);
  }
  
  // Material-focused alt text
  const materials = features.filter(f => f.category === 'material');
  if (materials.length > 0) {
    suggestions.push(`${materials[0].name} construction with premium quality`);
  }
  
  // Style-focused alt text
  const styles = features.filter(f => f.category === 'style');
  if (styles.length > 0) {
    suggestions.push(`${styles[0].name} design for modern lifestyle`);
  }
  
  return suggestions;
}

function generateCaptionSuggestions(features: ProductFeature[]): string[] {
  const suggestions: string[] = [];
  
  // Quality-focused captions
  suggestions.push('Premium quality craftsmanship');
  suggestions.push('Built to last with superior materials');
  
  // Feature-focused captions
  const functions = features.filter(f => f.category === 'function');
  if (functions.length > 0) {
    suggestions.push(`Designed for ${functions[0].description.toLowerCase()}`);
  }
  
  // Style-focused captions
  const styles = features.filter(f => f.category === 'style');
  if (styles.length > 0) {
    suggestions.push(`${styles[0].name} style meets modern functionality`);
  }
  
  return suggestions;
}
