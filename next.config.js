/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove standalone output for Vercel compatibility
  experimental: {
    serverComponentsExternalPackages: ['googleapis', 'oracledb', 'pg-query-stream', 'drizzle-orm']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore optional database dependencies
      config.externals.push('oracledb', 'pg-query-stream', 'drizzle-orm');
    }
    return config;
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
  // Enable SWC minifier (more reliable than Terser)
  swcMinify: true,
  // Use TypeScript compiler instead of Babel
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
