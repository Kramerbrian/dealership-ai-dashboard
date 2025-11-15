/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
      eslint: {
        ignoreDuringBuilds: true,
      },
  // External packages for server components (Next.js 15+)
  serverExternalPackages: ['@clerk/nextjs', '@elevenlabs/elevenlabs-js'],
  // Disable static export to allow Clerk to work
  output: 'standalone',
  
  // Fix workspace root warning
  outputFileTracingRoot: __dirname,
  
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-*',
      'recharts',
      '@tanstack/react-query',
    ],
    serverComponentsExternalPackages: ['@clerk/nextjs', '@elevenlabs/elevenlabs-js'],
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Optimize webpack for better module resolution and prevent circular dependencies
  webpack: (config, { isServer, webpack, dev }) => {
    if (isServer) {
      // Ignore Supabase initialization errors in certain routes
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    // Fix for webpack module loading issues
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
    };
    // Ignore server router files that might conflict
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/server\/routers\/_app$/,
      })
    );
    
    // Production bundle optimization
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              maxSize: 244000, // 244KB chunks
            },
            // Clerk chunk (large library)
            clerk: {
              name: 'clerk',
              test: /[\\/]node_modules[\\/]@clerk[\\/]/,
              chunks: 'all',
              priority: 30,
            },
            // Framer Motion chunk
            framer: {
              name: 'framer',
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              chunks: 'all',
              priority: 25,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };
    } else {
      // Development: simpler optimization
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
      };
    }
    return config;
  },
  
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // HSTS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Content type protection
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions policy
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
          },
          // XSS protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Frame options
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'unsafe-hashes' https://js.stripe.com https://js.clerk.com https://js.clerk.dev https://clerk.accounts.dev https://*.clerk.accounts.dev https://clerk.dealershipai.com https://*.clerk.dealershipai.com https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://vercel.live https://*.vercel.live",
              "worker-src 'self' blob: https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.stripe.com https://api.clerk.com https://*.clerk.accounts.dev https://clerk.dealershipai.com https://*.clerk.dealershipai.com https://www.google-analytics.com https://analytics.google.com https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com https://*.ingest.us.sentry.io https://*.ingest.sentry.io https://o4510049793605632.ingest.us.sentry.io",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://clerk.accounts.dev https://*.clerk.accounts.dev https://clerk.dealershipai.com https://*.clerk.dealershipai.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
      // API routes get additional headers
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dash',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/dash?tab=admin',
        permanent: false,
      },
    ];
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'clerk.accounts.dev',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  // Bundle analyzer - configured via separate config when ANALYZE=true
  // Run: ANALYZE=true npm run build
};

module.exports = nextConfig;
