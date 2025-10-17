#!/usr/bin/env tsx

/**
 * DNS Change Monitor
 * Monitors DNS propagation for dealershipai.com domains
 */

import { execSync } from 'child_process';

const domains = [
  'main.dealershipai.com',
  'marketing.dealershipai.com', 
  'dash.dealershipai.com',
  'dealershipai.com',
  'www.dealershipai.com'
];

const expectedIPs = [
  '76.76.21.93',
  '66.33.60.67', 
  '76.76.19.61'
];

function getDNSRecords(domain: string): string[] {
  try {
    const output = execSync(`nslookup ${domain}`, { encoding: 'utf8' });
    const lines = output.split('\n');
    const addresses: string[] = [];
    
    for (const line of lines) {
      if (line.includes('Address:') && !line.includes('#')) {
        const ip = line.split('Address:')[1]?.trim();
        if (ip && ip.match(/^\d+\.\d+\.\d+\.\d+$/)) {
          addresses.push(ip);
        }
      }
    }
    
    return addresses;
  } catch (error) {
    console.error(`Error checking ${domain}:`, error);
    return [];
  }
}

function checkDNSStatus() {
  console.log('🔍 Checking DNS Status...\n');
  
  let allCorrect = true;
  
  for (const domain of domains) {
    const currentIPs = getDNSRecords(domain);
    const hasCorrectIPs = currentIPs.some(ip => expectedIPs.includes(ip));
    
    const status = hasCorrectIPs ? '✅' : '❌';
    const ipList = currentIPs.length > 0 ? currentIPs.join(', ') : 'No records found';
    
    console.log(`${status} ${domain}`);
    console.log(`   Current IPs: ${ipList}`);
    
    if (!hasCorrectIPs) {
      allCorrect = false;
    }
    console.log('');
  }
  
  if (allCorrect) {
    console.log('🎉 All domains are pointing to Vercel IPs!');
    console.log('✅ DNS configuration is correct');
  } else {
    console.log('⚠️  Some domains still need DNS updates');
    console.log('📋 Check DNS_FIX_GUIDE.md for instructions');
  }
  
  return allCorrect;
}

function main() {
  console.log('🚀 DNS Change Monitor for DealershipAI\n');
  console.log('Expected Vercel IPs: 76.76.21.93, 66.33.60.67, 76.76.19.61\n');
  
  const isCorrect = checkDNSStatus();
  
  if (!isCorrect) {
    console.log('\n🔄 Run this script again after updating DNS records');
    console.log('💡 DNS changes can take 5-60 minutes to propagate');
  }
}

if (require.main === module) {
  main();
}
