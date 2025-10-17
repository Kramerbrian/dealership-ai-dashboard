#!/usr/bin/env node

/**
 * Intelligence Dashboard CTA Audit Script
 * 
 * This script tests all CTAs and buttons in the Intelligence Dashboard
 * Run with: node test-intelligence-ctas.js
 */

const puppeteer = require('puppeteer');

class IntelligenceDashboardAuditor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
    this.baseUrl = 'http://localhost:3001';
  }

  async init() {
    console.log('🚀 Starting Intelligence Dashboard CTA Audit...\n');
    
    this.browser = await puppeteer.launch({ 
      headless: false, // Set to true for CI/CD
      devtools: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication Flow...');
    
    try {
      // Navigate to intelligence dashboard
      await this.page.goto(`${this.baseUrl}/intelligence`);
      
      // Wait for page to load
      await this.page.waitForSelector('header', { timeout: 10000 });
      
      // Check if we're redirected to sign-in (expected for unauthenticated users)
      const currentUrl = this.page.url();
      if (currentUrl.includes('/auth/signin')) {
        this.recordResult('Authentication', 'PASS', 'Redirected to sign-in as expected');
        
        // Test sign-in flow
        await this.testSignInFlow();
      } else {
        this.recordResult('Authentication', 'FAIL', 'Should redirect to sign-in for unauthenticated users');
      }
      
    } catch (error) {
      this.recordResult('Authentication', 'ERROR', `Failed to load page: ${error.message}`);
    }
  }

  async testSignInFlow() {
    console.log('🔑 Testing Sign-In Flow...');
    
    try {
      // Check if OAuth buttons are present
      const googleButton = await this.page.$('button[data-provider="google"]');
      const githubButton = await this.page.$('button[data-provider="github"]');
      
      if (googleButton) {
        this.recordResult('Google OAuth Button', 'PASS', 'Google OAuth button found');
      } else {
        this.recordResult('Google OAuth Button', 'FAIL', 'Google OAuth button not found');
      }
      
      if (githubButton) {
        this.recordResult('GitHub OAuth Button', 'PASS', 'GitHub OAuth button found');
      } else {
        this.recordResult('GitHub OAuth Button', 'FAIL', 'GitHub OAuth button not found');
      }
      
    } catch (error) {
      this.recordResult('Sign-In Flow', 'ERROR', `Sign-in test failed: ${error.message}`);
    }
  }

  async testQuickActions() {
    console.log('⚡ Testing Quick Actions...');
    
    const quickActions = [
      { name: 'Run Full Audit', selector: 'button:has-text("Run Full Audit")' },
      { name: 'AI Health Check', selector: 'button:has-text("AI Health Check")' },
      { name: 'Competitor Analysis', selector: 'button:has-text("Competitor Analysis")' },
      { name: 'Get Recommendations', selector: 'button:has-text("Get Recommendations")' }
    ];

    for (const action of quickActions) {
      try {
        // Look for the button using text content
        const button = await this.page.$x(`//button[contains(text(), "${action.name}")]`);
        
        if (button && button.length > 0) {
          // Check if button is clickable
          const isDisabled = await this.page.evaluate(el => el.disabled, button[0]);
          
          if (!isDisabled) {
            // Click the button
            await button[0].click();
            
            // Wait a moment for any response
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.recordResult(action.name, 'PASS', 'Button found and clickable');
          } else {
            this.recordResult(action.name, 'WARN', 'Button found but disabled');
          }
        } else {
          this.recordResult(action.name, 'FAIL', 'Button not found');
        }
        
      } catch (error) {
        this.recordResult(action.name, 'ERROR', `Test failed: ${error.message}`);
      }
    }
  }

  async testDashboardControls() {
    console.log('🎛️ Testing Dashboard Controls...');
    
    const controls = [
      { name: 'Auto Refresh Toggle', selector: 'button[title*="refresh"]' },
      { name: 'Manual Refresh', selector: 'button[title*="refresh"]' },
      { name: 'Theme Toggle', selector: 'button[title*="theme"]' },
      { name: 'Settings Button', selector: 'button[title*="settings"]' }
    ];

    for (const control of controls) {
      try {
        const button = await this.page.$(control.selector);
        
        if (button) {
          const isClickable = await this.page.evaluate(el => !el.disabled, button);
          
          if (isClickable) {
            await button.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            this.recordResult(control.name, 'PASS', 'Control found and clickable');
          } else {
            this.recordResult(control.name, 'WARN', 'Control found but disabled');
          }
        } else {
          this.recordResult(control.name, 'FAIL', 'Control not found');
        }
        
      } catch (error) {
        this.recordResult(control.name, 'ERROR', `Test failed: ${error.message}`);
      }
    }
  }

  async testResponsiveDesign() {
    console.log('📱 Testing Responsive Design...');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      try {
        await this.page.setViewport({ width: viewport.width, height: viewport.height });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if main elements are visible
        const header = await this.page.$('header');
        const quickActions = await this.page.$('[class*="Quick Actions"]');
        
        if (header && quickActions) {
          this.recordResult(`${viewport.name} Layout`, 'PASS', 'Main elements visible');
        } else {
          this.recordResult(`${viewport.name} Layout`, 'FAIL', 'Main elements not visible');
        }
        
      } catch (error) {
        this.recordResult(`${viewport.name} Layout`, 'ERROR', `Test failed: ${error.message}`);
      }
    }
  }

  async testErrorHandling() {
    console.log('🚨 Testing Error Handling...');
    
    try {
      // Simulate network failure
      await this.page.setOfflineMode(true);
      
      // Try to trigger an action
      const refreshButton = await this.page.$('button[title*="refresh"]');
      if (refreshButton) {
        await refreshButton.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check for error message
        const errorMessage = await this.page.$('[class*="error"]');
        if (errorMessage) {
          this.recordResult('Error Handling', 'PASS', 'Error message displayed');
        } else {
          this.recordResult('Error Handling', 'FAIL', 'No error message displayed');
        }
      }
      
      // Restore network
      await this.page.setOfflineMode(false);
      
    } catch (error) {
      this.recordResult('Error Handling', 'ERROR', `Test failed: ${error.message}`);
    }
  }

  recordResult(test, status, message) {
    const result = {
      test,
      status,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.results.push(result);
    
    const statusIcon = {
      'PASS': '✅',
      'FAIL': '❌',
      'WARN': '⚠️',
      'ERROR': '🔥'
    };
    
    console.log(`${statusIcon[status]} ${test}: ${message}`);
  }

  generateReport() {
    console.log('\n📊 AUDIT REPORT');
    console.log('================\n');
    
    const summary = this.results.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('Summary:');
    console.log(`✅ Passed: ${summary.PASS || 0}`);
    console.log(`❌ Failed: ${summary.FAIL || 0}`);
    console.log(`⚠️ Warnings: ${summary.WARN || 0}`);
    console.log(`🔥 Errors: ${summary.ERROR || 0}`);
    
    console.log('\nDetailed Results:');
    this.results.forEach(result => {
      const statusIcon = {
        'PASS': '✅',
        'FAIL': '❌',
        'WARN': '⚠️',
        'ERROR': '🔥'
      };
      console.log(`${statusIcon[result.status]} ${result.test}: ${result.message}`);
    });
    
    // Save report to file
    const fs = require('fs');
    const reportData = {
      timestamp: new Date().toISOString(),
      summary,
      results: this.results
    };
    
    fs.writeFileSync('intelligence-dashboard-audit-report.json', JSON.stringify(reportData, null, 2));
    console.log('\n📄 Report saved to: intelligence-dashboard-audit-report.json');
  }

  async run() {
    try {
      await this.init();
      
      await this.testAuthentication();
      await this.testQuickActions();
      await this.testDashboardControls();
      await this.testResponsiveDesign();
      await this.testErrorHandling();
      
    } catch (error) {
      console.error('🔥 Audit failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
      
      this.generateReport();
    }
  }
}

// Run the audit
if (require.main === module) {
  const auditor = new IntelligenceDashboardAuditor();
  auditor.run().catch(console.error);
}

module.exports = IntelligenceDashboardAuditor;
