const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Instrumentation is now available by default in Next.js 15
  // experimental: {
  //   instrumentationHook: true, // No longer needed
  // },

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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://clerk.accounts.dev https://clerk.dealershipai.com https://*.clerk.accounts.dev https://*.clerk.dealershipai.com https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com https://*.sentry.io",
              "worker-src 'self' blob: https://*.clerk.com https://*.clerk.dev https://clerk.accounts.dev https://clerk.dealershipai.com https://js.clerk.com https://js.clerk.dev",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com https://r2cdn.perplexity.ai",
              "connect-src 'self' https://api.stripe.com https://api.clerk.com https://*.clerk.accounts.dev https://*.clerk.dealershipai.com https://clerk.dealershipai.com https://www.google-analytics.com https://analytics.google.com https://va.vercel-scripts.com https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://api.workos.com",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://clerk.accounts.dev https://*.clerk.accounts.dev https://clerk.dealershipai.com",
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
      // Static assets get long cache
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Images get compression
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      // Redirect /dash to /dashboard (backwards compatibility)
      {
        source: '/dash',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/admin',
        destination: '/dashboard?tab=admin',
        permanent: false,
      },
    ];
  },
  
  // Image optimization (using remotePatterns instead of deprecated domains)
  images: {
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
        hostname: '*.clerk.accounts.dev',
      },
      {
        protocol: 'https',
        hostname: '*.clerk.dealershipai.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Compression
  compress: true,
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fix for jsx-runtime module resolution
    // Next.js should handle this automatically, but we ensure it works
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }

    // Bundle analyzer (enable with ANALYZE=true)
    if (process.env.ANALYZE === 'true' && !isServer) {
      try {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: './bundle-analysis.html',
          })
        );
      } catch (error) {
        console.warn('Bundle analyzer not available:', error);
      }
    }

    return config;
  },
};

// Sentry configuration - only enable if SENTRY_DSN is set
const sentryEnabled = process.env.SENTRY_DSN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT;

if (sentryEnabled) {
  module.exports = withSentryConfig(
    nextConfig,
    {
      // Sentry Webpack Plugin options
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    },
    {
      // Upload source maps for production builds
      widenClientFileUpload: true,
      transpileClientSDK: true,
      tunnelRoute: "/monitoring",
      hideSourceMaps: true,
      disableLogger: true,
    }
  );
} else {
  module.exports = nextConfig;
}
