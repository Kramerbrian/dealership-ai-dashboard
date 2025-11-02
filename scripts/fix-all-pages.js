#!/usr/bin/env node

/**
 * Script to add dynamic export config to all pages
 * This fixes React Context errors during static generation
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const DYNAMIC_CONFIG = `
// Force dynamic rendering to avoid SSR context issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
`;

async function addDynamicConfig(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has dynamic config
    if (content.includes('export const dynamic')) {
      return false;
    }
    
    // Skip if file is empty or doesn't have default export
    if (!content.includes('export default')) {
      return false;
    }
    
    // Find the last import statement or 'use client' directive
    const useClientMatch = content.match(/'use client';/);
    const lastImportMatch = content.match(/^import .+ from ['"].+['"];$/gm);
    
    let insertPosition = 0;
    
    if (useClientMatch) {
      insertPosition = useClientMatch.index + useClientMatch[0].length;
    } else if (lastImportMatch && lastImportMatch.length > 0) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      insertPosition = content.indexOf(lastImport) + lastImport.length;
    } else {
      // Find export default and insert before it
      const exportDefaultMatch = content.match(/export\s+default\s+function/);
      if (exportDefaultMatch) {
        insertPosition = exportDefaultMatch.index;
      } else {
        return false;
      }
    }
    
    // Insert dynamic config
    const before = content.substring(0, insertPosition).trim();
    const after = content.substring(insertPosition).trim();
    
    const newContent = before + (before ? '\n' : '') + DYNAMIC_CONFIG + '\n' + after;
    
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  // Find all page.tsx files
  const pages = await glob('app/**/page.tsx', {
    cwd: process.cwd(),
    ignore: ['**/node_modules/**']
  });

  let fixed = 0;
  let skipped = 0;
  let errors = 0;

  for (const page of pages) {
    const fullPath = path.join(process.cwd(), page);
    
    try {
      const result = await addDynamicConfig(fullPath);
      if (result) {
        console.log(`✓ Fixed: ${page}`);
        fixed++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`✗ Error: ${page} - ${error.message}`);
      errors++;
    }
  }

  console.log(`\nSummary:`);
  console.log(`  Fixed: ${fixed} pages`);
  console.log(`  Skipped: ${skipped} pages (already configured)`);
  console.log(`  Errors: ${errors} pages`);
}

main().catch(console.error);

