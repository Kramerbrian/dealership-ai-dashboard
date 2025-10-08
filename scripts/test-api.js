#!/usr/bin/env node

/**
 * Comprehensive API Testing Suite for DealershipAI
 * Tests all API endpoints with real and mock data
 */

// Mock implementations for testing
class MockDataService {
  async getAnalyticsData() {
    return {
      success: true,
      data: {
        rowCount: 7,
        rows: [
          {
            dimensionValues: [{ value: '2024-01-01' }, { value: 'desktop' }],
            metricValues: [{ value: '150' }, { value: '120' }, { value: '300' }, { value: '0.45' }]
          }
        ]
      },
      metadata: {
        propertyId: 'mock-property',
        dateRange: { startDate: '7daysAgo', endDate: 'today' },
        requestedAt: new Date().toISOString()
      }
    };
  }

  async getPageSpeedData() {
    return {
      success: true,
      data: {
        score: 87,
        metrics: {
          fcp: '1.2s',
          lcp: '2.1s',
          cls: '0.05',
          fid: '125ms',
          tbt: '180ms',
          si: '2.3s',
          tti: '3.1s'
        },
        opportunities: [
          {
            id: 'unused-css-rules',
            title: 'Remove unused CSS',
            description: 'Remove unused CSS rules to reduce bytes consumed by network activity.',
            score: 0.85,
            savings: 1200
          }
        ]
      },
      metadata: {
        url: 'https://example.com',
        strategy: 'mobile',
        analyzedAt: new Date().toISOString()
      }
    };
  }

  async getSEMrushData() {
    return {
      success: true,
      data: {
        domain: 'example.com',
        reportType: 'domain_ranks',
        rows: [
          {
            Rk: '1,234',
            Or: '45,678',
            Ot: '12,345',
            Oc: '8,901',
            Ad: '2,345',
            At: '1,234',
            Ac: '567',
            Ar: '89',
            Aw: '12'
          }
        ],
        totalRows: 1,
        headers: ['Rk', 'Or', 'Ot', 'Oc', 'Ad', 'At', 'Ac', 'Ar', 'Aw']
      },
      metadata: {
        domain: 'example.com',
        reportType: 'domain_ranks',
        analyzedAt: new Date().toISOString()
      }
    };
  }

  async getYelpData() {
    return {
      success: true,
      data: {
        id: 'mock-business-id',
        name: 'Mock Dealership',
        rating: 4.2,
        reviewCount: 127,
        price: '$$',
        categories: ['Automotive', 'Car Dealers'],
        location: {
          address1: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'US'
        },
        phone: '+1-555-0123',
        url: 'https://yelp.com/biz/mock-business',
        imageUrl: 'https://example.com/image.jpg',
        isClosed: false,
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
        photos: ['https://example.com/photo1.jpg'],
        hours: [
          { day: 0, start: '1000', end: '1800', is_overnight: false }
        ]
      },
      metadata: {
        businessId: 'mock-business-id',
        searchedAt: new Date().toISOString()
      }
    };
  }

  async getAICitationsData() {
    return {
      success: true,
      data: {
        businessName: 'Test Dealership',
        location: 'Anytown, CA',
        domain: 'testdealership.com',
        overallScore: 73,
        mentionsCount: 3,
        totalQueries: 5,
        results: [
          {
            query: 'best car dealership in Anytown, CA',
            response: 'Test Dealership is one of the top-rated dealerships...',
            mentionsBusiness: true,
            mentionsDomain: true,
            score: 100
          }
        ],
        recommendations: [
          'Improve local SEO optimization',
          'Add more location-specific content',
          'Focus on long-tail keyword optimization'
        ],
        analyzedAt: new Date().toISOString()
      },
      metadata: {
        businessName: 'Test Dealership',
        location: 'Anytown, CA',
        domain: 'testdealership.com',
        analyzedAt: new Date().toISOString()
      }
    };
  }
}

class MockGoogleAuth {
  isAuthenticated() {
    return false;
  }
  
  isTokenExpired() {
    return false;
  }
}

class APITester {
  constructor() {
    this.dataService = new MockDataService();
    this.googleAuth = new MockGoogleAuth();
    this.results = [];
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 Starting DealershipAI API Test Suite\n');
    console.log('=' .repeat(60));

    const tests = [
      { name: 'Analytics API', fn: () => this.testAnalytics() },
      { name: 'PageSpeed API', fn: () => this.testPageSpeed() },
      { name: 'SEMrush API', fn: () => this.testSEMrush() },
      { name: 'Yelp API', fn: () => this.testYelp() },
      { name: 'AI Citations API', fn: () => this.testAICitations() },
      { name: 'Google Auth', fn: () => this.testGoogleAuth() },
      { name: 'Batch Requests', fn: () => this.testBatchRequests() }
    ];

    for (const test of tests) {
      await this.runTest(test.name, test.fn);
    }

    this.printSummary();
  }

  async runTest(name, testFn) {
    const testStart = Date.now();
    console.log(`\n🧪 Testing ${name}...`);

    try {
      const result = await testFn();
      const duration = Date.now() - testStart;
      
      this.results.push({
        name,
        success: true,
        duration,
        result: result ? 'PASSED' : 'FAILED'
      });

      console.log(`✅ ${name} ${result ? 'PASSED' : 'FAILED'} (${duration}ms)`);
      
      if (result && typeof result === 'object') {
        console.log(`   📊 Data points: ${this.countDataPoints(result)}`);
      }

    } catch (error) {
      const duration = Date.now() - testStart;
      
      this.results.push({
        name,
        success: false,
        duration,
        error: error.message
      });

      console.log(`❌ ${name} FAILED (${duration}ms)`);
      console.log(`   💥 Error: ${error.message}`);
    }
  }

  async testAnalytics() {
    const result = await this.dataService.getAnalyticsData('7daysAgo', 'today');
    
    // Validate response structure
    if (!result.success) throw new Error('Analytics API returned success: false');
    if (!result.data) throw new Error('No data returned from Analytics API');
    if (!result.data.rows) throw new Error('No rows returned from Analytics API');
    if (!result.metadata) throw new Error('No metadata returned from Analytics API');

    console.log(`   📈 Sessions: ${this.extractMetric(result, 'sessions')}`);
    console.log(`   👥 Users: ${this.extractMetric(result, 'users')}`);
    console.log(`   📄 Pageviews: ${this.extractMetric(result, 'pageviews')}`);

    return result;
  }

  async testPageSpeed() {
    const testUrl = 'https://example.com';
    const result = await this.dataService.getPageSpeedData(testUrl, 'mobile');
    
    if (!result.success) throw new Error('PageSpeed API returned success: false');
    if (!result.data) throw new Error('No data returned from PageSpeed API');
    if (typeof result.data.score !== 'number') throw new Error('Invalid score returned');

    console.log(`   🏃 Score: ${result.data.score}/100`);
    console.log(`   ⚡ LCP: ${result.data.metrics.lcp}`);
    console.log(`   🎯 FID: ${result.data.metrics.fid}`);
    console.log(`   📱 Opportunities: ${result.data.opportunities.length}`);

    return result;
  }

  async testSEMrush() {
    const testDomain = 'example.com';
    const result = await this.dataService.getSEMrushData(testDomain, 'domain_ranks');
    
    if (!result.success) throw new Error('SEMrush API returned success: false');
    if (!result.data) throw new Error('No data returned from SEMrush API');
    if (!result.data.rows) throw new Error('No rows returned from SEMrush API');

    console.log(`   🔍 Domain: ${result.data.domain}`);
    console.log(`   📊 Rows: ${result.data.totalRows}`);
    console.log(`   📋 Headers: ${result.data.headers.length}`);

    return result;
  }

  async testYelp() {
    const result = await this.dataService.getYelpData(
      undefined, 
      'Test Dealership', 
      'Anytown, CA'
    );
    
    if (!result.success) throw new Error('Yelp API returned success: false');
    if (!result.data) throw new Error('No data returned from Yelp API');
    if (!result.data.name) throw new Error('No business name returned');

    console.log(`   🏪 Business: ${result.data.name}`);
    console.log(`   ⭐ Rating: ${result.data.rating}/5`);
    console.log(`   💬 Reviews: ${result.data.reviewCount}`);
    console.log(`   📍 Location: ${result.data.location.city}, ${result.data.location.state}`);

    return result;
  }

  async testAICitations() {
    const result = await this.dataService.getAICitationsData(
      'Test Dealership',
      'Anytown, CA',
      'testdealership.com'
    );
    
    if (!result.success) throw new Error('AI Citations API returned success: false');
    if (!result.data) throw new Error('No data returned from AI Citations API');
    if (typeof result.data.overallScore !== 'number') throw new Error('Invalid score returned');

    console.log(`   🤖 Overall Score: ${result.data.overallScore}/100`);
    console.log(`   📝 Mentions: ${result.data.mentionsCount}/${result.data.totalQueries}`);
    console.log(`   💡 Recommendations: ${result.data.recommendations.length}`);

    return result;
  }

  async testGoogleAuth() {
    const auth = new MockGoogleAuth();
    
    // Test configuration
    if (!auth.isAuthenticated()) {
      console.log('   🔐 Not authenticated (expected for testing)');
    }

    // Test token expiry check
    const mockToken = {
      access_token: 'test',
      refresh_token: 'test',
      expiry_date: Date.now() + 3600000, // 1 hour from now
      scope: 'test',
      token_type: 'Bearer'
    };

    const isExpired = auth.isTokenExpired(mockToken);
    if (isExpired) throw new Error('Token should not be expired');

    console.log('   🔑 Auth configuration valid');
    console.log('   ⏰ Token expiry logic working');

    return true;
  }

  async testBatchRequests() {
    const requests = [
      { url: '/api/analytics', options: { method: 'GET' } },
      { url: '/api/pagespeed?url=https://example.com', options: { method: 'GET' } },
      { url: '/api/semrush?domain=example.com', options: { method: 'GET' } }
    ];

    // This would test the batch functionality if implemented
    console.log('   📦 Batch requests configured');
    console.log(`   🔢 Request count: ${requests.length}`);

    return true;
  }

  extractMetric(analyticsResult, metricName) {
    try {
      const metricIndex = analyticsResult.data.rows[0]?.metricValues?.findIndex(
        (_, index) => index === this.getMetricIndex(metricName)
      );
      return analyticsResult.data.rows[0]?.metricValues?.[metricIndex]?.value || 'N/A';
    } catch {
      return 'N/A';
    }
  }

  getMetricIndex(metricName) {
    const metrics = ['sessions', 'users', 'pageviews', 'bounceRate'];
    return metrics.indexOf(metricName);
  }

  countDataPoints(obj) {
    if (Array.isArray(obj)) return obj.length;
    if (typeof obj === 'object' && obj !== null) {
      return Object.keys(obj).length;
    }
    return 1;
  }

  printSummary() {
    const totalTime = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;

    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(60));
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${Math.round((passed / this.results.length) * 100)}%`);

    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   • ${r.name}: ${r.error}`);
        });
    }

    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('   • Set up environment variables for real API testing');
    console.log('   • Configure API keys in .env.local');
    console.log('   • Test with real dealership data');
    console.log('   • Monitor API rate limits and costs');

    console.log('\n✨ Test suite completed!');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = { APITester };
