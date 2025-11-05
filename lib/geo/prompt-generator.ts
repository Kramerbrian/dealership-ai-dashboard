// lib/geo/prompt-generator.ts

import { GEOPrompt } from './types';

const PROMPT_TEMPLATES = {
  service: [
    'best oil change near {city}',
    'oil change price {city}',
    'same-day brake service {city}',
    'tire rotation {city} open now',
    'battery replacement {city}',
    'check engine light diagnosis {city}',
    'recall check {make} {city}',
    'state inspection {city}',
    'transmission service {city}',
    'hybrid service {city}',
  ],
  sales: [
    'buy used {make} suv {city}',
    'certified {make} dealer {city}',
    'trade-in appraisal {city}',
    'lease return inspection {city}',
  ],
  parts: [
    'tire rotation {city} open now',
    'battery replacement {city}',
  ],
  finance: [
    'auto loan {city}',
    'financing options {city}',
  ],
};

export class GEOPromptGenerator {
  /**
   * Generate weekly GEO test prompts
   */
  static generateWeeklyPrompts(city: string, make?: string): GEOPrompt[] {
    const prompts: GEOPrompt[] = [];
    const now = new Date().toISOString();

    // Service prompts (10)
    PROMPT_TEMPLATES.service.forEach((template, idx) => {
      prompts.push({
        id: `geo_${Date.now()}_${idx}`,
        prompt: template.replace('{city}', city).replace('{make}', make || ''),
        city,
        intent: 'service',
        created_at: now,
      });
    });

    // Sales prompts (4)
    PROMPT_TEMPLATES.sales.forEach((template, idx) => {
      prompts.push({
        id: `geo_${Date.now()}_s_${idx}`,
        prompt: template.replace('{city}', city).replace('{make}', make || ''),
        city,
        intent: 'sales',
        created_at: now,
      });
    });

    return prompts;
  }

  /**
   * Generate custom prompt for specific intent
   */
  static generateCustomPrompt(
    city: string,
    intent: 'service' | 'sales' | 'parts' | 'finance',
    customText?: string
  ): GEOPrompt {
    const templates = PROMPT_TEMPLATES[intent];
    const template = customText || templates[Math.floor(Math.random() * templates.length)];

    return {
      id: `geo_${Date.now()}_custom`,
      prompt: template.replace('{city}', city),
      city,
      intent,
      created_at: new Date().toISOString(),
    };
  }
}

