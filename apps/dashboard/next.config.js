/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Dashboard has its own API routes
  // Can also proxy to shared API if needed
};

module.exports = nextConfig;

