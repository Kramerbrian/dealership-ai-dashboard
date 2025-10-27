/**
 * DealershipAI Chrome Extension Popup Script
 * Handles the popup interface and API communication
 */

class DealershipAIPopup {
  constructor() {
    this.apiKey = null;
    this.currentTab = null;
    this.scanData = null;
    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.getCurrentTab();
    await this.analyzeCurrentSite();
    this.setupEventListeners();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['apiKey', 'settings']);
      this.apiKey = result.apiKey;
      
      if (!this.apiKey) {
        this.showSetupRequired();
        return;
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      
      if (tab.url) {
        document.getElementById('siteUrl').textContent = this.extractDomain(tab.url);
        document.getElementById('siteType').textContent = this.detectSiteType(tab.url);
      }
    } catch (error) {
      console.error('Error getting current tab:', error);
    }
  }

  async analyzeCurrentSite() {
    if (!this.currentTab || !this.apiKey) return;

    try {
      this.showLoadingState();
      
      const domain = this.extractDomain(this.currentTab.url);
      const response = await this.callAPI('/api/public/v1/insights', {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      }, `?domain=${encodeURIComponent(domain)}`);

      if (response.success) {
        this.scanData = response.data;
        this.updateUI(response.data);
      } else {
        this.showError(response.error || 'Failed to analyze site');
      }
    } catch (error) {
      console.error('Error analyzing site:', error);
      this.showError('Network error. Please try again.');
    }
  }

  updateUI(data) {
    // Update AI Visibility Score
    document.getElementById('scoreValue').textContent = data.aiVisibility.toFixed(1);
    document.getElementById('scoreFill').style.width = `${data.aiVisibility}%`;
    
    // Update rank and quick wins
    document.getElementById('rankValue').textContent = `${data.rank}/${data.total}`;
    document.getElementById('quickWinsValue').textContent = data.quickWins;

    // Update competitors
    this.updateCompetitors(data.competitors);

    // Update status
    this.updateStatus('success', 'Analysis Complete');

    // Show insights if available
    if (data.quickWins > 0) {
      this.showInsights(data);
    }
  }

  updateCompetitors(competitors) {
    const competitorsList = document.getElementById('competitorsList');
    competitorsList.innerHTML = '';

    competitors.slice(0, 3).forEach(competitor => {
      const competitorItem = document.createElement('div');
      competitorItem.className = 'competitor-item';
      competitorItem.innerHTML = `
        <div class="competitor-name">${competitor.name}</div>
        <div class="competitor-score ${competitor.gap > 0 ? 'behind' : 'ahead'}">
          ${competitor.aiVisibility.toFixed(1)}%
          ${competitor.gap > 0 ? `+${competitor.gap.toFixed(1)}` : competitor.gap.toFixed(1)}
        </div>
      `;
      competitorsList.appendChild(competitorItem);
    });
  }

  showInsights(data) {
    const insightsSection = document.getElementById('insightsSection');
    const insightsList = document.getElementById('insightsList');
    
    insightsList.innerHTML = `
      <div class="insight-item">
        <div class="insight-icon">💡</div>
        <div class="insight-text">
          <strong>${data.quickWins} Quick Wins Available</strong>
          <p>Optimize your AI visibility with these actionable insights</p>
        </div>
      </div>
    `;
    
    insightsSection.style.display = 'block';
  }

  showLoadingState() {
    this.updateStatus('loading', 'Analyzing...');
    document.getElementById('scoreValue').textContent = '--';
    document.getElementById('rankValue').textContent = '--';
    document.getElementById('quickWinsValue').textContent = '--';
  }

  showError(message) {
    this.updateStatus('error', message);
  }

  showSetupRequired() {
    document.getElementById('currentSite').innerHTML = `
      <div class="setup-required">
        <div class="setup-icon">⚙️</div>
        <div class="setup-text">
          <h3>Setup Required</h3>
          <p>Please configure your API key in the extension settings.</p>
          <button class="action-btn primary" id="openSettingsBtn">Open Settings</button>
        </div>
      </div>
    `;
  }

  updateStatus(type, message) {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('.status-text');
    
    statusIndicator.className = `status-indicator ${type}`;
    statusText.textContent = message;
  }

  setupEventListeners() {
    // Full scan button
    document.getElementById('fullScanBtn')?.addEventListener('click', () => {
      this.startFullScan();
    });

    // View dashboard button
    document.getElementById('viewDashboardBtn')?.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://dealershipai.com/dashboard' });
    });

    // Settings button
    document.getElementById('openSettingsBtn')?.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }

  async startFullScan() {
    if (!this.currentTab || !this.apiKey) return;

    try {
      this.showLoadingState();
      
      const domain = this.extractDomain(this.currentTab.url);
      const response = await this.callAPI('/api/public/v1/insights', {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: domain,
          scanType: 'full'
        })
      });

      if (response.success) {
        this.updateStatus('loading', 'Scan in Progress...');
        // Poll for scan completion
        this.pollScanStatus(response.data.scanId);
      } else {
        this.showError(response.error || 'Failed to start scan');
      }
    } catch (error) {
      console.error('Error starting scan:', error);
      this.showError('Network error. Please try again.');
    }
  }

  async pollScanStatus(scanId) {
    // In a real implementation, this would poll the API for scan completion
    setTimeout(() => {
      this.analyzeCurrentSite();
    }, 5000);
  }

  async callAPI(endpoint, options = {}, queryString = '') {
    const baseURL = 'https://dealershipai.com';
    const url = `${baseURL}${endpoint}${queryString}`;
    
    try {
      const response = await fetch(url, options);
      return await response.json();
    } catch (error) {
      throw new Error(`API call failed: ${error.message}`);
    }
  }

  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (error) {
      return url;
    }
  }

  detectSiteType(url) {
    const automotiveKeywords = ['dealership', 'auto', 'car', 'vehicle', 'dealership'];
    const domain = url.toLowerCase();
    
    return automotiveKeywords.some(keyword => domain.includes(keyword)) 
      ? 'Automotive Dealership' 
      : 'Website';
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new DealershipAIPopup();
});
