#!/usr/bin/env node

/**
 * Run Database Schema Script
 * Executes the clean-schema.sql file against the Supabase database
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runSchema() {
  console.log('🚀 Running DealershipAI Database Schema...\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Connect to database
    console.log('1. Connecting to Supabase database...');
    await client.connect();
    console.log('   ✅ Connected successfully\n');

    // Read the schema file
    console.log('2. Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'clean-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('   ✅ Schema file loaded\n');

    // Execute the schema
    console.log('3. Executing database schema...');
    await client.query(schemaSQL);
    console.log('   ✅ Schema executed successfully\n');

    // Verify tables were created
    console.log('4. Verifying tables...');
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log('   ✅ Tables created:');
    result.rows.forEach(row => {
      console.log(`      - ${row.table_name}`);
    });

    // Check sample data
    console.log('\n5. Verifying sample data...');
    const tenantCount = await client.query('SELECT COUNT(*) FROM tenants');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const dealershipCount = await client.query('SELECT COUNT(*) FROM dealership_data');

    console.log(`   ✅ Sample data inserted:`);
    console.log(`      - ${tenantCount.rows[0].count} tenants`);
    console.log(`      - ${userCount.rows[0].count} users`);
    console.log(`      - ${dealershipCount.rows[0].count} dealerships`);

    console.log('\n🎉 Database schema setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run db:test');
    console.log('2. Start the development server: npm run dev');
    console.log('3. Visit: http://localhost:3000/dashboard');

  } catch (error) {
    console.error('❌ Error running schema:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your DATABASE_URL in .env.local');
    console.log('2. Verify your Supabase project is running');
    console.log('3. Ensure the database password is correct');
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSchema().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});
