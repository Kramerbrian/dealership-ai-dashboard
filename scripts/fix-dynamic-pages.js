#!/usr/bin/env node

/**
 * Script to add dynamic export config to pages that need it
 * This fixes React Context errors during static generation
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const DYNAMIC_CONFIG = `
// Force dynamic rendering to avoid SSR context issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;
`;

function addDynamicConfig(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has dynamic config
  if (content.includes('export const dynamic')) {
    return false;
  }
  
  // Find the export default function
  const defaultExportMatch = content.match(/export\s+default\s+function\s+(\w+)/);
  if (!defaultExportMatch) {
    return false;
  }
  
  // Insert dynamic config before export default
  const beforeExport = content.substring(0, content.indexOf(defaultExportMatch[0]));
  const afterExport = content.substring(content.indexOf(defaultExportMatch[0]));
  
  const newContent = beforeExport.trim() + DYNAMIC_CONFIG + afterExport;
  
  fs.writeFileSync(filePath, newContent, 'utf8');
  return true;
}

// Find all page.tsx files
const pages = glob.sync('app/**/page.tsx', { cwd: __dirname + '/..' });

let fixed = 0;
for (const page of pages) {
  const fullPath = path.join(__dirname, '..', page);
  if (addDynamicConfig(fullPath)) {
    console.log(`Fixed: ${page}`);
    fixed++;
  }
}

console.log(`\nFixed ${fixed} pages with dynamic config`);

