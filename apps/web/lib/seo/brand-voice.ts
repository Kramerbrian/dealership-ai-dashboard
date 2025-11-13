// Brand Voice & Tone Adaptation System
// DealershipAI - Intelligent Brand Consistency Engine

export interface BrandVoiceProfile {
  id: string;
  tenantId: string;
  name: string;
  tone: 'professional' | 'casual' | 'premium' | 'friendly' | 'urgent' | 'authoritative';
  personality: {
    trust: number; // 0-1
    excitement: number; // 0-1
    urgency: number; // 0-1
    sophistication: number; // 0-1
  };
  vocabulary: {
    preferred: string[];
    avoided: string[];
    industry: string[];
  };
  sentenceStructure: {
    avgLength: number;
    complexity: 'simple' | 'moderate' | 'complex';
    voice: 'active' | 'passive' | 'mixed';
  };
  examples: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ToneAdaptation {
  originalText: string;
  adaptedText: string;
  changes: Array<{
    type: 'vocabulary' | 'sentence_structure' | 'emotional_tone' | 'complexity';
    original: string;
    adapted: string;
    reason: string;
  }>;
  consistencyScore: number;
}

/**
 * Analyze brand voice from sample text
 */
export function analyzeBrandVoice(
  sampleTexts: string[],
  tenantId: string,
  brandName: string
): BrandVoiceProfile {
  const allText = sampleTexts.join(' ');
  const words = allText.toLowerCase().split(/\s+/).filter(Boolean);
  const sentences = allText.split(/[.!?]+/).filter(Boolean);
  
  // Analyze personality traits
  const personality = analyzePersonalityTraits(allText);
  
  // Extract vocabulary preferences
  const vocabulary = extractVocabularyPreferences(words, sentences);
  
  // Analyze sentence structure
  const sentenceStructure = analyzeSentenceStructure(sentences);
  
  // Determine tone
  const tone = determineTone(personality, vocabulary, sentenceStructure);
  
  return {
    id: crypto.randomUUID(),
    tenantId,
    name: brandName,
    tone,
    personality,
    vocabulary,
    sentenceStructure,
    examples: sampleTexts,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Adapt text to match brand voice
 */
export function adaptToBrandVoice(
  text: string,
  brandVoice: BrandVoiceProfile
): ToneAdaptation {
  const changes: ToneAdaptation['changes'] = [];
  let adaptedText = text;
  
  // 1. Vocabulary adaptation
  const vocabChanges = adaptVocabulary(adaptedText, brandVoice.vocabulary);
  adaptedText = vocabChanges.text;
  changes.push(...vocabChanges.changes);
  
  // 2. Sentence structure adaptation
  const structureChanges = adaptSentenceStructure(adaptedText, brandVoice.sentenceStructure);
  adaptedText = structureChanges.text;
  changes.push(...structureChanges.changes);
  
  // 3. Emotional tone adaptation
  const toneChanges = adaptEmotionalTone(adaptedText, brandVoice.personality);
  adaptedText = toneChanges.text;
  changes.push(...toneChanges.changes);
  
  // 4. Complexity adaptation
  const complexityChanges = adaptComplexity(adaptedText, brandVoice.sentenceStructure.complexity);
  adaptedText = complexityChanges.text;
  changes.push(...complexityChanges.changes);
  
  // Calculate consistency score
  const consistencyScore = calculateConsistencyScore(adaptedText, brandVoice);
  
  return {
    originalText: text,
    adaptedText,
    changes,
    consistencyScore
  };
}

/**
 * Generate tone-consistent product descriptions
 */
export function generateToneConsistentDescription(
  product: {
    name: string;
    features: string[];
    benefits: string[];
    category: string;
  },
  brandVoice: BrandVoiceProfile,
  variant: 'feature-focused' | 'benefit-focused' | 'problem-solution' = 'benefit-focused'
): string {
  const templates = getToneTemplates(brandVoice.tone, variant);
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Replace placeholders with product-specific content
  let description = template
    .replace('{product_name}', product.name)
    .replace('{category}', product.category)
    .replace('{primary_feature}', product.features[0] || 'premium quality')
    .replace('{primary_benefit}', product.benefits[0] || 'exceptional value')
    .replace('{secondary_feature}', product.features[1] || 'advanced technology')
    .replace('{secondary_benefit}', product.benefits[1] || 'superior performance');
  
  // Apply brand voice adaptations
  const adaptation = adaptToBrandVoice(description, brandVoice);
  
  return adaptation.adaptedText;
}

/**
 * Check brand voice consistency
 */
export function checkBrandConsistency(
  text: string,
  brandVoice: BrandVoiceProfile
): {
  score: number;
  issues: Array<{
    type: string;
    message: string;
    suggestion: string;
  }>;
} {
  const issues: Array<{ type: string; message: string; suggestion: string }> = [];
  let score = 100;
  
  // Check vocabulary consistency
  const words = text.toLowerCase().split(/\s+/);
  const avoidedWords = words.filter(word => brandVoice.vocabulary.avoided.includes(word));
  if (avoidedWords.length > 0) {
    issues.push({
      type: 'vocabulary',
      message: `Uses avoided words: ${avoidedWords.join(', ')}`,
      suggestion: 'Replace with preferred vocabulary'
    });
    score -= avoidedWords.length * 10;
  }
  
  // Check sentence structure
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  const lengthDiff = Math.abs(avgLength - brandVoice.sentenceStructure.avgLength);
  if (lengthDiff > 5) {
    issues.push({
      type: 'sentence_structure',
      message: `Average sentence length (${avgLength.toFixed(1)}) differs from brand standard (${brandVoice.sentenceStructure.avgLength})`,
      suggestion: 'Adjust sentence length to match brand voice'
    });
    score -= lengthDiff * 2;
  }
  
  // Check emotional tone
  const emotionalScore = analyzeEmotionalTone(text);
  const trustDiff = Math.abs(emotionalScore.trust - brandVoice.personality.trust);
  const excitementDiff = Math.abs(emotionalScore.excitement - brandVoice.personality.excitement);
  
  if (trustDiff > 0.3) {
    issues.push({
      type: 'emotional_tone',
      message: `Trust level (${emotionalScore.trust.toFixed(2)}) differs from brand standard (${brandVoice.personality.trust.toFixed(2)})`,
      suggestion: 'Adjust language to match brand trust level'
    });
    score -= trustDiff * 20;
  }
  
  if (excitementDiff > 0.3) {
    issues.push({
      type: 'emotional_tone',
      message: `Excitement level (${emotionalScore.excitement.toFixed(2)}) differs from brand standard (${brandVoice.personality.excitement.toFixed(2)})`,
      suggestion: 'Adjust language to match brand excitement level'
    });
    score -= excitementDiff * 20;
  }
  
  return {
    score: Math.max(0, score),
    issues
  };
}

// Helper functions
function analyzePersonalityTraits(text: string) {
  const trustWords = ['guarantee', 'certified', 'proven', 'trusted', 'reliable', 'secure'];
  const excitementWords = ['amazing', 'incredible', 'stunning', 'fantastic', 'excellent', 'outstanding'];
  const urgencyWords = ['limited', 'exclusive', 'now', 'immediately', 'urgent', 'hurry'];
  const sophisticationWords = ['premium', 'luxury', 'elegant', 'sophisticated', 'refined', 'exclusive'];
  
  const textLower = text.toLowerCase();
  
  return {
    trust: calculateTraitScore(textLower, trustWords),
    excitement: calculateTraitScore(textLower, excitementWords),
    urgency: calculateTraitScore(textLower, urgencyWords),
    sophistication: calculateTraitScore(textLower, sophisticationWords)
  };
}

function calculateTraitScore(text: string, words: string[]): number {
  const matches = words.filter(word => text.includes(word)).length;
  return Math.min(1, matches / words.length);
}

function extractVocabularyPreferences(words: string[], sentences: string[]) {
  // Analyze word frequency and preferences
  const wordFreq = new Map<string, number>();
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  const preferred = Array.from(wordFreq.entries())
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, _]) => word);
  
  // Industry-specific vocabulary
  const industryWords = words.filter(word => 
    word.length > 4 && 
    !['the', 'and', 'for', 'with', 'this', 'that', 'they', 'have', 'from', 'been'].includes(word)
  );
  
  return {
    preferred,
    avoided: [], // Would be populated from brand guidelines
    industry: industryWords.slice(0, 10)
  };
}

function analyzeSentenceStructure(sentences: string[]) {
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
  
  // Determine complexity
  const complexSentences = sentences.filter(s => s.split(/\s+/).length > 20).length;
  const complexity = complexSentences > sentences.length * 0.3 ? 'complex' : 
                    complexSentences > sentences.length * 0.1 ? 'moderate' : 'simple';
  
  // Determine voice (active vs passive)
  const activeIndicators = ['creates', 'builds', 'delivers', 'provides', 'offers'];
  const passiveIndicators = ['is created', 'is built', 'is delivered', 'is provided', 'is offered'];
  
  const activeCount = sentences.filter(s => 
    activeIndicators.some(indicator => s.toLowerCase().includes(indicator))
  ).length;
  
  const passiveCount = sentences.filter(s => 
    passiveIndicators.some(indicator => s.toLowerCase().includes(indicator))
  ).length;
  
  const voice = activeCount > passiveCount ? 'active' : 
                passiveCount > activeCount ? 'passive' : 'mixed';
  
  return {
    avgLength: Math.round(avgLength),
    complexity,
    voice
  };
}

function determineTone(personality: any, vocabulary: any, sentenceStructure: any): BrandVoiceProfile['tone'] {
  if (personality.sophistication > 0.7) return 'premium';
  if (personality.urgency > 0.6) return 'urgent';
  if (personality.excitement > 0.6) return 'friendly';
  if (personality.trust > 0.7) return 'authoritative';
  if (sentenceStructure.complexity === 'simple') return 'casual';
  return 'professional';
}

function adaptVocabulary(text: string, vocabulary: BrandVoiceProfile['vocabulary']) {
  const changes: ToneAdaptation['changes'] = [];
  let adaptedText = text;
  
  // Replace avoided words with preferred alternatives
  vocabulary.avoided.forEach(avoidedWord => {
    if (adaptedText.toLowerCase().includes(avoidedWord)) {
      const preferred = vocabulary.preferred[Math.floor(Math.random() * vocabulary.preferred.length)];
      adaptedText = adaptedText.replace(new RegExp(avoidedWord, 'gi'), preferred);
      changes.push({
        type: 'vocabulary',
        original: avoidedWord,
        adapted: preferred,
        reason: 'Replaced avoided word with preferred vocabulary'
      });
    }
  });
  
  return { text: adaptedText, changes };
}

function adaptSentenceStructure(text: string, structure: BrandVoiceProfile['sentenceStructure']) {
  const changes: ToneAdaptation['changes'] = [];
  let adaptedText = text;
  
  // This is a simplified implementation
  // In production, you'd use more sophisticated NLP techniques
  
  return { text: adaptedText, changes };
}

function adaptEmotionalTone(text: string, personality: BrandVoiceProfile['personality']) {
  const changes: ToneAdaptation['changes'] = [];
  let adaptedText = text;
  
  // Adjust trust level
  if (personality.trust > 0.7) {
    // Add trust-building language
    if (!adaptedText.includes('guarantee') && !adaptedText.includes('certified')) {
      adaptedText += ' Certified quality guaranteed.';
      changes.push({
        type: 'emotional_tone',
        original: '',
        adapted: 'Certified quality guaranteed.',
        reason: 'Added trust-building language'
      });
    }
  }
  
  // Adjust excitement level
  if (personality.excitement > 0.6) {
    // Add excitement words
    const excitementWords = ['amazing', 'incredible', 'outstanding'];
    const randomWord = excitementWords[Math.floor(Math.random() * excitementWords.length)];
    if (!adaptedText.toLowerCase().includes(randomWord)) {
      adaptedText = adaptedText.replace(/quality/g, `${randomWord} quality`);
      changes.push({
        type: 'emotional_tone',
        original: 'quality',
        adapted: `${randomWord} quality`,
        reason: 'Added excitement language'
      });
    }
  }
  
  return { text: adaptedText, changes };
}

function adaptComplexity(text: string, complexity: string) {
  const changes: ToneAdaptation['changes'] = [];
  let adaptedText = text;
  
  if (complexity === 'simple') {
    // Simplify complex sentences
    const sentences = adaptedText.split(/[.!?]+/);
    const simplified = sentences.map(sentence => {
      if (sentence.split(/\s+/).length > 15) {
        // Split long sentences
        const words = sentence.split(/\s+/);
        const midPoint = Math.floor(words.length / 2);
        const firstHalf = words.slice(0, midPoint).join(' ');
        const secondHalf = words.slice(midPoint).join(' ');
        return `${firstHalf}. ${secondHalf}`;
      }
      return sentence;
    });
    adaptedText = simplified.join('. ');
  }
  
  return { text: adaptedText, changes };
}

function calculateConsistencyScore(text: string, brandVoice: BrandVoiceProfile): number {
  const consistency = checkBrandConsistency(text, brandVoice);
  return consistency.score;
}

function analyzeEmotionalTone(text: string) {
  return analyzePersonalityTraits(text);
}

function getToneTemplates(tone: string, variant: string): string[] {
  const templates: Record<string, Record<string, string[]>> = {
    professional: {
      'feature-focused': [
        '{product_name} delivers {primary_feature} with {secondary_feature}. Built for {category} professionals who demand excellence.',
        'Experience {primary_feature} with {product_name}. Engineered for superior {category} performance.',
        '{product_name} combines {primary_feature} and {secondary_feature} for optimal {category} results.'
      ],
      'benefit-focused': [
        '{product_name} provides {primary_benefit} through {primary_feature}. Transform your {category} experience.',
        'Achieve {primary_benefit} with {product_name}. Designed to deliver {secondary_benefit} for {category} users.',
        'Maximize {primary_benefit} using {product_name}. Advanced {category} technology for superior results.'
      ],
      'problem-solution': [
        'Solve {category} challenges with {product_name}. {primary_feature} delivers {primary_benefit}.',
        'Address {category} needs effectively. {product_name} provides {primary_benefit} through {primary_feature}.',
        'Overcome {category} limitations. {product_name} offers {primary_benefit} with {secondary_feature}.'
      ]
    },
    premium: {
      'feature-focused': [
        '{product_name} represents the pinnacle of {category} excellence. {primary_feature} meets {secondary_feature} in perfect harmony.',
        'Indulge in {primary_feature} with {product_name}. Luxury {category} redefined.',
        '{product_name} embodies {primary_feature} and {secondary_feature}. The ultimate {category} experience.'
      ],
      'benefit-focused': [
        'Elevate your {category} experience with {product_name}. {primary_benefit} through {primary_feature}.',
        'Discover {primary_benefit} with {product_name}. Premium {category} performance reimagined.',
        'Experience {primary_benefit} through {product_name}. Sophisticated {category} solutions.'
      ],
      'problem-solution': [
        'Transcend {category} limitations with {product_name}. {primary_feature} delivers {primary_benefit}.',
        'Redefine {category} standards. {product_name} provides {primary_benefit} through {primary_feature}.',
        'Elevate beyond {category} expectations. {product_name} offers {primary_benefit} with {secondary_feature}.'
      ]
    },
    friendly: {
      'feature-focused': [
        'Meet {product_name}! It brings {primary_feature} and {secondary_feature} to your {category} world.',
        'Say hello to {product_name}! {primary_feature} meets {secondary_feature} in the most delightful way.',
        '{product_name} is here to make your {category} life better with {primary_feature} and {secondary_feature}.'
      ],
      'benefit-focused': [
        'Love your {category} experience with {product_name}! {primary_benefit} through {primary_feature}.',
        'Enjoy {primary_benefit} with {product_name}! It\'s designed to bring joy to your {category} routine.',
        'Fall in love with {primary_benefit} using {product_name}! Perfect for {category} enthusiasts.'
      ],
      'problem-solution': [
        'Wave goodbye to {category} frustrations! {product_name} brings {primary_benefit} through {primary_feature}.',
        'No more {category} headaches! {product_name} delivers {primary_benefit} with {secondary_feature}.',
        'Say farewell to {category} problems! {product_name} offers {primary_benefit} through {primary_feature}.'
      ]
    }
  };
  
  return templates[tone]?.[variant] || templates.professional[variant];
}
