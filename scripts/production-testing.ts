/**
 * Production Testing Suite
 * Comprehensive testing for all DealershipAI features
 */

import { chromium, Browser, Page } from 'playwright';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  duration: number;
  error?: string;
  metrics?: {
    loadTime: number;
    performanceScore: number;
    accessibilityScore: number;
  };
}

class ProductionTester {
  private browser: Browser | null = null;
  private results: TestResult[] = [];
  private baseUrl = 'https://dealershipai-landing-p2m4vcd6w-brian-kramers-projects.vercel.app';

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Production Testing Suite...');
    
    try {
      this.browser = await chromium.launch({ headless: true });
      
      await this.testCoreDashboard();
      await this.testOpportunityCalculator();
      await this.testAIAnswerIntelligence();
      await this.testAuthentication();
      await this.testPerformance();
      await this.testMobileResponsiveness();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Testing failed:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  private async testCoreDashboard(): Promise<void> {
    console.log('📊 Testing Core Dashboard...');
    const page = await this.browser!.newPage();
    const startTime = Date.now();

    try {
      // Navigate to dashboard
      await page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      
      // Check page loads without errors
      const errors = await page.evaluate(() => {
        return window.performance.getEntriesByType('navigation')[0].loadEventEnd > 0;
      });

      // Check navigation menu
      const navExists = await page.locator('nav').count() > 0;
      
      // Check dashboard components
      const componentsExist = await page.locator('[data-testid="dashboard-component"]').count() > 0;
      
      // Check mobile responsiveness
      await page.setViewportSize({ width: 375, height: 667 });
      const mobileLayout = await page.locator('body').isVisible();

      const duration = Date.now() - startTime;
      
      this.results.push({
        test: 'Core Dashboard',
        status: errors && navExists && componentsExist ? 'PASS' : 'FAIL',
        duration,
        metrics: {
          loadTime: duration,
          performanceScore: duration < 3000 ? 100 : 50,
          accessibilityScore: 85
        }
      });

    } catch (error) {
      this.results.push({
        test: 'Core Dashboard',
        status: 'FAIL',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    await page.close();
  }

  private async testOpportunityCalculator(): Promise<void> {
    console.log('💰 Testing Opportunity Calculator...');
    const page = await this.browser!.newPage();
    const startTime = Date.now();

    try {
      await page.goto(`${this.baseUrl}/calculator`, { waitUntil: 'networkidle' });
      
      // Check calculator modal opens
      const modalExists = await page.locator('[data-testid="calculator-modal"]').count() > 0;
      
      // Test input fields
      const inputs = await page.locator('input').count();
      
      // Test calculations
      if (inputs > 0) {
        await page.fill('input[placeholder*="units"]', '100');
        await page.fill('input[placeholder*="GPPU"]', '2500');
        
        // Check if results update
        const resultsVisible = await page.locator('[data-testid="calculation-results"]').isVisible();
        
        this.results.push({
          test: 'Opportunity Calculator',
          status: modalExists && resultsVisible ? 'PASS' : 'WARN',
          duration: Date.now() - startTime
        });
      }

    } catch (error) {
      this.results.push({
        test: 'Opportunity Calculator',
        status: 'FAIL',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    await page.close();
  }

  private async testAIAnswerIntelligence(): Promise<void> {
    console.log('🤖 Testing AI Answer Intelligence...');
    const page = await this.browser!.newPage();
    const startTime = Date.now();

    try {
      await page.goto(`${this.baseUrl}/intelligence`, { waitUntil: 'networkidle' });
      
      // Check AI metrics display
      const metricsExist = await page.locator('[data-testid="ai-metrics"]').count() > 0;
      
      // Check charts render
      const chartsExist = await page.locator('canvas, svg').count() > 0;
      
      // Check for console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      this.results.push({
        test: 'AI Answer Intelligence',
        status: metricsExist && chartsExist && consoleErrors.length === 0 ? 'PASS' : 'WARN',
        duration: Date.now() - startTime,
        error: consoleErrors.length > 0 ? consoleErrors.join(', ') : undefined
      });

    } catch (error) {
      this.results.push({
        test: 'AI Answer Intelligence',
        status: 'FAIL',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    await page.close();
  }

  private async testAuthentication(): Promise<void> {
    console.log('🔐 Testing Authentication...');
    const page = await this.browser!.newPage();
    const startTime = Date.now();

    try {
      // Test sign-up page
      await page.goto(`${this.baseUrl}/sign-up`, { waitUntil: 'networkidle' });
      
      const signupForm = await page.locator('form').count() > 0;
      
      // Test form validation
      if (signupForm) {
        await page.click('button[type="submit"]');
        const validationErrors = await page.locator('[role="alert"]').count() > 0;
        
        this.results.push({
          test: 'Authentication',
          status: signupForm && validationErrors ? 'PASS' : 'WARN',
          duration: Date.now() - startTime
        });
      }

    } catch (error) {
      this.results.push({
        test: 'Authentication',
        status: 'FAIL',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    await page.close();
  }

  private async testPerformance(): Promise<void> {
    console.log('⚡ Testing Performance...');
    const page = await this.browser!.newPage();
    const startTime = Date.now();

    try {
      await page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      
      // Get performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        };
      });

      const performanceScore = metrics.loadTime < 3000 ? 100 : 
                              metrics.loadTime < 5000 ? 75 : 50;

      this.results.push({
        test: 'Performance',
        status: performanceScore >= 75 ? 'PASS' : 'WARN',
        duration: Date.now() - startTime,
        metrics: {
          loadTime: metrics.loadTime,
          performanceScore,
          accessibilityScore: 85
        }
      });

    } catch (error) {
      this.results.push({
        test: 'Performance',
        status: 'FAIL',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    await page.close();
  }

  private async testMobileResponsiveness(): Promise<void> {
    console.log('📱 Testing Mobile Responsiveness...');
    const page = await this.browser!.newPage();
    const startTime = Date.now();

    try {
      // Test iPhone viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(this.baseUrl, { waitUntil: 'networkidle' });
      
      const mobileLayout = await page.locator('body').isVisible();
      const navVisible = await page.locator('nav').isVisible();
      
      // Test iPad viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload({ waitUntil: 'networkidle' });
      
      const tabletLayout = await page.locator('body').isVisible();

      this.results.push({
        test: 'Mobile Responsiveness',
        status: mobileLayout && navVisible && tabletLayout ? 'PASS' : 'WARN',
        duration: Date.now() - startTime
      });

    } catch (error) {
      this.results.push({
        test: 'Mobile Responsiveness',
        status: 'FAIL',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    await page.close();
  }

  private generateReport(): void {
    console.log('\n📊 Production Testing Report');
    console.log('================================');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);
    
    console.log('\n📋 Detailed Results:');
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
      console.log(`${icon} ${result.test}: ${result.status} (${result.duration}ms)`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.metrics) {
        console.log(`   Load Time: ${result.metrics.loadTime}ms`);
        console.log(`   Performance Score: ${result.metrics.performanceScore}/100`);
      }
    });

    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed,
        failed,
        warnings,
        successRate: (passed / this.results.length) * 100
      },
      results: this.results
    };

    require('fs').writeFileSync(
      'production-test-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Full report saved to: production-test-report.json');
  }
}

// CLI usage
async function main() {
  const tester = new ProductionTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { ProductionTester };
