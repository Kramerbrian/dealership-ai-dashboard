/**
 * Performance Monitoring Script for DealershipAI Dashboard
 * Tracks performance metrics, user engagement, and system health
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class PerformanceMonitor {
    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3001';
        this.metrics = {
            uptime: 0,
            responseTime: 0,
            errorRate: 0,
            userEngagement: 0,
            conversionRate: 0,
            timestamp: new Date().toISOString()
        };
        this.logFile = path.join(__dirname, '../logs/performance.log');
        this.ensureLogDirectory();
    }

    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    async checkUptime() {
        console.log('🔍 Checking uptime...');
        
        try {
            const startTime = Date.now();
            const response = await fetch(`${this.baseUrl}/`, {
                timeout: 10000
            });
            const responseTime = Date.now() - startTime;

            if (response.ok) {
                this.metrics.uptime = 100;
                this.metrics.responseTime = responseTime;
                console.log(`✅ Uptime: 100% (${responseTime}ms)`);
            } else {
                this.metrics.uptime = 0;
                console.log(`❌ Uptime: 0% (HTTP ${response.status})`);
            }
        } catch (error) {
            this.metrics.uptime = 0;
            console.log(`❌ Uptime: 0% (${error.message})`);
        }
    }

    async checkAPIHealth() {
        console.log('🔍 Checking API health...');
        
        const endpoints = [
            '/api/checkout',
            '/api/analyze',
            '/api/chatbot',
            '/api/subscription'
        ];

        let healthyEndpoints = 0;
        let totalResponseTime = 0;

        for (const endpoint of endpoints) {
            try {
                const startTime = Date.now();
                const response = await fetch(`${this.baseUrl}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ test: true }),
                    timeout: 5000
                });
                const responseTime = Date.now() - startTime;
                totalResponseTime += responseTime;

                if (response.ok || response.status === 400) { // 400 is expected for test data
                    healthyEndpoints++;
                    console.log(`   ✅ ${endpoint} (${responseTime}ms)`);
                } else {
                    console.log(`   ❌ ${endpoint} (HTTP ${response.status})`);
                }
            } catch (error) {
                console.log(`   ❌ ${endpoint} (${error.message})`);
            }
        }

        const healthPercentage = (healthyEndpoints / endpoints.length) * 100;
        const avgResponseTime = totalResponseTime / endpoints.length;

        console.log(`📊 API Health: ${healthPercentage.toFixed(1)}% (avg ${avgResponseTime.toFixed(0)}ms)`);
        
        this.metrics.apiHealth = healthPercentage;
        this.metrics.avgApiResponseTime = avgResponseTime;
    }

    async checkPerformanceMetrics() {
        console.log('🔍 Checking performance metrics...');
        
        try {
            // Test page load times
            const pages = [
                '/',
                '/pricing.html',
                '/subscription.html'
            ];

            let totalLoadTime = 0;
            let successfulPages = 0;

            for (const page of pages) {
                try {
                    const startTime = Date.now();
                    const response = await fetch(`${this.baseUrl}${page}`, {
                        timeout: 10000
                    });
                    const loadTime = Date.now() - startTime;

                    if (response.ok) {
                        totalLoadTime += loadTime;
                        successfulPages++;
                        console.log(`   ✅ ${page}: ${loadTime}ms`);
                    } else {
                        console.log(`   ❌ ${page}: HTTP ${response.status}`);
                    }
                } catch (error) {
                    console.log(`   ❌ ${page}: ${error.message}`);
                }
            }

            if (successfulPages > 0) {
                const avgLoadTime = totalLoadTime / successfulPages;
                console.log(`📊 Average page load time: ${avgLoadTime.toFixed(0)}ms`);
                this.metrics.avgPageLoadTime = avgLoadTime;
            }

        } catch (error) {
            console.log(`❌ Performance check failed: ${error.message}`);
        }
    }

    async checkErrorRates() {
        console.log('🔍 Checking error rates...');
        
        try {
            // Test error handling
            const errorTests = [
                {
                    url: '/api/checkout',
                    method: 'POST',
                    body: {}, // Invalid data
                    expectedStatus: 400
                },
                {
                    url: '/api/analyze',
                    method: 'POST',
                    body: {}, // Invalid data
                    expectedStatus: 400
                }
            ];

            let errorCount = 0;
            let totalTests = errorTests.length;

            for (const test of errorTests) {
                try {
                    const response = await fetch(`${this.baseUrl}${test.url}`, {
                        method: test.method,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(test.body),
                        timeout: 5000
                    });

                    if (response.status === test.expectedStatus) {
                        console.log(`   ✅ ${test.url}: Correctly returned ${response.status}`);
                    } else {
                        console.log(`   ⚠️  ${test.url}: Expected ${test.expectedStatus}, got ${response.status}`);
                        errorCount++;
                    }
                } catch (error) {
                    console.log(`   ❌ ${test.url}: ${error.message}`);
                    errorCount++;
                }
            }

            const errorRate = (errorCount / totalTests) * 100;
            console.log(`📊 Error rate: ${errorRate.toFixed(1)}%`);
            this.metrics.errorRate = errorRate;

        } catch (error) {
            console.log(`❌ Error rate check failed: ${error.message}`);
        }
    }

    async checkDatabaseHealth() {
        console.log('🔍 Checking database health...');
        
        try {
            // Test database connection through API
            const response = await fetch(`${this.baseUrl}/api/subscription`, {
                method: 'GET',
                timeout: 5000
            });

            if (response.status === 401) {
                console.log('   ✅ Database: Connected (authentication required)');
                this.metrics.databaseHealth = 100;
            } else if (response.ok) {
                console.log('   ✅ Database: Connected');
                this.metrics.databaseHealth = 100;
            } else {
                console.log(`   ⚠️  Database: HTTP ${response.status}`);
                this.metrics.databaseHealth = 50;
            }
        } catch (error) {
            console.log(`   ❌ Database: ${error.message}`);
            this.metrics.databaseHealth = 0;
        }
    }

    async checkStripeIntegration() {
        console.log('🔍 Checking Stripe integration...');
        
        try {
            // Test Stripe webhook endpoint
            const response = await fetch(`${this.baseUrl}/api/webhooks/stripe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'test' }),
                timeout: 5000
            });

            if (response.ok || response.status === 400) {
                console.log('   ✅ Stripe webhook: Accessible');
                this.metrics.stripeHealth = 100;
            } else {
                console.log(`   ⚠️  Stripe webhook: HTTP ${response.status}`);
                this.metrics.stripeHealth = 50;
            }
        } catch (error) {
            console.log(`   ❌ Stripe webhook: ${error.message}`);
            this.metrics.stripeHealth = 0;
        }
    }

    async generateReport() {
        console.log('\n📊 Generating performance report...');
        
        const report = {
            timestamp: new Date().toISOString(),
            baseUrl: this.baseUrl,
            metrics: this.metrics,
            summary: this.generateSummary()
        };

        // Save to log file
        const logEntry = JSON.stringify(report) + '\n';
        fs.appendFileSync(this.logFile, logEntry);

        // Print summary
        this.printSummary(report);
    }

    generateSummary() {
        const { uptime, apiHealth, errorRate, avgPageLoadTime, databaseHealth, stripeHealth } = this.metrics;
        
        let status = 'HEALTHY';
        let issues = [];

        if (uptime < 100) {
            status = 'DEGRADED';
            issues.push('Uptime issues detected');
        }

        if (apiHealth < 90) {
            status = 'DEGRADED';
            issues.push('API health below 90%');
        }

        if (errorRate > 10) {
            status = 'DEGRADED';
            issues.push('High error rate detected');
        }

        if (avgPageLoadTime > 3000) {
            status = 'DEGRADED';
            issues.push('Slow page load times');
        }

        if (databaseHealth < 100) {
            status = 'DEGRADED';
            issues.push('Database connectivity issues');
        }

        if (stripeHealth < 100) {
            status = 'DEGRADED';
            issues.push('Stripe integration issues');
        }

        return {
            status,
            issues,
            recommendations: this.generateRecommendations(issues)
        };
    }

    generateRecommendations(issues) {
        const recommendations = [];

        if (issues.includes('Uptime issues detected')) {
            recommendations.push('Check server logs and restart if necessary');
        }

        if (issues.includes('API health below 90%')) {
            recommendations.push('Review API endpoint configurations and error handling');
        }

        if (issues.includes('High error rate detected')) {
            recommendations.push('Implement better error handling and logging');
        }

        if (issues.includes('Slow page load times')) {
            recommendations.push('Optimize images, enable caching, and consider CDN');
        }

        if (issues.includes('Database connectivity issues')) {
            recommendations.push('Check database connection and credentials');
        }

        if (issues.includes('Stripe integration issues')) {
            recommendations.push('Verify Stripe webhook configuration and API keys');
        }

        if (recommendations.length === 0) {
            recommendations.push('System is running optimally');
        }

        return recommendations;
    }

    printSummary(report) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 PERFORMANCE MONITORING REPORT');
        console.log('='.repeat(60));
        console.log(`🕐 Timestamp: ${report.timestamp}`);
        console.log(`🌐 Base URL: ${report.baseUrl}`);
        console.log(`📈 Status: ${report.summary.status}`);
        
        console.log('\n📊 METRICS:');
        console.log(`   Uptime: ${this.metrics.uptime}%`);
        console.log(`   API Health: ${this.metrics.apiHealth || 'N/A'}%`);
        console.log(`   Error Rate: ${this.metrics.errorRate}%`);
        console.log(`   Avg Page Load: ${this.metrics.avgPageLoadTime || 'N/A'}ms`);
        console.log(`   Database Health: ${this.metrics.databaseHealth || 'N/A'}%`);
        console.log(`   Stripe Health: ${this.metrics.stripeHealth || 'N/A'}%`);

        if (report.summary.issues.length > 0) {
            console.log('\n⚠️  ISSUES DETECTED:');
            report.summary.issues.forEach(issue => {
                console.log(`   • ${issue}`);
            });
        }

        console.log('\n💡 RECOMMENDATIONS:');
        report.summary.recommendations.forEach(rec => {
            console.log(`   • ${rec}`);
        });

        console.log(`\n📝 Log saved to: ${this.logFile}`);
    }

    async runMonitoring() {
        console.log('🚀 Starting performance monitoring...\n');

        await this.checkUptime();
        await this.checkAPIHealth();
        await this.checkPerformanceMetrics();
        await this.checkErrorRates();
        await this.checkDatabaseHealth();
        await this.checkStripeIntegration();
        await this.generateReport();
    }
}

// Main execution
async function main() {
    const monitor = new PerformanceMonitor();
    await monitor.runMonitoring();
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = PerformanceMonitor;
