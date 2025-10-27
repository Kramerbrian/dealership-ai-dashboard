const fs = require('fs');
const path = require('path');

console.log('⚡ Applying final production optimizations...');

// 1. Update Next.js config for maximum performance
const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react', 
      'framer-motion', 
      '@radix-ui/react-*',
      'recharts',
      '@tanstack/react-query'
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    },
    serverComponentsExternalPackages: ['@clerk/nextjs']
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    styledComponents: true
  },
  
  // Image optimizations
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Security headers
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
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()'
        }
      ]
    }
  ],
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5
          },
          clerk: {
            test: /[\\/]node_modules[\\/]@clerk[\\/]/,
            name: 'clerk',
            chunks: 'all',
            priority: 20
          }
        }
      };
    }
    
    return config;
  },
  
  // Disable static optimization for auth pages
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  swcMinify: true,
  
  // Output configuration
  output: 'standalone',
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
};

module.exports = nextConfig;`;

fs.writeFileSync('next.config.js', nextConfig);
console.log('✅ Optimized Next.js configuration');

// 2. Create production-ready package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  'dev': 'next dev',
  'build': 'next build',
  'start': 'next start',
  'lint': 'next lint',
  'type-check': 'tsc --noEmit',
  'build:production': 'NODE_ENV=production next build',
  'build:analyze': 'ANALYZE=true next build',
  'build:clean': 'rm -rf .next out dist && npm run build:production',
  'start:production': 'NODE_ENV=production next start',
  'lint:fix': 'next lint --fix',
  'prebuild': 'npm run lint:fix && npm run type-check',
  'postbuild': 'echo "Build completed successfully!"',
  'deploy': 'vercel --prod',
  'deploy:preview': 'vercel',
  'health-check': 'curl -f http://localhost:3000/api/health || exit 1'
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json for production');

// 3. Create health check endpoint
const healthCheckContent = `import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}`;

// Create health check directory if it doesn't exist
const healthCheckDir = 'app/api/health';
if (!fs.existsSync(healthCheckDir)) {
  fs.mkdirSync(healthCheckDir, { recursive: true });
}
fs.writeFileSync('app/api/health/route.ts', healthCheckContent);
console.log('✅ Created health check endpoint');

console.log('🎉 Production optimizations completed!');
console.log('📋 Ready for 100% production deployment!');
