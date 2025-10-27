const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing ALL dynamic configuration issues...');

const apiRoutesDir = path.join(process.cwd(), 'app', 'api');

function fixDynamicConfig(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  // Pattern 1: import { NextResponse } from \nexport const dynamic = 'force-dynamic';\n"next/server";
  if (content.includes('import { NextResponse } from \nexport const dynamic')) {
    content = content.replace(
      /import { NextResponse } from \nexport const dynamic = 'force-dynamic';\n"next\/server";/,
      'import { NextResponse } from "next/server";\n\nexport const dynamic = \'force-dynamic\';'
    );
    changed = true;
  }
  
  // Pattern 2: import { NextRequest, NextResponse } from \nexport const dynamic = 'force-dynamic';\n'next/server';
  if (content.includes('import { NextRequest, NextResponse } from \nexport const dynamic')) {
    content = content.replace(
      /import { NextRequest, NextResponse } from \nexport const dynamic = 'force-dynamic';\n'next\/server';/,
      "import { NextRequest, NextResponse } from 'next/server';\n\nexport const dynamic = 'force-dynamic';"
    );
    changed = true;
  }
  
  // Pattern 3: Multiple imports with dynamic in between
  if (content.includes('import { NextRequest, NextResponse } from \nexport const dynamic = \'force-dynamic\';\n\'next/server\'\nimport')) {
    content = content.replace(
      /import { NextRequest, NextResponse } from \nexport const dynamic = 'force-dynamic';\n'next\/server'\nimport/g,
      "import { NextRequest, NextResponse } from 'next/server';\nimport"
    );
    // Add dynamic after all imports
    const importEndRegex = /(import.*?from.*?;?\s*)+/;
    const match = content.match(importEndRegex);
    if (match) {
      content = content.replace(
        match[0],
        match[0] + '\nexport const dynamic = \'force-dynamic\';\n'
      );
    }
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  
  return false;
}

function processDirectory(dir) {
  let fixedCount = 0;
  
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        fixedCount += processDirectory(fullPath);
      } else if (file.endsWith('route.ts') || file.endsWith('route.js')) {
        if (fixDynamicConfig(fullPath)) {
          fixedCount++;
        }
      }
    });
  }
  
  return fixedCount;
}

const fixedRoutes = processDirectory(apiRoutesDir);
console.log(`✅ Fixed ${fixedRoutes} API routes`);

console.log('🎉 All dynamic configuration issues fixed!');
