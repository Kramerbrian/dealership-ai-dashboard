/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@dealershipai/shared', '@dealershipai/ui'],
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig

