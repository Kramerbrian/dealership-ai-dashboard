#!/usr/bin/env node

/**
 * Copy Schema to Clipboard Script
 * Helps you copy the database schema to run in Supabase SQL Editor
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function copySchema() {
  console.log('📋 DealershipAI Database Schema Copier\n');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'clean-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    console.log('✅ Schema file loaded successfully');
    console.log(`📏 Schema size: ${schemaSQL.length} characters`);
    console.log(`📝 Lines: ${schemaSQL.split('\n').length}`);

    // Try to copy to clipboard
    const platform = process.platform;
    let copyCommand;

    if (platform === 'darwin') {
      copyCommand = 'pbcopy';
    } else if (platform === 'win32') {
      copyCommand = 'clip';
    } else {
      copyCommand = 'xclip -selection clipboard';
    }

    exec(`echo "${schemaSQL.replace(/"/g, '\\"')}" | ${copyCommand}`, (error, stdout, stderr) => {
      if (error) {
        console.log('⚠️  Could not copy to clipboard automatically');
        console.log('\n📋 Manual Instructions:');
        console.log('1. Go to: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql');
        console.log('2. Click "New Query"');
        console.log('3. Copy the schema below and paste it:');
        console.log('\n' + '='.repeat(80));
        console.log(schemaSQL);
        console.log('='.repeat(80));
      } else {
        console.log('✅ Schema copied to clipboard!');
        console.log('\n📋 Next Steps:');
        console.log('1. Go to: https://supabase.com/dashboard/project/gzlgfghpkbqlhgfozjkb/sql');
        console.log('2. Click "New Query"');
        console.log('3. Paste the schema (Cmd+V / Ctrl+V)');
        console.log('4. Click "Run" to execute');
        console.log('5. Come back and run: npm run db:test');
      }
    });

  } catch (error) {
    console.error('❌ Error reading schema file:', error.message);
    process.exit(1);
  }
}

copySchema();
