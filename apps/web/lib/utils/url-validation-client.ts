/**
 * Client-side URL validation utility
 * Shared across landing page and onboarding components
 */

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Validates and normalizes a URL input on the client side
 * Provides immediate feedback before API calls
 */
export function validateUrlClient(input: string): UrlValidationResult {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: 'URL is required' };
  }

  if (input.length > 2048) {
    return { valid: false, error: 'URL is too long (max 2048 characters)' };
  }

  try {
    let normalized = input.trim().toLowerCase();
    
    // Add protocol if missing
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }

    const urlObj = new URL(normalized);
    const hostname = urlObj.hostname.toLowerCase();

    // Basic validation
    if (hostname.length === 0 || hostname.length > 253) {
      return { valid: false, error: 'Invalid domain name' };
    }

    // Block localhost and private IPs
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
      return { valid: false, error: 'Please enter a valid website URL' };
    }

    // Block private IP ranges
    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(hostname)) {
      return { valid: false, error: 'Please enter a valid public website URL' };
    }

    return { valid: true, normalized: urlObj.origin };
  } catch {
    return { valid: false, error: 'Invalid URL format. Please enter a valid website URL' };
  }
}

