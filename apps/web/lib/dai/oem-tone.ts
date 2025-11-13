/**
 * OEM Tone Modifiers
 * 
 * Adjusts dAI Agent tone and focus based on dealership brand/OEM
 */

export type OEMBrand = 'hyundai' | 'ford' | 'toyota' | 'used' | 'general';

export interface OEMToneModifier {
  focus: string;
  keywords?: string[];
  examples?: string[];
}

export const OEM_TONE_MODIFIERS: Record<OEMBrand, OEMToneModifier> = {
  hyundai: {
    focus: 'Focus on trust, modern tech, and customer satisfaction.',
    keywords: ['trust', 'modern', 'technology', 'satisfaction', 'innovation'],
    examples: [
      'Your Hyundai store needs to show modern tech and trust signals.',
      'Hyundai shoppers look for innovation and reliability.',
    ],
  },
  ford: {
    focus: 'Focus on durability, loyalty, and real-world performance.',
    keywords: ['durability', 'loyalty', 'performance', 'tough', 'built'],
    examples: [
      'Ford customers value durability and proven performance.',
      'Your Ford store should emphasize reliability and loyalty.',
    ],
  },
  toyota: {
    focus: 'Emphasize reliability, reputation, and consistency.',
    keywords: ['reliability', 'reputation', 'consistency', 'quality', 'longevity'],
    examples: [
      'Toyota shoppers expect reliability and consistent quality.',
      'Your Toyota store's reputation is your biggest asset.',
    ],
  },
  used: {
    focus: 'Focus on sourcing, pricing, and reconditioning efficiency.',
    keywords: ['sourcing', 'pricing', 'reconditioning', 'turn', 'appraisal'],
    examples: [
      'Used car success comes from smart sourcing and fast turn.',
      'Your pricing and reconditioning efficiency drive gross.',
    ],
  },
  general: {
    focus: 'Focus on clarity, visibility, and results.',
    keywords: ['clarity', 'visibility', 'results', 'performance'],
    examples: [],
  },
};

/**
 * Detect OEM brand from domain or store name
 */
export function detectOEMBrand(domain?: string, storeName?: string): OEMBrand {
  if (!domain && !storeName) return 'general';
  
  const searchText = `${domain || ''} ${storeName || ''}`.toLowerCase();
  
  if (searchText.includes('hyundai')) return 'hyundai';
  if (searchText.includes('ford')) return 'ford';
  if (searchText.includes('toyota')) return 'toyota';
  if (searchText.includes('used') || searchText.includes('pre-owned') || searchText.includes('cpo')) {
    return 'used';
  }
  
  return 'general';
}

/**
 * Get OEM tone modifier for a brand
 */
export function getOEMToneModifier(brand: OEMBrand): OEMToneModifier {
  return OEM_TONE_MODIFIERS[brand] || OEM_TONE_MODIFIERS.general;
}

/**
 * Get OEM-specific guidance for system prompt
 */
export function getOEMGuidance(brand: OEMBrand): string {
  const modifier = getOEMToneModifier(brand);
  return modifier.focus;
}

