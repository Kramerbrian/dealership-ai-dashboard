const { execSync } = require('child_process');

const ENV_VARS = {
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL': '/auth/signin',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL': '/auth/signup',
  'NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL': '/dashboard',
  'NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL': '/dashboard',
  'NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL': '/dashboard',
  'NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL': '/dashboard'
};

console.log('🔧 Adding Clerk environment variables to Vercel...');

Object.entries(ENV_VARS).forEach(([key, value]) => {
  try {
    console.log(`\n📝 Adding ${key}=${value}...`);
    
    // Use echo to pipe the value to vercel env add
    const command = `echo "${value}" | npx vercel env add ${key} production`;
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ Added ${key}=${value}`);
  } catch (error) {
    console.log(`⚠️  Failed to add ${key}: ${error.message}`);
    console.log(`   Manual step: Go to Vercel Dashboard → Settings → Environment Variables`);
    console.log(`   Add: ${key} = ${value}`);
  }
});

console.log('\n🎉 Environment variables configuration complete!');
console.log('\n🚀 Next steps:');
console.log('1. Redeploy: npx vercel --prod');
console.log('2. Test: https://dealershipai.com');
console.log('3. Verify authentication redirects work');
