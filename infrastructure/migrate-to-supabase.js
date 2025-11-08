/**
 * Script to migrate infrastructure documentation to Supabase Storage
 * 
 * Usage:
 *   node migrate-to-supabase.js
 * 
 * Requires:
 *   - SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_KEY environment variable
 *   - @supabase/supabase-js package
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jhftjurcpewsagbkbtmv.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY or SUPABASE_ANON_KEY environment variable required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Upload file to Supabase Storage
 */
async function uploadFile(filePath, bucket = 'infrastructure', folder = 'terraform') {
  try {
    const fileContent = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const storagePath = `${folder}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, fileContent, {
        contentType: getContentType(filePath),
        upsert: true
      });
    
    if (error) {
      console.error(`❌ Error uploading ${fileName}:`, error.message);
      return false;
    }
    
    console.log(`✅ Uploaded: ${storagePath}`);
    return true;
  } catch (err) {
    console.error(`❌ Error reading ${filePath}:`, err.message);
    return false;
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.md': 'text/markdown',
    '.tf': 'text/plain',
    '.py': 'text/x-python',
    '.sh': 'text/x-shellscript',
    '.json': 'application/json',
    '.yaml': 'text/yaml',
    '.yml': 'text/yaml'
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * Recursively upload directory
 */
async function uploadDirectory(dirPath, bucket = 'infrastructure', baseFolder = 'terraform') {
  const files = fs.readdirSync(dirPath);
  let successCount = 0;
  let failCount = 0;
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip .terraform and other build directories
      if (file.startsWith('.') && file !== '.') {
        continue;
      }
      const subFolder = `${baseFolder}/${file}`;
      const result = await uploadDirectory(filePath, bucket, subFolder);
      successCount += result.success;
      failCount += result.fail;
    } else {
      // Skip binary and state files
      if (file.endsWith('.tfstate') || 
          file.endsWith('.zip') || 
          file.endsWith('.log')) {
        continue;
      }
      
      const uploaded = await uploadFile(filePath, bucket, baseFolder);
      if (uploaded) {
        successCount++;
      } else {
        failCount++;
      }
    }
  }
  
  return { success: successCount, fail: failCount };
}

/**
 * Create bucket if it doesn't exist
 */
async function ensureBucket(bucketName) {
  const { data, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('❌ Error listing buckets:', error.message);
    return false;
  }
  
  const bucketExists = data.some(b => b.name === bucketName);
  
  if (!bucketExists) {
    console.log(`📦 Creating bucket: ${bucketName}`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['text/*', 'application/json', 'application/x-yaml']
    });
    
    if (createError) {
      console.error('❌ Error creating bucket:', createError.message);
      return false;
    }
    console.log(`✅ Bucket created: ${bucketName}`);
  } else {
    console.log(`✅ Bucket exists: ${bucketName}`);
  }
  
  return true;
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting Supabase migration...');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log('');
  
  // Ensure bucket exists
  const bucketReady = await ensureBucket('infrastructure');
  if (!bucketReady) {
    console.error('❌ Failed to setup bucket');
    process.exit(1);
  }
  
  // Upload infrastructure files
  const sourceDir = path.join(__dirname, 'terraform');
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`❌ Source directory not found: ${sourceDir}`);
    process.exit(1);
  }
  
  console.log('📤 Uploading files...');
  const result = await uploadDirectory(sourceDir, 'infrastructure', 'terraform');
  
  console.log('');
  console.log('📊 Migration Summary:');
  console.log(`   ✅ Success: ${result.success} files`);
  console.log(`   ❌ Failed: ${result.fail} files`);
  console.log('');
  console.log('✅ Migration complete!');
  console.log(`   View at: ${SUPABASE_URL}/storage/buckets/infrastructure`);
}

// Run migration
migrate().catch(console.error);
