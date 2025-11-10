/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip problematic routes during build
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore Supabase initialization errors in certain routes
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // External packages for server components (Next.js 15+)
  serverExternalPackages: ['@clerk/nextjs', '@elevenlabs/elevenlabs-js'],
  // Note: instrumentationHook is now default in Next.js 15, no need to specify
  // Disable static export to allow Clerk to work
  output: 'standalone',
  
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://clerk.accounts.dev https://*.clerk.accounts.dev https://clerk.dealershipai.com https://*.clerk.dealershipai.com https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com",
              "worker-src 'self' blob: https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://api.stripe.com https://api.clerk.com https://*.clerk.accounts.dev https://clerk.dealershipai.com https://*.clerk.dealershipai.com https://www.google-analytics.com https://analytics.google.com https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com",
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
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'clerk.accounts.dev',
      'img.clerk.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
};

module.exports = nextConfig;