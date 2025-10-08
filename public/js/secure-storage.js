/**
 * Secure Storage Utility
 * Encrypts sensitive data before storing in localStorage
 */

class SecureStorage {
  constructor() {
    // Simple XOR encryption with session-based key
    // In production, use Web Crypto API for stronger encryption
    this.sessionKey = this.generateSessionKey();
  }

  /**
   * Generate a session-based encryption key
   */
  generateSessionKey() {
    const stored = sessionStorage.getItem('_sk');
    if (stored) return stored;

    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    sessionStorage.setItem('_sk', key);
    return key;
  }

  /**
   * Simple XOR encryption
   */
  encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      const key = this.sessionKey;
      let encrypted = '';

      for (let i = 0; i < jsonString.length; i++) {
        const charCode = jsonString.charCodeAt(i);
        const keyCode = key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(charCode ^ keyCode);
      }

      // Base64 encode
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  /**
   * Simple XOR decryption
   */
  decrypt(encryptedData) {
    try {
      // Base64 decode
      const encrypted = atob(encryptedData);
      const key = this.sessionKey;
      let decrypted = '';

      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i);
        const keyCode = key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode ^ keyCode);
      }

      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  /**
   * Set item in localStorage with encryption
   */
  setItem(key, value) {
    const encrypted = this.encrypt(value);
    if (encrypted) {
      localStorage.setItem(`secure_${key}`, encrypted);
      return true;
    }
    return false;
  }

  /**
   * Get item from localStorage with decryption
   */
  getItem(key) {
    const encrypted = localStorage.getItem(`secure_${key}`);
    if (!encrypted) return null;

    return this.decrypt(encrypted);
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key) {
    localStorage.removeItem(`secure_${key}`);
  }

  /**
   * Clear all secure items
   */
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Migrate existing unencrypted data to encrypted storage
   */
  migrateFromPlainStorage(key) {
    const plainData = localStorage.getItem(key);
    if (plainData) {
      try {
        const parsed = JSON.parse(plainData);
        this.setItem(key, parsed);
        localStorage.removeItem(key); // Remove plain version
        return true;
      } catch (error) {
        console.error('Migration failed for key:', key, error);
      }
    }
    return false;
  }
}

// Export singleton instance
window.secureStorage = new SecureStorage();

// Automatically migrate sensitive keys on load
const sensitiveKeys = [
  'api_keys',
  'user_data',
  'subscription_info',
  'dealership_config'
];

sensitiveKeys.forEach(key => {
  window.secureStorage.migrateFromPlainStorage(key);
});
