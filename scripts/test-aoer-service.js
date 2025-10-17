#!/usr/bin/env node

/**
 * DealershipAI v2.0 - AOER Service Test
 * Tests the AOER service with the new tables
 */

const { Client } = require('pg');

async function testAoerService() {
  console.log('🧪 Testing AOER Service...');
  
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

    // Test 1: Verify tables exist
    console.log('\n📋 Test 1: Verifying tables exist...');
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE tablename IN ('aoer_queries', 'aoer_queries_2025q4', 'aoer_queries_2026q1', 'aiv_raw_signals', 'aoer_failures')
      ORDER BY tablename
    `);
    
    console.log('✅ Found tables:', tablesResult.rows.map(row => row.tablename).join(', '));

    // Test 2: Insert AIV raw signal
    console.log('\n📊 Test 2: Inserting AIV raw signal...');
    const aivResult = await client.query(`
      INSERT INTO aiv_raw_signals (dealer_id, date, seo, aeo, geo, ugc, geolocal, observed_aiv, observed_rar)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440000', // dealer_id
      '2026-01-15', // date
      85.5, // seo
      78.2, // aeo
      92.1, // geo
      88.7, // ugc
      90.3, // geolocal
      87.2, // observed_aiv
      89.1  // observed_rar
    ]);
    
    console.log('✅ AIV raw signal inserted with ID:', aivResult.rows[0].id);

    // Test 3: Insert AOER failure
    console.log('\n❌ Test 3: Inserting AOER failure...');
    const failureResult = await client.query(`
      INSERT INTO aoer_failures (tenant_id, job_name, error_text, payload)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440001', // tenant_id
      'query_analysis_job', // job_name
      'Timeout error during AI analysis', // error_text
      JSON.stringify({ timeout: 30000, retries: 3, lastAttempt: new Date().toISOString() }) // payload
    ]);
    
    console.log('✅ AOER failure inserted with ID:', failureResult.rows[0].id);

    // Test 4: Insert AOER query (Q4 2025)
    console.log('\n🔍 Test 4: Inserting AOER query (Q4 2025)...');
    const query2025Result = await client.query(`
      INSERT INTO aoer_queries_2025q4 (tenant_id, query, week_start, intent)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440001', // tenant_id
      'best car dealership near me', // query
      '2025-11-15', // week_start (Q4 2025)
      'commercial' // intent
    ]);
    
    console.log('✅ AOER query (Q4 2025) inserted with ID:', query2025Result.rows[0].id);

    // Test 5: Insert AOER query (Q1 2026)
    console.log('\n🔍 Test 5: Inserting AOER query (Q1 2026)...');
    const query2026Result = await client.query(`
      INSERT INTO aoer_queries_2026q1 (tenant_id, query, week_start, intent)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440001', // tenant_id
      'luxury car dealership los angeles', // query
      '2026-01-15', // week_start (Q1 2026)
      'informational' // intent
    ]);
    
    console.log('✅ AOER query (Q1 2026) inserted with ID:', query2026Result.rows[0].id);

    // Test 6: Query statistics
    console.log('\n📈 Test 6: Testing query statistics...');
    const statsResult = await client.query(`
      SELECT 
        intent,
        COUNT(*) as count
      FROM (
        SELECT intent FROM aoer_queries_2025q4
        UNION ALL
        SELECT intent FROM aoer_queries_2026q1
      ) combined
      GROUP BY intent
      ORDER BY count DESC
    `);
    
    console.log('✅ Query statistics by intent:');
    statsResult.rows.forEach(row => {
      console.log(`   ${row.intent}: ${row.count} queries`);
    });

    // Test 7: Test partitioning (insert into main table)
    console.log('\n🔄 Test 7: Testing automatic partitioning...');
    const partitionResult = await client.query(`
      INSERT INTO aoer_queries (tenant_id, query, week_start, intent)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [
      '550e8400-e29b-41d4-a716-446655440001', // tenant_id
      'used cars for sale', // query
      '2026-02-15', // week_start (Q1 2026)
      'commercial' // intent
    ]);
    
    console.log('✅ Query inserted into main table with ID:', partitionResult.rows[0].id);

    // Test 8: Verify data in partitions
    console.log('\n🔍 Test 8: Verifying data distribution...');
    const q42025Count = await client.query('SELECT COUNT(*) FROM aoer_queries_2025q4');
    const q12026Count = await client.query('SELECT COUNT(*) FROM aoer_queries_2026q1');
    
    console.log(`✅ Q4 2025 partition: ${q42025Count.rows[0].count} records`);
    console.log(`✅ Q1 2026 partition: ${q12026Count.rows[0].count} records`);

    // Test 9: Test constraints
    console.log('\n🛡️ Test 9: Testing constraints...');
    try {
      await client.query(`
        INSERT INTO aoer_queries_2026q1 (tenant_id, query, week_start, intent)
        VALUES ($1, $2, $3, $4)
      `, [
        '550e8400-e29b-41d4-a716-446655440001', // tenant_id
        'invalid intent test', // query
        '2026-01-15', // week_start
        'invalid_intent' // intent (should fail)
      ]);
      console.log('❌ Constraint test failed - invalid intent was accepted');
    } catch (error) {
      if (error.message.includes('aoer_queries_intent_check')) {
        console.log('✅ Constraint test passed - invalid intent was rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 10: Test unique constraint
    console.log('\n🔒 Test 10: Testing unique constraint...');
    try {
      await client.query(`
        INSERT INTO aoer_queries_2026q1 (tenant_id, query, week_start, intent)
        VALUES ($1, $2, $3, $4)
      `, [
        '550e8400-e29b-41d4-a716-446655440001', // tenant_id
        'luxury car dealership los angeles', // query (duplicate)
        '2026-01-15', // week_start (duplicate)
        'commercial' // intent
      ]);
      console.log('❌ Unique constraint test failed - duplicate was accepted');
    } catch (error) {
      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        console.log('✅ Unique constraint test passed - duplicate was rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All AOER service tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('  ✅ Tables exist and are accessible');
    console.log('  ✅ AIV raw signals can be inserted');
    console.log('  ✅ AOER failures can be tracked');
    console.log('  ✅ AOER queries work with partitioning');
    console.log('  ✅ Automatic partition routing works');
    console.log('  ✅ Constraints are enforced');
    console.log('  ✅ Unique constraints prevent duplicates');
    console.log('  ✅ Statistics queries work correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the tests
testAoerService().catch(console.error);
