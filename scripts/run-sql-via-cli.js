#!/usr/bin/env node

/**
 * Execute SQL queries via Supabase Management API
 * This uses the Supabase project's REST API to run queries
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌');
  process.exit(1);
}

async function executeQuery(query) {
  return new Promise((resolve, reject) => {
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (!projectRef) {
      reject(new Error('Could not extract project ref from SUPABASE_URL'));
      return;
    }

    const apiUrl = `https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`;
    
    const postData = JSON.stringify({ query });
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    };

    const url = new URL(apiUrl);
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Alternative: Use PostgREST to query system tables
async function queryViaPostgREST(query) {
  // For system queries, we need to use a different approach
  // Since PostgREST doesn't expose pg_policies directly,
  // we'll read the SQL file and output it for manual execution
  console.log('📋 SQL Query (copy to Supabase SQL Editor):');
  console.log('='.repeat(60));
  console.log(query);
  console.log('='.repeat(60));
  console.log('\n🔗 SQL Editor: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql/new');
  console.log('\n⚠️  Note: Supabase CLI cannot execute SELECT queries directly.');
  console.log('   Use the SQL Editor for best results.\n');
}

async function main() {
  const queryFile = process.argv[2];
  
  if (!queryFile) {
    console.error('Usage: node run-sql-via-cli.js <sql-file>');
    console.error('Example: node run-sql-via-cli.js scripts/run-policy-check.sql');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', queryFile);
  if (!fs.existsSync(sqlPath)) {
    console.error(`❌ File not found: ${sqlPath}`);
    process.exit(1);
  }

  const query = fs.readFileSync(sqlPath, 'utf-8')
    .replace(/^--.*$/gm, '') // Remove comments
    .trim();

  console.log(`📄 Running query from: ${queryFile}\n`);
  
  // For system queries (pg_policies, pg_indexes), we can't use REST API
  // So we'll output the query for manual execution
  await queryViaPostgREST(query);
}

main().catch(console.error);

