/**
 * Security utility for redacting sensitive information from logs and telemetry
 */

export interface RedactionConfig {
  emailPattern?: RegExp;
  phonePattern?: RegExp;
  ssnPattern?: RegExp;
  creditCardPattern?: RegExp;
  apiKeyPattern?: RegExp;
  customPatterns?: RegExp[];
  redactText?: string;
}

const DEFAULT_PATTERNS: Required<Omit<RedactionConfig, 'customPatterns'>> & { customPatterns: RegExp[] } = {
  // Email addresses
  emailPattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,

  // Phone numbers (US format)
  phonePattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,

  // Social Security Numbers
  ssnPattern: /\b\d{3}-\d{2}-\d{4}\b/g,

  // Credit Card Numbers (simple pattern)
  creditCardPattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,

  // API Keys (common patterns)
  apiKeyPattern: /\b(sk|pk|api)[-_][a-zA-Z0-9]{20,}\b/gi,

  customPatterns: [],

  redactText: '[REDACTED]',
};

/**
 * Redact sensitive information from a string
 */
export function redact(text: string, config?: RedactionConfig): string {
  if (!text) return text;

  const finalConfig = { ...DEFAULT_PATTERNS, ...config };
  let redacted = text;

  // Apply all patterns
  redacted = redacted.replace(finalConfig.emailPattern, finalConfig.redactText);
  redacted = redacted.replace(finalConfig.phonePattern, finalConfig.redactText);
  redacted = redacted.replace(finalConfig.ssnPattern, finalConfig.redactText);
  redacted = redacted.replace(finalConfig.creditCardPattern, finalConfig.redactText);
  redacted = redacted.replace(finalConfig.apiKeyPattern, finalConfig.redactText);

  // Apply custom patterns
  if (config?.customPatterns) {
    config.customPatterns.forEach(pattern => {
      redacted = redacted.replace(pattern, finalConfig.redactText);
    });
  }

  return redacted;
}

/**
 * Redact sensitive information from an object (recursively)
 */
export function redactObject<T>(obj: T, config?: RedactionConfig): T {
  if (!obj) return obj;

  if (typeof obj === 'string') {
    return redact(obj, config) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactObject(item, config)) as T;
  }

  if (typeof obj === 'object') {
    const redacted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      redacted[key] = redactObject(value, config);
    }
    return redacted;
  }

  return obj;
}

/**
 * Redact sensitive keys from an object by key name
 */
export function redactByKeys<T extends Record<string, any>>(
  obj: T,
  sensitiveKeys: string[] = ['password', 'token', 'apiKey', 'secret', 'ssn', 'creditCard'],
  redactText: string = '[REDACTED]'
): T {
  if (!obj || typeof obj !== 'object') return obj;

  const redacted: any = Array.isArray(obj) ? [] : {};

  for (const [key, value] of Object.entries(obj)) {
    const shouldRedact = sensitiveKeys.some(
      sensitiveKey => key.toLowerCase().includes(sensitiveKey.toLowerCase())
    );

    if (shouldRedact) {
      redacted[key] = redactText;
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactByKeys(value, sensitiveKeys, redactText);
    } else {
      redacted[key] = value;
    }
  }

  return redacted;
}
