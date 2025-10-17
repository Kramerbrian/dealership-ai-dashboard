#!/usr/bin/env tsx

/**
 * DealershipAI Domain Verification Script
 * 
 * This script verifies and optimizes domain configuration for the DealershipAI dashboard.
 * It checks DNS resolution, SSL certificates, and domain routing.
 * 
 * Usage:
 *   npm run verify:domains
 *   tsx scripts/verify-domains.ts
 */

import { execSync } from 'child_process';
import { createWriteStream } from 'fs';
import { join } from 'path';

interface DomainConfig {
  name: string;
  purpose: string;
  expectedRoute: string;
  priority: 'high' | 'medium' | 'low';
}

interface DomainStatus {
  domain: string;
  dnsResolved: boolean;
  sslValid: boolean;
  httpsWorking: boolean;
  responseTime: number;
  statusCode: number;
  error?: string;
}

const DOMAIN_CONFIGS: DomainConfig[] = [
  {
    name: 'main.dealershipai.com',
    purpose: 'Main application/landing page',
    expectedRoute: '/',
    priority: 'high'
  },
  {
    name: 'marketing.dealershipai.com',
    purpose: 'Marketing website',
    expectedRoute: '/',
    priority: 'high'
  },
  {
    name: 'dash.dealershipai.com',
    purpose: 'Dashboard application',
    expectedRoute: '/intelligence',
    priority: 'high'
  },
  {
    name: 'dealershipai.com',
    purpose: 'Root domain',
    expectedRoute: '/',
    priority: 'medium'
  },
  {
    name: 'www.dealershipai.com',
    purpose: 'WWW subdomain',
    expectedRoute: '/',
    priority: 'low'
  }
];

class DomainVerifier {
  private results: DomainStatus[] = [];
  private logFile: string;

  constructor() {
    this.logFile = join(process.cwd(), 'domain-verification-results.json');
  }

  /**
   * Check DNS resolution for a domain
   */
  private checkDNSResolution(domain: string): boolean {
    try {
      const result = execSync(`nslookup ${domain}`, { 
        encoding: 'utf8',
        timeout: 10000 
      });
      
      // Check if the result contains Vercel IPs or CNAME
      const isVercel = result.includes('76.76.19.61') || 
                      result.includes('cname.vercel-dns.com') ||
                      result.includes('vercel-dns.com');
      
      return isVercel;
    } catch (error) {
      console.error(`DNS resolution failed for ${domain}:`, error);
      return false;
    }
  }

  /**
   * Check SSL certificate validity
   */
  private checkSSLCertificate(domain: string): boolean {
    try {
      const result = execSync(`openssl s_client -connect ${domain}:443 -servername ${domain} < /dev/null 2>/dev/null | openssl x509 -noout -dates`, {
        encoding: 'utf8',
        timeout: 10000
      });
      
      // Check if certificate is valid and not expired
      const now = new Date();
      const notAfterMatch = result.match(/notAfter=(.+)/);
      
      if (notAfterMatch) {
        const expiryDate = new Date(notAfterMatch[1]);
        return expiryDate > now;
      }
      
      return false;
    } catch (error) {
      console.error(`SSL check failed for ${domain}:`, error);
      return false;
    }
  }

  /**
   * Check HTTPS connectivity and response
   */
  private async checkHTTPSResponse(domain: string): Promise<{ working: boolean; statusCode: number; responseTime: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const result = execSync(`curl -I -s -w "%{http_code}" -o /dev/null https://${domain}`, {
        encoding: 'utf8',
        timeout: 15000
      });
      
      const responseTime = Date.now() - startTime;
      const statusCode = parseInt(result.trim());
      
      return {
        working: statusCode >= 200 && statusCode < 400,
        statusCode,
        responseTime
      };
    } catch (error) {
      return {
        working: false,
        statusCode: 0,
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  /**
   * Verify a single domain
   */
  private async verifyDomain(config: DomainConfig): Promise<DomainStatus> {
    console.log(`🔍 Verifying ${config.name}...`);
    
    const dnsResolved = this.checkDNSResolution(config.name);
    const sslValid = this.checkSSLCertificate(config.name);
    const httpsResponse = await this.checkHTTPSResponse(config.name);
    
    const status: DomainStatus = {
      domain: config.name,
      dnsResolved,
      sslValid,
      httpsWorking: httpsResponse.working,
      responseTime: httpsResponse.responseTime,
      statusCode: httpsResponse.statusCode,
      error: httpsResponse.error
    };
    
    // Log status
    const statusIcon = status.dnsResolved && status.sslValid && status.httpsWorking ? '✅' : '❌';
    console.log(`${statusIcon} ${config.name}: DNS=${status.dnsResolved}, SSL=${status.sslValid}, HTTPS=${status.httpsWorking} (${status.responseTime}ms)`);
    
    return status;
  }

  /**
   * Verify all domains
   */
  async verifyAllDomains(): Promise<void> {
    console.log('🌐 DealershipAI Domain Verification\n');
    
    // Sort by priority
    const sortedConfigs = DOMAIN_CONFIGS.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    for (const config of sortedConfigs) {
      const status = await this.verifyDomain(config);
      this.results.push(status);
      
      // Add delay between checks to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.generateReport();
  }

  /**
   * Generate verification report
   */
  private generateReport(): void {
    console.log('\n📊 Domain Verification Report\n');
    
    const totalDomains = this.results.length;
    const workingDomains = this.results.filter(r => r.dnsResolved && r.sslValid && r.httpsWorking).length;
    const dnsIssues = this.results.filter(r => !r.dnsResolved).length;
    const sslIssues = this.results.filter(r => !r.sslValid).length;
    const httpsIssues = this.results.filter(r => !r.httpsWorking).length;
    
    console.log(`📈 Summary:`);
    console.log(`   Total Domains: ${totalDomains}`);
    console.log(`   Working: ${workingDomains}/${totalDomains} (${Math.round(workingDomains/totalDomains*100)}%)`);
    console.log(`   DNS Issues: ${dnsIssues}`);
    console.log(`   SSL Issues: ${sslIssues}`);
    console.log(`   HTTPS Issues: ${httpsIssues}`);
    
    console.log('\n🔍 Detailed Results:');
    this.results.forEach(result => {
      const status = result.dnsResolved && result.sslValid && result.httpsWorking ? '✅' : '❌';
      console.log(`   ${status} ${result.domain}`);
      console.log(`      DNS: ${result.dnsResolved ? '✅' : '❌'}`);
      console.log(`      SSL: ${result.sslValid ? '✅' : '❌'}`);
      console.log(`      HTTPS: ${result.httpsWorking ? '✅' : '❌'} (${result.statusCode})`);
      console.log(`      Response Time: ${result.responseTime}ms`);
      if (result.error) {
        console.log(`      Error: ${result.error}`);
      }
      console.log('');
    });
    
    // Save results to file
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDomains,
        workingDomains,
        dnsIssues,
        sslIssues,
        httpsIssues
      },
      results: this.results
    };
    
    require('fs').writeFileSync(this.logFile, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed report saved to: ${this.logFile}`);
    
    // Generate recommendations
    this.generateRecommendations();
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(): void {
    console.log('\n💡 Optimization Recommendations:\n');
    
    const dnsIssues = this.results.filter(r => !r.dnsResolved);
    const sslIssues = this.results.filter(r => !r.sslValid);
    const httpsIssues = this.results.filter(r => !r.httpsWorking);
    
    if (dnsIssues.length > 0) {
      console.log('🔧 DNS Configuration Issues:');
      dnsIssues.forEach(issue => {
        console.log(`   • ${issue.domain}: Configure DNS records to point to Vercel`);
        console.log(`     - Add CNAME record: ${issue.domain} → cname.vercel-dns.com`);
        console.log(`     - Or add A record: ${issue.domain} → 76.76.19.61`);
      });
      console.log('');
    }
    
    if (sslIssues.length > 0) {
      console.log('🔐 SSL Certificate Issues:');
      sslIssues.forEach(issue => {
        console.log(`   • ${issue.domain}: SSL certificate needs attention`);
        console.log(`     - Check Vercel dashboard for certificate status`);
        console.log(`     - Ensure domain is properly added to Vercel project`);
      });
      console.log('');
    }
    
    if (httpsIssues.length > 0) {
      console.log('🌐 HTTPS Connectivity Issues:');
      httpsIssues.forEach(issue => {
        console.log(`   • ${issue.domain}: HTTPS connection failed`);
        console.log(`     - Status Code: ${issue.statusCode}`);
        if (issue.error) {
          console.log(`     - Error: ${issue.error}`);
        }
        console.log(`     - Check Vercel deployment status`);
        console.log(`     - Verify domain configuration in Vercel dashboard`);
      });
      console.log('');
    }
    
    // Performance recommendations
    const slowDomains = this.results.filter(r => r.responseTime > 2000);
    if (slowDomains.length > 0) {
      console.log('⚡ Performance Issues:');
      slowDomains.forEach(domain => {
        console.log(`   • ${domain.domain}: Slow response time (${domain.responseTime}ms)`);
        console.log(`     - Consider enabling Vercel Edge Network`);
        console.log(`     - Check for heavy API calls or database queries`);
        console.log(`     - Optimize images and static assets`);
      });
      console.log('');
    }
    
    // Vercel-specific recommendations
    console.log('🚀 Vercel Optimization:');
    console.log('   • Enable Vercel Analytics for performance monitoring');
    console.log('   • Configure Edge Functions for faster API responses');
    console.log('   • Set up proper caching headers in vercel.json');
    console.log('   • Use Vercel Image Optimization for better performance');
    console.log('   • Configure proper redirects and rewrites');
    console.log('');
    
    // Security recommendations
    console.log('🔒 Security Recommendations:');
    console.log('   • Ensure all domains use HTTPS (SSL certificates)');
    console.log('   • Configure proper CORS headers in vercel.json');
    console.log('   • Set up Content Security Policy (CSP) headers');
    console.log('   • Enable HSTS (HTTP Strict Transport Security)');
    console.log('   • Regular security audits and updates');
  }

  /**
   * Check Vercel project configuration
   */
  async checkVercelConfig(): Promise<void> {
    console.log('\n🔧 Checking Vercel Configuration...\n');
    
    try {
      // Check if Vercel CLI is available
      execSync('vercel --version', { stdio: 'ignore' });
      console.log('✅ Vercel CLI is installed');
      
      // Check if logged in
      try {
        const whoami = execSync('vercel whoami', { encoding: 'utf8' });
        console.log(`✅ Logged in as: ${whoami.trim()}`);
      } catch {
        console.log('❌ Not logged into Vercel. Run: vercel login');
        return;
      }
      
      // Check project status
      try {
        const projectInfo = execSync('vercel ls', { encoding: 'utf8' });
        const hasProject = projectInfo.includes('dealership-ai-dashboard');
        console.log(hasProject ? '✅ Project found in Vercel' : '❌ Project not found in Vercel');
      } catch {
        console.log('❌ Could not check project status');
      }
      
    } catch (error) {
      console.log('❌ Vercel CLI not found. Install with: npm i -g vercel');
    }
  }
}

// Main execution
async function main() {
  const verifier = new DomainVerifier();
  
  try {
    await verifier.checkVercelConfig();
    await verifier.verifyAllDomains();
    
    console.log('\n🎉 Domain verification complete!');
    console.log('Check the generated report for detailed results and recommendations.');
    
  } catch (error) {
    console.error('❌ Domain verification failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default DomainVerifier;
