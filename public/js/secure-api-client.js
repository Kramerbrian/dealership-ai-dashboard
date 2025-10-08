/**
 * Secure API Client
 * All API calls go through server-side proxy to protect credentials
 */

class SecureAPIClient {
  constructor() {
    this.baseUrl = '/api';
  }

  /**
   * Generic fetch wrapper with error handling
   */
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Request Failed [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * Get API keys (returns masked versions)
   */
  async getApiKeys() {
    return this.request('/api-keys', {
      method: 'GET'
    });
  }

  /**
   * Save API keys
   */
  async saveApiKeys(keys) {
    return this.request('/api-keys', {
      method: 'POST',
      body: JSON.stringify({ keys })
    });
  }

  /**
   * Update specific API key
   */
  async updateApiKey(id, updates) {
    return this.request('/api-keys', {
      method: 'PUT',
      body: JSON.stringify({ id, updates })
    });
  }

  /**
   * Delete API key
   */
  async deleteApiKey(id) {
    return this.request(`/api-keys?id=${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Test API connection (without exposing keys)
   */
  async testApiConnection(platform) {
    return this.request('/test-api', {
      method: 'POST',
      body: JSON.stringify({ platform })
    });
  }
}

// Export singleton instance
window.secureAPI = new SecureAPIClient();
