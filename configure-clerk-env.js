const fs = require('fs');
const path = require('path');

// Environment variables for Clerk redirect URLs
const CLERK_ENV_VARS = {
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL': '/auth/signin',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL': '/auth/signup', 
  'NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL': '/dashboard',
  'NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL': '/dashboard',
  'NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL': '/dashboard',
  'NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL': '/dashboard'
};

function configureClerkEnvironment() {
  console.log('🔧 Configuring Clerk environment variables...');
  
  try {
    // Read current .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Add or update Clerk environment variables
    let updated = false;
    Object.entries(CLERK_ENV_VARS).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const newLine = `${key}=${value}`;
      
      if (regex.test(envContent)) {
        // Update existing
        envContent = envContent.replace(regex, newLine);
        console.log(`✅ Updated ${key}=${value}`);
      } else {
        // Add new
        envContent += `\n${newLine}`;
        console.log(`✅ Added ${key}=${value}`);
      }
      updated = true;
    });
    
    // Write back to .env.local
    if (updated) {
      fs.writeFileSync(envPath, envContent);
      console.log('\n🎉 Clerk environment variables configured successfully!');
      console.log('\n📋 Added/Updated variables:');
      Object.entries(CLERK_ENV_VARS).forEach(([key, value]) => {
        console.log(`   ${key}=${value}`);
      });
      
      console.log('\n🚀 Next steps:');
      console.log('1. Redeploy to Vercel: npx vercel --prod');
      console.log('2. Test authentication at: https://dealershipai.com');
      console.log('3. Verify redirects work properly');
      
    } else {
      console.log('⚠️  No changes needed - environment variables already configured');
    }
    
  } catch (error) {
    console.error('❌ Error configuring Clerk environment:', error.message);
    console.log('\n🔧 Manual configuration required:');
    console.log('Add these to your .env.local file:');
    Object.entries(CLERK_ENV_VARS).forEach(([key, value]) => {
      console.log(`${key}=${value}`);
    });
  }
}

// Run the configuration
configureClerkEnvironment();
