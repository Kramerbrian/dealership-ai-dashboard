const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing dynamic configuration placement...');

const apiRoutesDir = path.join(process.cwd(), 'app', 'api');

function fixDynamicConfig(filePath) {
  if (!fs.existsSync(filePath)) return false;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file has the misplaced dynamic config
  if (content.includes('import { NextRequest, NextResponse } from \nexport const dynamic')) {
    // Fix the placement
    content = content.replace(
      /import { NextRequest, NextResponse } from \nexport const dynamic = 'force-dynamic';\n'next\/server';/,
      "import { NextRequest, NextResponse } from 'next/server';\n\nexport const dynamic = 'force-dynamic';"
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  
  // Check for other patterns
  if (content.includes('import { NextResponse } from \nexport const dynamic')) {
    content = content.replace(
      /import { NextResponse } from \nexport const dynamic = 'force-dynamic';\n'next\/server';/,
      "import { NextResponse } from 'next/server';\n\nexport const dynamic = 'force-dynamic';"
    );
    
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

console.log('🎉 Dynamic configuration fixed!');
