import crypto from 'crypto';

/**
 * DealershipAI Encryption Library
 * 
 * This library provides encryption for sensitive algorithms, calculations,
 * and business logic to protect intellectual property and competitive advantage.
 */

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

// Get encryption key from environment
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  
  // Ensure key is exactly 32 bytes
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  
  return keyBuffer;
};

/**
 * Encrypt sensitive data (algorithms, calculations, business logic)
 */
export function encryptSensitiveData(data: any): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Convert data to JSON string
    const jsonData = JSON.stringify(data);
    
    // Encrypt the data
    let encrypted = cipher.update(jsonData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine IV, tag, and encrypted data
    const result = {
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      data: encrypted
    };
    
    return Buffer.from(JSON.stringify(result)).toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypt sensitive data
 */
export function decryptSensitiveData(encryptedData: string): any {
  try {
    const key = getEncryptionKey();
    const parsed = JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'));
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(parsed.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(parsed.tag, 'hex'));
    
    let decrypted = decipher.update(parsed.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
}

/**
 * Hash sensitive algorithms for integrity checking
 */
export function hashAlgorithm(algorithm: string): string {
  return crypto.createHash('sha256').update(algorithm).digest('hex');
}

/**
 * Generate secure random values for calculations
 */
export function generateSecureRandom(min: number = 0, max: number = 1): number {
  const randomBytes = crypto.randomBytes(4);
  const randomValue = randomBytes.readUInt32BE(0) / 0xffffffff;
  return min + randomValue * (max - min);
}

/**
 * Encrypt calculation results
 */
export function encryptCalculationResult(result: any, algorithmId: string): string {
  const timestamp = Date.now();
  const data = {
    result,
    algorithmId,
    timestamp,
    checksum: hashAlgorithm(JSON.stringify(result))
  };
  
  return encryptSensitiveData(data);
}

/**
 * Decrypt and validate calculation results
 */
export function decryptCalculationResult(encryptedResult: string): any {
  const data = decryptSensitiveData(encryptedResult);
  
  // Validate checksum
  const expectedChecksum = hashAlgorithm(JSON.stringify(data.result));
  if (data.checksum !== expectedChecksum) {
    throw new Error('Calculation result integrity check failed');
  }
  
  return data.result;
}

/**
 * Secure algorithm storage
 */
export class SecureAlgorithmStore {
  private static algorithms: Map<string, string> = new Map();
  
  static storeAlgorithm(id: string, algorithm: string): void {
    const encrypted = encryptSensitiveData(algorithm);
    this.algorithms.set(id, encrypted);
  }
  
  static getAlgorithm(id: string): string {
    const encrypted = this.algorithms.get(id);
    if (!encrypted) {
      throw new Error(`Algorithm ${id} not found`);
    }
    return decryptSensitiveData(encrypted);
  }
  
  static hasAlgorithm(id: string): boolean {
    return this.algorithms.has(id);
  }
}

/**
 * API Route Encryption Middleware
 */
export function withEncryption(handler: Function) {
  return async (req: any, res: any) => {
    try {
      // Add encryption context to request
      req.encryption = {
        encrypt: encryptSensitiveData,
        decrypt: decryptSensitiveData,
        hash: hashAlgorithm,
        random: generateSecureRandom
      };
      
      return await handler(req, res);
    } catch (error) {
      console.error('Encryption middleware error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        message: 'Encryption processing failed'
      });
    }
  };
}

/**
 * Validate API request integrity
 */
export function validateRequestIntegrity(req: any): boolean {
  try {
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    
    if (!signature || !timestamp) {
      return false;
    }
    
    // Check timestamp (prevent replay attacks)
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    if (now - requestTime > 300000) { // 5 minutes
      return false;
    }
    
    // Validate signature
    const expectedSignature = hashAlgorithm(
      JSON.stringify(req.body) + timestamp + process.env.API_SECRET
    );
    
    return signature === expectedSignature;
  } catch (error) {
    console.error('Request validation error:', error);
    return false;
  }
}
