const fs = require('fs');
const path = require('path');

// Get all API files recursively
function getAllApiFiles(dir) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files = files.concat(getAllApiFiles(fullPath));
    } else if (item === 'route.ts') {
      files.push(fullPath);
    }
  }
  
  return files;
}

console.log('🔧 Fixing all NextRequest imports comprehensively...');

const apiFiles = getAllApiFiles('app/api');
let fixedCount = 0;

apiFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    // Fix import statements
    if (content.includes('import { NextRequest, NextResponse }')) {
      content = content.replace(/import { NextRequest, NextResponse } from 'next\/server';/g, "import { NextResponse } from 'next/server';");
      changed = true;
    }
    
    // Fix function parameters
    if (content.includes('req: NextRequest')) {
      content = content.replace(/req: NextRequest/g, '');
      changed = true;
    }
    
    // Fix function signatures
    if (content.includes('export async function GET(req: NextRequest)')) {
      content = content.replace(/export async function GET\(req: NextRequest\)/g, 'export async function GET()');
      changed = true;
    }
    
    if (content.includes('export async function POST(req: NextRequest)')) {
      content = content.replace(/export async function POST\(req: NextRequest\)/g, 'export async function POST()');
      changed = true;
    }
    
    if (content.includes('export async function PUT(req: NextRequest)')) {
      content = content.replace(/export async function PUT\(req: NextRequest\)/g, 'export async function PUT()');
      changed = true;
    }
    
    if (content.includes('export async function DELETE(req: NextRequest)')) {
      content = content.replace(/export async function DELETE\(req: NextRequest\)/g, 'export async function DELETE()');
      changed = true;
    }
    
    if (content.includes('export async function PATCH(req: NextRequest)')) {
      content = content.replace(/export async function PATCH\(req: NextRequest\)/g, 'export async function PATCH()');
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed ${filePath}`);
      fixedCount++;
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
});

console.log(`🎉 Fixed ${fixedCount} files!`);
