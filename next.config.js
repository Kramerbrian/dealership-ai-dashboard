/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  reactStrictMode: true,
  swcMinify: true,
  
  experimental: {
    serverComponentsExternalPackages: ['@clerk/nextjs', '@prisma/client'],
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Remove console logs in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Keep errors and warnings
    } : false,
  },
  
  // Output optimization
  output: 'standalone',
  
  // Security headers
  async headers() {
    // Only apply strict CSP in production
    const isDev = process.env.NODE_ENV === 'development';
    
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
            value: isDev 
              ? [
                  // Development: More permissive for HMR and webpack
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'unsafe-hashes' http://localhost:* ws://localhost:* wss://localhost:* https://js.stripe.com https://clerk.accounts.dev https://www.googletagmanager.com https://www.google-analytics.com",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                  "img-src 'self' data: https: blob:",
                  "font-src 'self' data: https://fonts.gstatic.com https://r2cdn.perplexity.ai https://*.perplexity.ai",
                  "connect-src 'self' http://localhost:* ws://localhost:* wss://localhost:* https://api.stripe.com https://api.clerk.com https://*.clerk.accounts.dev https://www.google-analytics.com https://analytics.google.com https://*.supabase.co wss://*.supabase.co",
                  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
                  "object-src 'none'",
                  "base-uri 'self'",
                  "form-action 'self'",
                ].join('; ')
              : [
                  // Production: Strict CSP
                  "default-src 'self'",
                  "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'unsafe-hashes' https://js.stripe.com https://clerk.accounts.dev https://www.googletagmanager.com https://www.google-analytics.com",
                  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                  "img-src 'self' data: https: blob:",
                  "font-src 'self' data: https://fonts.gstatic.com https://r2cdn.perplexity.ai https://*.perplexity.ai",
                  "connect-src 'self' https://api.stripe.com https://api.clerk.com https://*.clerk.accounts.dev https://www.google-analytics.com https://analytics.google.com https://*.supabase.co wss://*.supabase.co",
                  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
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
      // Static assets caching
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Images caching
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
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
        destination: '/zeropoint',
        permanent: true,
      },
      {
        source: '/intelligence',
        destination: '/intelligence',
        permanent: false,
      },
    ];
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
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
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },
  
  // Bundle analyzer (enable with ANALYZE=true)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: './bundle-analysis.html',
          })
        );
      }
      return config;
    },
  }),
  
  // Production optimizations
  poweredByHeader: false,
  
  // Compression
  compress: true,
  
  // Performance
  productionBrowserSourceMaps: false, // Disable in production for security
};

module.exports = nextConfig;
