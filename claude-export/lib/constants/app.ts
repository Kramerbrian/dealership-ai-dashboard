/**
 * Application-wide constants
 * Extract magic numbers and strings to improve maintainability
 */

// Timing constants (in milliseconds)
export const TIMING = {
  EXIT_INTENT_DELAY: 45000, // 45 seconds
  AUTO_SCROLL_DELAY: 100,
  DEBOUNCE_DELAY: 300,
  CACHE_TTL: 180000, // 3 minutes
  REFRESH_INTERVAL: 300000, // 5 minutes
} as const;

// URL validation constants
export const URL_LIMITS = {
  MAX_LENGTH: 2048,
  MAX_HOSTNAME_LENGTH: 253,
} as const;

// Rate limiting constants
export const RATE_LIMITS = {
  SCAN_QUICK: { limit: 10, window: 60 }, // 10 per minute
  AI_SCORES: { limit: 15, window: 60 }, // 15 per minute
  TELEMETRY: { limit: 30, window: 60 }, // 30 per minute
  PUBLIC_API: { limit: 60, window: 60 }, // 60 per minute
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETE: 'onboarding_complete',
  PLG_SCANS_LEFT: 'plg_scans_left',
  USER_PREFERENCES: 'user_preferences',
} as const;

// Default values
export const DEFAULTS = {
  DOMAIN: 'demo-dealership.com',
  DEALER_ID: 'demo-tenant',
  DAYS_RANGE: 30,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  URL_REQUIRED: 'URL is required',
  URL_TOO_LONG: `URL is too long (max ${URL_LIMITS.MAX_LENGTH} characters)`,
  INVALID_URL: 'Invalid URL format. Please enter a valid website URL',
  INVALID_DOMAIN: 'Invalid domain name',
  LOCALHOST_BLOCKED: 'Please enter a valid website URL',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SCAN_FAILED: 'Scan failed. Please try again.',
  AUTH_REQUIRED: 'Authentication required',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SCAN_COMPLETE: 'Preview ready! Sign in to view your full report.',
  ONBOARDING_SAVED: 'Onboarding status saved successfully',
} as const;

