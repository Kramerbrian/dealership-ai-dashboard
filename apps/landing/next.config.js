/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Landing page doesn't need API routes
  // But we can proxy to shared API if needed
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.dealershipai.com/:path*', // Or keep in root
      },
    ];
  },
};

module.exports = nextConfig;

