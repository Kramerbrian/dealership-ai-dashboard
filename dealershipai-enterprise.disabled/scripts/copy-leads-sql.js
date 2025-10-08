#!/usr/bin/env node

/**
 * Copy Leads Table SQL to Clipboard
 * Copies the leads table SQL for manual execution in Supabase
 */

const fs = require('fs')
const path = require('path')

async function copyLeadsSQL() {
  console.log('📋 DealershipAI Leads Table SQL Copier\n')
  
  const sqlPath = path.join(__dirname, '../leads-table.sql')
  
  try {
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    console.log('✅ Leads table SQL loaded successfully')
    console.log(`📏 SQL size: ${sqlContent.length} characters`)
    console.log(`📝 Lines: ${sqlContent.split('\n').length}`)
    
    // Try to copy to clipboard
    try {
      const { execSync } = require('child_process')
      execSync('pbcopy', { input: sqlContent })
      console.log('✅ SQL copied to clipboard!\n')
    } catch (clipboardError) {
      console.log('⚠️  Could not copy to clipboard automatically')
      console.log('📋 Please copy the SQL manually from the file: leads-table.sql\n')
    }
    
    console.log('📋 Next Steps:')
    console.log('1. Go to your Supabase project dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Paste the SQL (Cmd+V / Ctrl+V)')
    console.log('4. Click "Run" to execute')
    console.log('5. Come back and run: node scripts/create-leads-table.js')
    
    // Also display the SQL content
    console.log('\n📄 SQL Content:')
    console.log('=' .repeat(50))
    console.log(sqlContent)
    console.log('=' .repeat(50))
    
  } catch (error) {
    console.error('❌ Error reading leads table SQL:', error.message)
    process.exit(1)
  }
}

copyLeadsSQL().catch((error) => {
  console.error('💥 Setup failed:', error)
  process.exit(1)
})
