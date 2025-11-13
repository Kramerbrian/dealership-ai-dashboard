/**
 * DealershipAI Site Intelligence - Data Validation
 * 
 * Zod schemas and validation utilities
 */

import { z } from 'zod';

// Tenant ID validation
export const TenantIdSchema = z.string().uuid();

// AIV data validation
export const AIVDataSchema = z.object({
  aiv_pct: z.number().min(0).max(100),
  crs_pct: z.number().min(0).max(100),
  elasticity_usd_per_point: z.number().min(0),
  r2: z.number().min(0).max(1),
  window_weeks: z.number().min(1).max(52)
});

// ATI data validation
export const ATIDataSchema = z.object({
  ati_pct: z.number().min(0).max(100),
  precision: z.number().min(0).max(1),
  consistency: z.number().min(0).max(1),
  recency: z.number().min(0).max(1),
  authenticity: z.number().min(0).max(1),
  alignment: z.number().min(0).max(1)
});

// VLI data validation
export const VLIDataSchema = z.object({
  vli_multiplier: z.number().min(1),
  integrity_pct: z.number().min(0).max(100)
});

// API response validation
export const APIResponseSchema = z.object({
  data: z.any().nullable(),
  error: z.string().nullable()
});

// Validation helper
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      };
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}

// Safe fetch with validation
export async function safeFetch<T>(
  url: string, 
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${response.statusText}` 
      };
    }
    
    const json = await response.json();
    const validation = validateData(schema, json.data);
    
    if (!validation.success) {
      return { 
        success: false, 
        error: `Validation failed: ${validation.error}` 
      };
    }
    
    return { success: true, data: validation.data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}
