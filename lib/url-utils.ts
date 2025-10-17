/**
 * URL Utilities for DealershipAI
 * Handles flexible URL input and normalization
 */

export interface URLParseResult {
  original: string;
  normalized: string;
  domain: string;
  isValid: boolean;
  hasProtocol: boolean;
  hasWww: boolean;
}

/**
 * Normalize and validate URL input
 * Accepts various formats: www.example.com, https://www.example.com, example.com
 */
export function parseAndNormalizeUrl(input: string): URLParseResult {
  if (!input || typeof input !== 'string') {
    return {
      original: input || '',
      normalized: '',
      domain: '',
      isValid: false,
      hasProtocol: false,
      hasWww: false
    };
  }

  const original = input.trim();
  let normalized = original;
  let hasProtocol = false;
  let hasWww = false;

  // Check if it has a protocol
  if (original.startsWith('http://') || original.startsWith('https://')) {
    hasProtocol = true;
  } else {
    // Add https:// if no protocol
    normalized = `https://${original}`;
  }

  // Check if it has www
  if (normalized.includes('www.')) {
    hasWww = true;
  }

  // Extract domain from URL
  let domain = '';
  let isValid = false;

  try {
    const url = new URL(normalized);
    domain = url.hostname;
    
    // Remove www. from domain for consistency
    if (domain.startsWith('www.')) {
      domain = domain.substring(4);
    }
    
    // Basic domain validation
    isValid = domain.length > 0 && domain.includes('.') && !domain.includes(' ');
  } catch (error) {
    // If URL parsing fails, try to extract domain manually
    const cleanInput = original.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (cleanInput && cleanInput.includes('.') && !cleanInput.includes(' ')) {
      domain = cleanInput;
      isValid = true;
      normalized = `https://www.${domain}`;
      hasWww = true;
    }
  }

  return {
    original,
    normalized,
    domain,
    isValid,
    hasProtocol,
    hasWww
  };
}

/**
 * Validate if input looks like a valid domain or URL
 */
export function isValidUrlOrDomain(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  
  const trimmed = input.trim();
  if (trimmed.length === 0) return false;

  // Try parsing as URL first
  const result = parseAndNormalizeUrl(trimmed);
  if (result.isValid) return true;

  // Check if it's a simple domain format
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.([a-zA-Z]{2,}|[a-zA-Z]{2,}\.[a-zA-Z]{2,})$/;
  return domainRegex.test(trimmed);
}

/**
 * Format URL for display (always show with www and https)
 */
export function formatUrlForDisplay(input: string): string {
  const result = parseAndNormalizeUrl(input);
  if (!result.isValid) return input;
  
  // Always return with www and https for consistency
  return `https://www.${result.domain}`;
}

/**
 * Get domain only (without www or protocol)
 */
export function extractDomain(input: string): string {
  const result = parseAndNormalizeUrl(input);
  return result.domain;
}

/**
 * Validate Google Business Profile ID format
 */
export function isValidGoogleBusinessProfileId(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  
  const trimmed = input.trim();
  
  // Google Business Profile IDs typically start with "ChIJ" and are long strings
  const gbpIdRegex = /^ChIJ[a-zA-Z0-9_-]{20,}$/;
  return gbpIdRegex.test(trimmed);
}

/**
 * Normalize Google Business Profile ID
 */
export function normalizeGoogleBusinessProfileId(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input.trim();
}

/**
 * Get helpful placeholder text based on input type
 */
export function getPlaceholderText(type: 'website' | 'gbp'): string {
  switch (type) {
    case 'website':
      return 'www.yourdealership.com or https://www.yourdealership.com';
    case 'gbp':
      return 'ChIJ... (Google Business Profile ID)';
    default:
      return '';
  }
}

/**
 * Get validation error message
 */
export function getValidationError(input: string, type: 'website' | 'gbp'): string {
  if (!input || input.trim().length === 0) {
    return type === 'website' ? 'Website URL is required' : 'Google Business Profile ID is required';
  }

  if (type === 'website') {
    if (!isValidUrlOrDomain(input)) {
      return 'Please enter a valid website URL (e.g., www.yourdealership.com)';
    }
  } else if (type === 'gbp') {
    if (!isValidGoogleBusinessProfileId(input)) {
      return 'Please enter a valid Google Business Profile ID (starts with ChIJ...)';
    }
  }

  return '';
}
