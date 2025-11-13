#!/usr/bin/env node

/**
 * Fix syntax errors in route files
 * Finds routes that mix createEnhancedApiRoute with standalone exports
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROUTE_PATTERN = 'app/api/**/route.ts';

async function findRouteFiles() {
  const files = await glob(ROUTE_PATTERN);
  return files;
}

function fixRouteFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let fixed = content;
  let changed = false;

  // Pattern 1: Missing closing for createEnhancedApiRoute followed by standalone export
  // Look for: createEnhancedApiRoute(...) ... export async function POST
  const pattern1 = /(export const (GET|POST) = createEnhancedApiRoute\([\s\S]*?async \(req, auth\) => \{[\s\S]*?)(\}\s*\)\s*;\s*\n\s*export async function (GET|POST)\([^)]*\) \{[\s\S]*?\}\s*\)\s*;)/g;
  
  if (pattern1.test(content)) {
    // Remove the duplicate standalone export
    fixed = fixed.replace(
      /(\}\s*\)\s*;\s*\n\s*export async function (GET|POST)\([^)]*\) \{[\s\S]*?\}\s*\)\s*;)/g,
      '});'
    );
    changed = true;
  }

  // Pattern 2: Extra closing braces and parentheses after createEnhancedApiRoute
  // Look for: }); followed by }); or extra closing
  const pattern2 = /(\}\s*\)\s*;\s*\n\s*)(\}\s*\)\s*;)/g;
  if (pattern2.test(fixed)) {
    fixed = fixed.replace(pattern2, '});\n');
    changed = true;
  }

  // Pattern 3: Missing import for createEnhancedApiRoute
  if (fixed.includes('createEnhancedApiRoute') && !fixed.includes("from '@/lib/api-enhanced-wrapper'")) {
    const importLine = "import { createEnhancedApiRoute } from '@/lib/api-enhanced-wrapper';\n";
    if (!fixed.includes(importLine)) {
      // Add import after NextRequest import
      fixed = fixed.replace(
        /(import.*NextRequest.*from.*['"]next\/server['"];?\n)/,
        `$1${importLine}`
      );
      changed = true;
    }
  }

  // Pattern 4: Fix agent/visibility route specifically
  if (filePath.includes('agent/visibility')) {
    // Remove the extra closing at the end
    fixed = fixed.replace(/\}\s*\)\s*;\s*$/m, '});');
    // Fix the GET handler to properly close
    fixed = fixed.replace(
      /(async \(req, auth\) => \{[\s\S]*?)(\}\s*\)\s*;\s*\n\s*\*\*)/,
      '$1});\n\n/**'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }

  return false;
}

async function main() {
  console.log('🔍 Finding route files...\n');
  const files = await findRouteFiles();
  console.log(`Found ${files.length} route files\n`);

  let fixedCount = 0;
  for (const file of files) {
    try {
      if (fixRouteFile(file)) {
        fixedCount++;
      }
    } catch (error) {
      console.error(`❌ Error fixing ${file}:`, error.message);
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} files`);
}

main().catch(console.error);

