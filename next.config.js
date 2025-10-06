/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://localhost:8000',
  },
  async rewrites() {
    return [
      {
        source: '/api/analysis/:path*',
        destination: `${process.env.BACKEND_API_URL || 'http://localhost:8000'}/api/analysis/:path*`,
      },
    ];
  },
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;