#!/usr/bin/env node

/**
 * DealershipAI v2.0 - AOER Tables Creation Script
 * Creates the AOER tables with proper partitioning
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function createAoerTables() {
  console.log('🚀 Creating AOER tables...');
  
  // Check for DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('Please set DATABASE_URL in your .env.local file');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'aoer_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    console.log('📦 Creating tables and partitions...');
    await client.query(sql);
    
    console.log('✅ AOER tables created successfully!');
    console.log('');
    console.log('Created tables:');
    console.log('  - aoer_queries (partitioned table)');
    console.log('  - aoer_queries_2025q4 (Q4 2025 partition)');
    console.log('  - aoer_queries_2026q1 (Q1 2026 partition)');
    console.log('  - aiv_raw_signals');
    console.log('  - aoer_failures');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Run "npx prisma db push" to sync Prisma schema');
    console.log('  2. Test the tables with your application');

  } catch (error) {
    console.error('❌ Error creating AOER tables:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the script
createAoerTables().catch(console.error);
