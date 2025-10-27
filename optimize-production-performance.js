const fs = require('fs');
const path = require('path');

console.log('🚀 Applying production performance optimizations...');

// 1. Optimize Next.js config for production
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-*'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options', 
          value: 'DENY'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable'
        }
      ]
    }
  ],
  // Disable static optimization for pages with Clerk
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  // Enable SWC minification
  swcMinify: true,
  // Optimize bundle
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true
          }
        }
      };
    }
    return config;
  }
};

module.exports = nextConfig;`;

fs.writeFileSync('next.config.js', nextConfig);
console.log('✅ Optimized Next.js config');

// 2. Create production-ready package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  'build:production': 'NODE_ENV=production next build',
  'build:analyze': 'ANALYZE=true next build',
  'build:clean': 'rm -rf .next && npm run build',
  'start:production': 'NODE_ENV=production next start',
  'lint:fix': 'next lint --fix',
  'type-check': 'tsc --noEmit',
  'prebuild': 'npm run lint:fix && npm run type-check'
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json scripts');

// 3. Create production deployment checklist
const deploymentChecklist = `# Production Deployment Checklist

## Pre-Deployment
- [ ] All environment variables configured
- [ ] Clerk production keys set up
- [ ] Supabase production database configured
- [ ] Redis/Upstash production instance ready
- [ ] Stripe production keys configured
- [ ] Domain DNS configured (dealershipai.com)

## Build & Test
- [ ] npm run build:production succeeds
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings addressed
- [ ] Performance audit completed
- [ ] Security audit completed

## Deployment
- [ ] Vercel project configured
- [ ] Environment variables added to Vercel
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] CDN configuration optimized

## Post-Deployment
- [ ] All pages load correctly
- [ ] Authentication flow works
- [ ] API endpoints respond
- [ ] Database connections active
- [ ] Redis caching working
- [ ] Analytics tracking active

## Performance Targets
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms
- [ ] Time to Interactive < 3s

## Security Checklist
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Input validation in place
- [ ] Authentication secure
- [ ] API keys protected

## Monitoring
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring active
- [ ] Uptime monitoring set up
- [ ] Analytics configured
- [ ] Log aggregation working
`;

fs.writeFileSync('PRODUCTION_DEPLOYMENT_CHECKLIST.md', deploymentChecklist);
console.log('✅ Created production deployment checklist');

console.log('🎉 Production optimizations completed!');
console.log('📋 Next steps:');
console.log('1. Run npm run build:production');
console.log('2. Test all functionality');
console.log('3. Deploy to Vercel');
console.log('4. Follow the deployment checklist');
