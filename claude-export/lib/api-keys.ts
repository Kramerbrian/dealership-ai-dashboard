// Scoped API keys with rotation
export interface APIKey {
  id: string;
  name: string;
  key: string;
  hashedKey: string;
  tenantId: string;
  scopes: string[];
  permissions: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  rotationCount: number;
  parentKeyId?: string; // For key rotation tracking
}

export interface APIKeyScope {
  name: string;
  description: string;
  permissions: string[];
}

export interface KeyRotationPolicy {
  rotationIntervalDays: number;
  gracePeriodDays: number;
  maxActiveKeys: number;
  requireRotation: boolean;
}

export class APIKeyManager {
  private keys: Map<string, APIKey> = new Map();
  private scopes: Map<string, APIKeyScope> = new Map();
  private rotationPolicies: Map<string, KeyRotationPolicy> = new Map();

  constructor() {
    this.initializeDefaultScopes();
    this.initializeDefaultPolicies();
  }

  // Create new API key
  createKey(
    name: string,
    tenantId: string,
    scopes: string[],
    permissions: string[],
    expiresAt?: Date
  ): APIKey {
    const id = this.generateKeyId();
    const key = this.generateAPIKey();
    const hashedKey = this.hashKey(key);

    const apiKey: APIKey = {
      id,
      name,
      key,
      hashedKey,
      tenantId,
      scopes,
      permissions,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      rotationCount: 0
    };

    this.keys.set(id, apiKey);
    return apiKey;
  }

  // Validate API key
  validateKey(key: string): APIKey | null {
    const hashedKey = this.hashKey(key);
    
    for (const apiKey of this.keys.values()) {
      if (apiKey.hashedKey === hashedKey && apiKey.isActive) {
        // Check expiration
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
          return null;
        }
        
        // Update last used
        apiKey.lastUsedAt = new Date();
        this.keys.set(apiKey.id, apiKey);
        
        return apiKey;
      }
    }
    
    return null;
  }

  // Check if key has permission
  hasPermission(key: APIKey, permission: string): boolean {
    return key.permissions.includes(permission) || key.permissions.includes('*');
  }

  // Check if key has scope
  hasScope(key: APIKey, scope: string): boolean {
    return key.scopes.includes(scope) || key.scopes.includes('*');
  }

  // Rotate API key
  rotateKey(keyId: string, newName?: string): APIKey | null {
    const oldKey = this.keys.get(keyId);
    if (!oldKey || !oldKey.isActive) return null;

    // Deactivate old key
    oldKey.isActive = false;
    this.keys.set(keyId, oldKey);

    // Create new key
    const newKey = this.createKey(
      newName || `${oldKey.name} (rotated)`,
      oldKey.tenantId,
      oldKey.scopes,
      oldKey.permissions,
      oldKey.expiresAt
    );

    // Link to parent key
    newKey.parentKeyId = keyId;
    newKey.rotationCount = oldKey.rotationCount + 1;

    this.keys.set(newKey.id, newKey);
    return newKey;
  }

  // Get keys for tenant
  getKeysForTenant(tenantId: string): APIKey[] {
    return Array.from(this.keys.values())
      .filter(key => key.tenantId === tenantId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get active keys for tenant
  getActiveKeysForTenant(tenantId: string): APIKey[] {
    return this.getKeysForTenant(tenantId).filter(key => key.isActive);
  }

  // Deactivate key
  deactivateKey(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (!key) return false;

    key.isActive = false;
    key.updatedAt = new Date();
    this.keys.set(keyId, key);
    return true;
  }

  // Delete key
  deleteKey(keyId: string): boolean {
    return this.keys.delete(keyId);
  }

  // Get key by ID
  getKey(keyId: string): APIKey | null {
    return this.keys.get(keyId) || null;
  }

  // Check if key needs rotation
  needsRotation(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (!key || !key.isActive) return false;

    const policy = this.rotationPolicies.get(key.tenantId);
    if (!policy) return false;

    const daysSinceCreation = (Date.now() - key.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreation >= policy.rotationIntervalDays;
  }

  // Get keys needing rotation
  getKeysNeedingRotation(): APIKey[] {
    const keysNeedingRotation: APIKey[] = [];
    
    for (const key of this.keys.values()) {
      if (key.isActive && this.needsRotation(key.id)) {
        keysNeedingRotation.push(key);
      }
    }
    
    return keysNeedingRotation;
  }

  // Set rotation policy for tenant
  setRotationPolicy(tenantId: string, policy: KeyRotationPolicy): void {
    this.rotationPolicies.set(tenantId, policy);
  }

  // Get rotation policy for tenant
  getRotationPolicy(tenantId: string): KeyRotationPolicy | null {
    return this.rotationPolicies.get(tenantId) || null;
  }

  // Add scope
  addScope(scope: APIKeyScope): void {
    this.scopes.set(scope.name, scope);
  }

  // Get scope
  getScope(scopeName: string): APIKeyScope | null {
    return this.scopes.get(scopeName) || null;
  }

  // Get all scopes
  getAllScopes(): APIKeyScope[] {
    return Array.from(this.scopes.values());
  }

  // Generate API key
  private generateAPIKey(): string {
    const prefix = 'dai_';
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const key = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
    return prefix + key;
  }

  // Generate key ID
  private generateKeyId(): string {
    return 'key_' + crypto.getRandomValues(new Uint8Array(16))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  }

  // Hash key for storage
  private hashKey(key: string): string {
    // In production, use a proper hashing library like bcrypt
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    return crypto.subtle.digest('SHA-256', data).then(hash => {
      return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }) as any; // Simplified for demo
  }

  // Initialize default scopes
  private initializeDefaultScopes(): void {
    const defaultScopes: APIKeyScope[] = [
      {
        name: 'read',
        description: 'Read-only access to data',
        permissions: ['read:metrics', 'read:reports', 'read:dashboard']
      },
      {
        name: 'write',
        description: 'Write access to data',
        permissions: ['read:metrics', 'read:reports', 'read:dashboard', 'write:metrics', 'write:reports']
      },
      {
        name: 'admin',
        description: 'Full administrative access',
        permissions: ['*']
      },
      {
        name: 'webhook',
        description: 'Webhook access for external integrations',
        permissions: ['webhook:receive', 'webhook:send']
      },
      {
        name: 'analytics',
        description: 'Analytics and reporting access',
        permissions: ['read:metrics', 'read:reports', 'read:analytics', 'write:analytics']
      }
    ];

    for (const scope of defaultScopes) {
      this.scopes.set(scope.name, scope);
    }
  }

  // Initialize default policies
  private initializeDefaultPolicies(): void {
    const defaultPolicy: KeyRotationPolicy = {
      rotationIntervalDays: 90,
      gracePeriodDays: 7,
      maxActiveKeys: 5,
      requireRotation: true
    };

    // Set default policy for all tenants
    this.rotationPolicies.set('default', defaultPolicy);
  }
}

// Export singleton instance
export const apiKeyManager = new APIKeyManager();
