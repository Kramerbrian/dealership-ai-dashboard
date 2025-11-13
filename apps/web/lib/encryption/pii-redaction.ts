/**
 * PII Redaction and Field-Level Encryption
 * Handles sensitive data protection and encryption
 */

import crypto from 'crypto';

export interface PIIField {
  field: string;
  type: 'email' | 'phone' | 'ssn' | 'credit_card' | 'address' | 'name' | 'custom';
  pattern?: RegExp;
  replacement?: string;
  encrypt?: boolean;
}

export interface EncryptionConfig {
  algorithm: string;
  key: string;
  iv?: string;
}

export interface RedactionResult {
  original: any;
  redacted: any;
  redactedFields: string[];
  encryptedFields: string[];
}

export class PIIRedactor {
  private piiFields: PIIField[];
  private encryptionConfig: EncryptionConfig;
  private defaultPatterns: Map<string, RegExp>;

  constructor(piiFields: PIIField[], encryptionConfig: EncryptionConfig) {
    this.piiFields = piiFields;
    this.encryptionConfig = encryptionConfig;
    this.defaultPatterns = new Map([
      ['email', /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g],
      ['phone', /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g],
      ['ssn', /\b\d{3}-?\d{2}-?\d{4}\b/g],
      ['credit_card', /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g],
      ['address', /\d+\s+[a-zA-Z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)/gi],
    ]);
  }

  /**
   * Redact PII from an object
   */
  redactObject(obj: any): RedactionResult {
    const redacted = JSON.parse(JSON.stringify(obj));
    const redactedFields: string[] = [];
    const encryptedFields: string[] = [];

    this.redactRecursive(redacted, '', redactedFields, encryptedFields);

    return {
      original: obj,
      redacted,
      redactedFields,
      encryptedFields,
    };
  }

  /**
   * Redact PII from a string
   */
  redactString(text: string): string {
    let redacted = text;

    for (const field of this.piiFields) {
      const pattern = field.pattern || this.defaultPatterns.get(field.type);
      if (pattern) {
        redacted = redacted.replace(pattern, field.replacement || this.getDefaultReplacement(field.type));
      }
    }

    return redacted;
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data: string): string {
    const cipher = crypto.createCipher(this.encryptionConfig.algorithm, this.encryptionConfig.key);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    const decipher = crypto.createDecipher(this.encryptionConfig.algorithm, this.encryptionConfig.key);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Check if a field contains PII
   */
  containsPII(value: string): boolean {
    for (const field of this.piiFields) {
      const pattern = field.pattern || this.defaultPatterns.get(field.type);
      if (pattern && pattern.test(value)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get PII field configuration
   */
  getPIIField(fieldName: string): PIIField | undefined {
    return this.piiFields.find(field => field.field === fieldName);
  }

  /**
   * Add new PII field
   */
  addPIIField(field: PIIField): void {
    this.piiFields.push(field);
  }

  /**
   * Remove PII field
   */
  removePIIField(fieldName: string): void {
    this.piiFields = this.piiFields.filter(field => field.field !== fieldName);
  }

  /**
   * Recursively redact object properties
   */
  private redactRecursive(obj: any, path: string, redactedFields: string[], encryptedFields: string[]): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        const piiField = this.getPIIField(currentPath);
        if (piiField) {
          if (piiField.encrypt) {
            obj[key] = this.encrypt(value);
            encryptedFields.push(currentPath);
          } else {
            obj[key] = this.redactString(value);
            redactedFields.push(currentPath);
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        this.redactRecursive(value, currentPath, redactedFields, encryptedFields);
      }
    }
  }

  /**
   * Get default replacement for PII type
   */
  private getDefaultReplacement(type: string): string {
    const replacements: Record<string, string> = {
      email: '[REDACTED_EMAIL]',
      phone: '[REDACTED_PHONE]',
      ssn: '[REDACTED_SSN]',
      credit_card: '[REDACTED_CC]',
      address: '[REDACTED_ADDRESS]',
      name: '[REDACTED_NAME]',
      custom: '[REDACTED]',
    };
    return replacements[type] || '[REDACTED]';
  }
}

/**
 * Default PII fields configuration
 */
export const DEFAULT_PII_FIELDS: PIIField[] = [
  { field: 'email', type: 'email', encrypt: true },
  { field: 'phone', type: 'phone', encrypt: true },
  { field: 'ssn', type: 'ssn', encrypt: true },
  { field: 'creditCard', type: 'credit_card', encrypt: true },
  { field: 'address', type: 'address', encrypt: true },
  { field: 'firstName', type: 'name', encrypt: true },
  { field: 'lastName', type: 'name', encrypt: true },
  { field: 'fullName', type: 'name', encrypt: true },
];

/**
 * Default encryption configuration
 */
export const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-cbc',
  key: process.env.ENCRYPTION_KEY || 'default-key-change-in-production',
};

/**
 * Create PII redactor with default configuration
 */
export function createDefaultPIIRedactor(): PIIRedactor {
  return new PIIRedactor(DEFAULT_PII_FIELDS, DEFAULT_ENCRYPTION_CONFIG);
}

/**
 * Middleware for automatic PII redaction
 */
export function piiRedactionMiddleware(piiRedactor: PIIRedactor) {
  return (req: any, res: any, next: any) => {
    // Redact request body
    if (req.body && typeof req.body === 'object') {
      const result = piiRedactor.redactObject(req.body);
      req.body = result.redacted;
      req.piiRedacted = result;
    }

    // Redact query parameters
    if (req.query && typeof req.query === 'object') {
      const result = piiRedactor.redactObject(req.query);
      req.query = result.redacted;
    }

    next();
  };
}
