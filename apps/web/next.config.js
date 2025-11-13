const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Add path aliases for monorepo structure
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib': path.resolve(__dirname, '../../lib'),
      '@/components': path.resolve(__dirname, './components'),
      '@/contexts': path.resolve(__dirname, '../../contexts'),
      '@/app': path.resolve(__dirname, './app'),
    };

    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'dealershipai.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/www',
        destination: 'https://dealershipai.com',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
