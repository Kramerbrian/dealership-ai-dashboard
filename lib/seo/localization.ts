// Localization & Idiomatic Keyword Variants
// DealershipAI - Multi-Market SEO Optimization

export interface Locale {
  code: string;
  name: string;
  country: string;
  language: string;
  currency: string;
  dateFormat: string;
  numberFormat: string;
}

export interface LocalizedKeywords {
  locale: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  idioms: string[];
  culturalAdaptations: string[];
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
}

export interface LocalizedContent {
  locale: string;
  title: string;
  description: string;
  metaDescription: string;
  bulletPoints: string[];
  altTexts: string[];
  keywords: string[];
  culturalNotes: string[];
  adaptationScore: number;
}

export interface MarketInsights {
  locale: string;
  marketSize: number;
  competition: number;
  opportunity: number;
  trendingKeywords: string[];
  seasonalPatterns: string[];
  culturalConsiderations: string[];
}

/**
 * Supported locales with market data
 */
export const SUPPORTED_LOCALES: Locale[] = [
  {
    code: 'en-US',
    name: 'United States',
    country: 'US',
    language: 'English',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: '1,234.56'
  },
  {
    code: 'en-GB',
    name: 'United Kingdom',
    country: 'GB',
    language: 'English',
    currency: 'GBP',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56'
  },
  {
    code: 'en-CA',
    name: 'Canada',
    country: 'CA',
    language: 'English',
    currency: 'CAD',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56'
  },
  {
    code: 'en-AU',
    name: 'Australia',
    country: 'AU',
    language: 'English',
    currency: 'AUD',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56'
  },
  {
    code: 'de-DE',
    name: 'Germany',
    country: 'DE',
    language: 'German',
    currency: 'EUR',
    dateFormat: 'DD.MM.YYYY',
    numberFormat: '1.234,56'
  },
  {
    code: 'fr-FR',
    name: 'France',
    country: 'FR',
    language: 'French',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1 234,56'
  },
  {
    code: 'es-ES',
    name: 'Spain',
    country: 'ES',
    language: 'Spanish',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1.234,56'
  },
  {
    code: 'es-MX',
    name: 'Mexico',
    country: 'MX',
    language: 'Spanish',
    currency: 'MXN',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,234.56'
  }
];

/**
 * Localize keywords for specific markets
 */
export function localizeKeywords(
  baseKeywords: string[],
  targetLocale: string,
  category: string
): LocalizedKeywords {
  const locale = SUPPORTED_LOCALES.find(l => l.code === targetLocale);
  if (!locale) {
    throw new Error(`Unsupported locale: ${targetLocale}`);
  }
  
  const localized = baseKeywords.map(keyword => 
    localizeKeyword(keyword, locale, category)
  );
  
  const idioms = generateIdiomaticVariants(baseKeywords, locale, category);
  const culturalAdaptations = (generateCulturalAdaptations as any)(baseKeywords, locale, category);
  
  return {
    locale: targetLocale,
    primaryKeywords: localized.slice(0, 3),
    secondaryKeywords: localized.slice(3),
    idioms,
    culturalAdaptations,
    searchVolume: estimateSearchVolume(localized, locale),
    competition: estimateCompetition(localized, locale)
  };
}

/**
 * Generate localized content for multiple markets
 */
export function generateLocalizedContent(
  baseContent: {
    title: string;
    description: string;
    metaDescription: string;
    bulletPoints: string[];
    keywords: string[];
  },
  targetLocales: string[],
  category: string
): LocalizedContent[] {
  return targetLocales.map(locale => {
    const localizedKeywords = localizeKeywords(baseContent.keywords, locale, category);
    const culturalNotes = generateCulturalNotes(locale, category);
    
    return {
      locale,
      title: localizeTitle(baseContent.title, locale, localizedKeywords.primaryKeywords),
      description: localizeDescription(baseContent.description, locale, localizedKeywords),
      metaDescription: localizeMetaDescription(baseContent.metaDescription, locale, localizedKeywords),
      bulletPoints: localizeBulletPoints(baseContent.bulletPoints, locale, localizedKeywords),
      altTexts: generateLocalizedAltTexts(localizedKeywords, category),
      keywords: localizedKeywords.primaryKeywords,
      culturalNotes,
      adaptationScore: calculateAdaptationScore(localizedKeywords, culturalNotes)
    };
  });
}

/**
 * Get market insights for localization strategy
 */
export function getMarketInsights(
  targetLocales: string[],
  category: string
): MarketInsights[] {
  return targetLocales.map(locale => {
    const localeData = SUPPORTED_LOCALES.find(l => l.code === locale);
    if (!localeData) {
      throw new Error(`Unsupported locale: ${locale}`);
    }
    
    return {
      locale,
      marketSize: estimateMarketSize(localeData, category),
      competition: estimateCompetitionLevel(localeData, category),
      opportunity: calculateOpportunityScore(localeData, category),
      trendingKeywords: getTrendingKeywords(locale, category),
      seasonalPatterns: getSeasonalPatterns(locale, category),
      culturalConsiderations: getCulturalConsiderations(localeData, category)
    };
  });
}

/**
 * Generate idiomatic keyword variants
 */
export function generateIdiomaticVariants(
  keywords: string[],
  locale: Locale,
  category: string
): string[] {
  const idiomMap: Record<string, Record<string, string[]>> = {
    'en-US': {
      'wireless headphones': ['bluetooth earbuds', 'cordless headphones', 'wireless earbuds'],
      'smartphone': ['mobile phone', 'cell phone', 'handset'],
      'laptop': ['notebook computer', 'portable computer', 'laptop computer'],
      'car': ['automobile', 'vehicle', 'auto'],
      'shoes': ['footwear', 'sneakers', 'athletic shoes']
    },
    'en-GB': {
      'wireless headphones': ['wireless earphones', 'bluetooth headphones', 'cordless earphones'],
      'smartphone': ['mobile phone', 'handset', 'mobile'],
      'laptop': ['laptop computer', 'portable computer', 'notebook'],
      'car': ['motor car', 'vehicle', 'automobile'],
      'shoes': ['footwear', 'trainers', 'plimsolls']
    },
    'en-AU': {
      'wireless headphones': ['wireless earphones', 'bluetooth headphones', 'cordless earphones'],
      'smartphone': ['mobile phone', 'handset', 'mobile'],
      'laptop': ['laptop computer', 'portable computer', 'notebook'],
      'car': ['motor car', 'vehicle', 'automobile'],
      'shoes': ['footwear', 'runners', 'thongs']
    },
    'de-DE': {
      'wireless headphones': ['kabellose kopfhörer', 'bluetooth kopfhörer', 'drahtlose kopfhörer'],
      'smartphone': ['handy', 'mobiltelefon', 'smartphone'],
      'laptop': ['laptop', 'notebook', 'tragbarer computer'],
      'car': ['auto', 'fahrzeug', 'kraftfahrzeug'],
      'shoes': ['schuhe', 'fußbekleidung', 'sportschuhe']
    },
    'fr-FR': {
      'wireless headphones': ['écouteurs sans fil', 'casque bluetooth', 'écouteurs bluetooth'],
      'smartphone': ['téléphone portable', 'mobile', 'smartphone'],
      'laptop': ['ordinateur portable', 'laptop', 'portable'],
      'car': ['voiture', 'véhicule', 'automobile'],
      'shoes': ['chaussures', 'chaussures de sport', 'baskets']
    },
    'es-ES': {
      'wireless headphones': ['auriculares inalámbricos', 'cascos bluetooth', 'auriculares bluetooth'],
      'smartphone': ['teléfono móvil', 'móvil', 'smartphone'],
      'laptop': ['ordenador portátil', 'laptop', 'portátil'],
      'car': ['coche', 'vehículo', 'automóvil'],
      'shoes': ['zapatos', 'calzado', 'zapatillas']
    }
  };
  
  const localeIdioms = idiomMap[locale.code] || {};
  const variants: string[] = [];
  
  keywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    const idiomVariants = localeIdioms[lowerKeyword] || [];
    variants.push(...idiomVariants);
  });
  
  return [...new Set(variants)];
}

// Helper functions
function localizeKeyword(keyword: string, locale: Locale, category: string): string {
  const keywordMap: Record<string, Record<string, string>> = {
    'en-US': {},
    'en-GB': {
      'sneakers': 'trainers',
      'pants': 'trousers',
      'sweater': 'jumper',
      'apartment': 'flat',
      'elevator': 'lift',
      'truck': 'lorry',
      'gas': 'petrol',
      'sidewalk': 'pavement',
      'trash': 'rubbish',
      'vacation': 'holiday'
    },
    'en-AU': {
      'sneakers': 'runners',
      'pants': 'trousers',
      'sweater': 'jumper',
      'apartment': 'flat',
      'elevator': 'lift',
      'truck': 'ute',
      'gas': 'petrol',
      'sidewalk': 'footpath',
      'trash': 'rubbish',
      'vacation': 'holiday'
    },
    'de-DE': {
      'wireless': 'kabellos',
      'smartphone': 'handy',
      'laptop': 'laptop',
      'headphones': 'kopfhörer',
      'car': 'auto',
      'shoes': 'schuhe',
      'clothing': 'kleidung',
      'electronics': 'elektronik',
      'home': 'haus',
      'automotive': 'automobil'
    },
    'fr-FR': {
      'wireless': 'sans fil',
      'smartphone': 'téléphone portable',
      'laptop': 'ordinateur portable',
      'headphones': 'écouteurs',
      'car': 'voiture',
      'shoes': 'chaussures',
      'clothing': 'vêtements',
      'electronics': 'électronique',
      'home': 'maison',
      'automotive': 'automobile'
    },
    'es-ES': {
      'wireless': 'inalámbrico',
      'smartphone': 'teléfono móvil',
      'laptop': 'ordenador portátil',
      'headphones': 'auriculares',
      'car': 'coche',
      'shoes': 'zapatos',
      'clothing': 'ropa',
      'electronics': 'electrónica',
      'home': 'hogar',
      'automotive': 'automóvil'
    }
  };
  
  const localeMap = keywordMap[locale.code] || {};
  const lowerKeyword = keyword.toLowerCase();
  
  // Check for direct translation
  if (localeMap[lowerKeyword]) {
    return localeMap[lowerKeyword];
  }
  
  // Check for partial matches
  for (const [english, translation] of Object.entries(localeMap)) {
    if (lowerKeyword.includes(english)) {
      return lowerKeyword.replace(english, translation);
    }
  }
  
  // Return original if no translation found
  return keyword;
}

function localizeTitle(title: string, locale: string, keywords: string[]): string {
  const localizedKeywords = keywords.slice(0, 2).join(' ');
  return `${title} - ${localizedKeywords}`;
}

function localizeDescription(description: string, locale: string, keywords: LocalizedKeywords): string {
  // Add localized keywords to description
  const keywordPhrase = keywords.primaryKeywords.slice(0, 2).join(' ');
  return `${description} ${keywordPhrase}.`;
}

function localizeMetaDescription(metaDescription: string, locale: string, keywords: LocalizedKeywords): string {
  const localizedKeywords = keywords.primaryKeywords.slice(0, 1)[0];
  return `${metaDescription} ${localizedKeywords}.`;
}

function localizeBulletPoints(bulletPoints: string[], locale: string, keywords: LocalizedKeywords): string[] {
  return bulletPoints.map(point => {
    // Add localized keywords to bullet points
    const keyword = keywords.primaryKeywords[0];
    return `${point} ${keyword}.`;
  });
}

function generateLocalizedAltTexts(keywords: LocalizedKeywords, category: string): string[] {
  return keywords.primaryKeywords.map(keyword => 
    `${category} product featuring ${keyword}`
  );
}

function generateCulturalNotes(locale: string, category: string): string[] {
  const culturalMap: Record<string, Record<string, string[]>> = {
    'en-GB': {
      electronics: ['Use British spelling (colour, centre)', 'Mention CE certification', 'Include VAT information'],
      clothing: ['Use UK sizing', 'Mention British style preferences', 'Include delivery to UK addresses'],
      automotive: ['Mention MOT compliance', 'Use UK road regulations', 'Include insurance considerations']
    },
    'en-AU': {
      electronics: ['Use Australian spelling', 'Mention Australian standards', 'Include GST information'],
      clothing: ['Use Australian sizing', 'Mention Australian style', 'Include delivery to Australia'],
      automotive: ['Mention Australian road rules', 'Use Australian standards', 'Include insurance requirements']
    },
    'de-DE': {
      electronics: ['Mention CE marking', 'Include German warranty terms', 'Use German technical standards'],
      clothing: ['Use European sizing', 'Mention German fashion trends', 'Include German delivery options'],
      automotive: ['Mention TÜV certification', 'Use German road regulations', 'Include German insurance']
    },
    'fr-FR': {
      electronics: ['Mention CE marking', 'Include French warranty terms', 'Use French technical standards'],
      clothing: ['Use European sizing', 'Mention French fashion trends', 'Include French delivery options'],
      automotive: ['Mention French road regulations', 'Use French standards', 'Include French insurance']
    },
    'es-ES': {
      electronics: ['Mention CE marking', 'Include Spanish warranty terms', 'Use Spanish technical standards'],
      clothing: ['Use European sizing', 'Mention Spanish fashion trends', 'Include Spanish delivery options'],
      automotive: ['Mention Spanish road regulations', 'Use Spanish standards', 'Include Spanish insurance']
    }
  };
  
  return culturalMap[locale]?.[category] || ['Consider local preferences', 'Include local delivery options'];
}

function calculateAdaptationScore(keywords: LocalizedKeywords, culturalNotes: string[]): number {
  let score = 50; // Base score
  
  // Bonus for high search volume
  if (keywords.searchVolume > 1000) score += 20;
  else if (keywords.searchVolume > 500) score += 10;
  
  // Bonus for low competition
  if (keywords.competition === 'low') score += 20;
  else if (keywords.competition === 'medium') score += 10;
  
  // Bonus for cultural adaptations
  score += culturalNotes.length * 5;
  
  return Math.min(100, score);
}

function estimateSearchVolume(keywords: string[], locale: Locale): number {
  // Mock implementation - in production, use actual search volume data
  const baseVolume = 1000;
  const localeMultiplier: Record<string, number> = {
    'en-US': 1.0,
    'en-GB': 0.3,
    'en-CA': 0.2,
    'en-AU': 0.15,
    'de-DE': 0.4,
    'fr-FR': 0.35,
    'es-ES': 0.3,
    'es-MX': 0.25
  };
  
  return Math.round(baseVolume * (localeMultiplier[locale.code] || 0.1) * keywords.length);
}

function estimateCompetition(keywords: string[], locale: Locale): 'low' | 'medium' | 'high' {
  // Mock implementation - in production, use actual competition data
  const competitionMap: Record<string, 'low' | 'medium' | 'high'> = {
    'en-US': 'high',
    'en-GB': 'medium',
    'en-CA': 'medium',
    'en-AU': 'low',
    'de-DE': 'medium',
    'fr-FR': 'medium',
    'es-ES': 'low',
    'es-MX': 'low'
  };
  
  return competitionMap[locale.code] || 'low';
}

function estimateMarketSize(locale: Locale, category: string): number {
  // Mock implementation - in production, use actual market data
  const baseSize = 1000000;
  const localeMultiplier: Record<string, number> = {
    'en-US': 1.0,
    'en-GB': 0.2,
    'en-CA': 0.1,
    'en-AU': 0.08,
    'de-DE': 0.15,
    'fr-FR': 0.12,
    'es-ES': 0.1,
    'es-MX': 0.15
  };
  
  return Math.round(baseSize * (localeMultiplier[locale.code] || 0.05));
}

function estimateCompetitionLevel(locale: Locale, category: string): number {
  // Mock implementation - in production, use actual competition data
  const competitionMap: Record<string, number> = {
    'en-US': 0.8,
    'en-GB': 0.6,
    'en-CA': 0.5,
    'en-AU': 0.4,
    'de-DE': 0.6,
    'fr-FR': 0.5,
    'es-ES': 0.4,
    'es-MX': 0.3
  };
  
  return competitionMap[locale.code] || 0.3;
}

function calculateOpportunityScore(locale: Locale, category: string): number {
  const marketSize = estimateMarketSize(locale, category);
  const competition = estimateCompetitionLevel(locale, category);
  
  // Higher market size and lower competition = higher opportunity
  return Math.round((marketSize / 1000000) * (1 - competition) * 100);
}

function getTrendingKeywords(locale: string, category: string): string[] {
  // Mock implementation - in production, use actual trending data
  const trendingMap: Record<string, Record<string, string[]>> = {
    'en-US': {
      electronics: ['AI-powered', 'sustainable', 'wireless charging'],
      clothing: ['sustainable fashion', 'athleisure', 'minimalist style'],
      automotive: ['electric vehicles', 'autonomous driving', 'sustainable transport']
    },
    'en-GB': {
      electronics: ['eco-friendly', 'smart home', 'wireless charging'],
      clothing: ['sustainable fashion', 'British style', 'premium quality'],
      automotive: ['electric vehicles', 'hybrid cars', 'sustainable transport']
    }
  };
  
  return trendingMap[locale]?.[category] || ['premium quality', 'innovative design', 'sustainable'];
}

function getSeasonalPatterns(locale: string, category: string): string[] {
  // Mock implementation - in production, use actual seasonal data
  return ['Q4 peak season', 'Holiday shopping increase', 'New year demand surge'];
}

function getCulturalConsiderations(locale: Locale, category: string): string[] {
  const considerations: Record<string, string[]> = {
    'en-GB': ['British spelling preferences', 'CE certification requirements', 'VAT inclusion'],
    'en-AU': ['Australian spelling preferences', 'Australian standards compliance', 'GST inclusion'],
    'de-DE': ['German language requirements', 'CE marking compliance', 'German warranty terms'],
    'fr-FR': ['French language requirements', 'CE marking compliance', 'French warranty terms'],
    'es-ES': ['Spanish language requirements', 'CE marking compliance', 'Spanish warranty terms']
  };
  
  return considerations[locale.code] || ['Local language preferences', 'Regional compliance requirements'];
}
