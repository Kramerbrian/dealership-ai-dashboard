/**
 * Lightweight Production Testing
 * No browser dependencies - API and endpoint testing only
 */

import { performance } from 'perf_hooks';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  duration: number;
  response?: any;
  error?: string;
}

class LightweightTester {
  private results: TestResult[] = [];
  private baseUrl = 'https://dealershipai-landing-rjihttran-brian-kramers-projects.vercel.app';

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Lightweight Production Testing...');
    
    await this.testHealthEndpoint();
    await this.testDashboardAPI();
    await this.testPerformanceMonitor();
    await this.testAnalyticsAPI();
    await this.testOpportunityCalculator();
    await this.testAIAnswerIntelligence();
    
    this.generateReport();
  }

  private async testHealthEndpoint(): Promise<void> {
    console.log('🏥 Testing Health Endpoint...');
    const startTime = performance.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const data = await response.json();
      
      const duration = performance.now() - startTime;
      
      this.results.push({
        test: 'Health Endpoint',
        status: response.ok && data.status === 'healthy' ? 'PASS' : 'FAIL',
        duration,
        response: data
      });

    } catch (error) {
      this.results.push({
        test: 'Health Endpoint',
        status: 'FAIL',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testDashboardAPI(): Promise<void> {
    console.log('📊 Testing Dashboard API...');
    const startTime = performance.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/dashboard/overview`);
      const data = await response.json();
      
      const duration = performance.now() - startTime;
      
      this.results.push({
        test: 'Dashboard API',
        status: response.ok && data.kpis ? 'PASS' : 'FAIL',
        duration,
        response: { hasKPIs: !!data.kpis, hasTrends: !!data.trends }
      });

    } catch (error) {
      this.results.push({
        test: 'Dashboard API',
        status: 'FAIL',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testPerformanceMonitor(): Promise<void> {
    console.log('⚡ Testing Performance Monitor...');
    const startTime = performance.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/performance/monitor`);
      const data = await response.json();
      
      const duration = performance.now() - startTime;
      
      this.results.push({
        test: 'Performance Monitor',
        status: response.ok && data.performanceScore !== undefined ? 'PASS' : 'FAIL',
        duration,
        response: { 
          performanceScore: data.performanceScore,
          hasMetrics: data.metrics?.length > 0,
          hasAlerts: data.alerts?.length >= 0
        }
      });

    } catch (error) {
      this.results.push({
        test: 'Performance Monitor',
        status: 'FAIL',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testAnalyticsAPI(): Promise<void> {
    console.log('📈 Testing Analytics API...');
    const startTime = performance.now();

    try {
      const response = await fetch(`${this.baseUrl}/api/analytics/realtime`);
      const data = await response.json();
      
      const duration = performance.now() - startTime;
      
      this.results.push({
        test: 'Analytics API',
        status: response.ok && data.visitors ? 'PASS' : 'FAIL',
        duration,
        response: { 
          hasVisitors: !!data.visitors,
          hasPageViews: !!data.pageViews,
          hasConversions: !!data.conversions
        }
      });

    } catch (error) {
      this.results.push({
        test: 'Analytics API',
        status: 'FAIL',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testOpportunityCalculator(): Promise<void> {
    console.log('💰 Testing Opportunity Calculator...');
    const startTime = performance.now();

    try {
      // Test calculator page loads
      const response = await fetch(`${this.baseUrl}/calculator`);
      const duration = performance.now() - startTime;
      
      this.results.push({
        test: 'Opportunity Calculator Page',
        status: response.ok ? 'PASS' : 'FAIL',
        duration,
        response: { status: response.status, contentType: response.headers.get('content-type') }
      });

    } catch (error) {
      this.results.push({
        test: 'Opportunity Calculator Page',
        status: 'FAIL',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testAIAnswerIntelligence(): Promise<void> {
    console.log('🤖 Testing AI Answer Intelligence...');
    const startTime = performance.now();

    try {
      // Test intelligence page loads
      const response = await fetch(`${this.baseUrl}/intelligence`);
      const duration = performance.now() - startTime;
      
      this.results.push({
        test: 'AI Answer Intelligence Page',
        status: response.ok ? 'PASS' : 'FAIL',
        duration,
        response: { status: response.status, contentType: response.headers.get('content-type') }
      });

    } catch (error) {
      this.results.push({
        test: 'AI Answer Intelligence Page',
        status: 'FAIL',
        duration: performance.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private generateReport(): void {
    console.log('\n📊 Lightweight Testing Report');
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
      console.log(`${icon} ${result.test}: ${result.status} (${result.duration.toFixed(2)}ms)`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.response) {
        console.log(`   Response: ${JSON.stringify(result.response, null, 2)}`);
      }
    });

    // Performance summary
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length;
    console.log(`\n⚡ Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
    
    const slowTests = this.results.filter(r => r.duration > 1000);
    if (slowTests.length > 0) {
      console.log(`🐌 Slow Tests (>1s): ${slowTests.map(t => t.test).join(', ')}`);
    }

    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed,
        failed,
        warnings,
        successRate: (passed / this.results.length) * 100,
        averageResponseTime: avgResponseTime
      },
      results: this.results
    };

    require('fs').writeFileSync(
      'lightweight-test-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📄 Full report saved to: lightweight-test-report.json');
    
    // Recommendations
    this.generateRecommendations();
  }

  private generateRecommendations(): void {
    console.log('\n💡 Recommendations:');
    
    const failedTests = this.results.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      console.log('🔧 Fix Failed Tests:');
      failedTests.forEach(test => {
        console.log(`   • ${test.test}: ${test.error || 'Check endpoint'}`);
      });
    }

    const slowTests = this.results.filter(r => r.duration > 1000);
    if (slowTests.length > 0) {
      console.log('⚡ Optimize Slow Endpoints:');
      slowTests.forEach(test => {
        console.log(`   • ${test.test}: ${test.duration.toFixed(2)}ms`);
      });
    }

    const passedTests = this.results.filter(r => r.status === 'PASS');
    if (passedTests.length === this.results.length) {
      console.log('🎉 All tests passed! Consider:');
      console.log('   • Adding more comprehensive API tests');
      console.log('   • Implementing load testing');
      console.log('   • Setting up monitoring alerts');
    }
  }
}

// CLI usage
async function main() {
  const tester = new LightweightTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { LightweightTester };
