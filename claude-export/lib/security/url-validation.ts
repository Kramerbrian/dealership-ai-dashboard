/**
 * URL Validation Utility
 * Provides strict URL validation with SSRF protection
 */

import { z } from 'zod';

export interface UrlValidationResult {
  valid: boolean;
  url?: string;
  error?: string;
}

/**
 * Validates and normalizes URL input
 * Blocks SSRF attacks and validates domain format
 */
export function validateUrl(input: string): UrlValidationResult {
  // Length check
  if (!input || input.trim().length === 0) {
    return { valid: false, error: 'URL is required' };
  }

  if (input.length > 2048) {
    return { valid: false, error: 'URL is too long (max 2048 characters)' };
  }

  try {
    // Normalize URL
    let normalized = input.trim().toLowerCase();
    
    // Add protocol if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }

    // Parse URL
    const url = new URL(normalized);
    const hostname = url.hostname.toLowerCase();

    // Validate hostname length
    if (hostname.length === 0 || hostname.length > 253) {
      return { valid: false, error: 'Invalid domain name' };
    }

    // Block SSRF attacks - localhost
    const blockedHostnames = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      'localhost.localdomain',
    ];

    if (blockedHostnames.includes(hostname)) {
      return { valid: false, error: 'Invalid domain' };
    }

    // Block private IP ranges
    if (hostname.startsWith('192.168.') || 
        hostname.startsWith('10.') ||
        hostname.startsWith('172.16.') ||
        hostname.startsWith('172.17.') ||
        hostname.startsWith('172.18.') ||
        hostname.startsWith('172.19.') ||
        hostname.startsWith('172.20.') ||
        hostname.startsWith('172.21.') ||
        hostname.startsWith('172.22.') ||
        hostname.startsWith('172.23.') ||
        hostname.startsWith('172.24.') ||
        hostname.startsWith('172.25.') ||
        hostname.startsWith('172.26.') ||
        hostname.startsWith('172.27.') ||
        hostname.startsWith('172.28.') ||
        hostname.startsWith('172.29.') ||
        hostname.startsWith('172.30.') ||
        hostname.startsWith('172.31.')) {
      return { valid: false, error: 'Invalid domain' };
    }

    // Validate domain format (basic TLD check)
    const domainRegex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
    if (!domainRegex.test(hostname)) {
      return { valid: false, error: 'Invalid domain format' };
    }

    // Return normalized origin (protocol + hostname)
    return { valid: true, url: url.origin };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
}

/**
 * Zod schema for URL validation
 */
export const urlSchema = z.string()
  .min(1, 'URL is required')
  .max(2048, 'URL is too long (max 2048 characters)')
  .refine(
    (url) => {
      const result = validateUrl(url);
      return result.valid;
    },
    { message: 'Invalid URL format' }
  );

/**
 * Extract domain from URL string
 */
export function extractDomain(url: string): string | null {
  const validation = validateUrl(url);
  if (!validation.valid || !validation.url) {
    return null;
  }

  try {
    const parsed = new URL(validation.url);
    return parsed.hostname.toLowerCase();
  } catch {
    return null;
  }
}

