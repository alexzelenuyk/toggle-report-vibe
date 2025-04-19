/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure for Vercel deployment
  output: 'standalone',
  // Configure CORS and proxy settings for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  // Configure redirects and rewrites
  async rewrites() {
    return [
      {
        source: '/api/toggl/:path*',
        destination: 'https://api.track.toggl.com/:path*',
      },
    ];
  },
  // Silence specific deprecation warnings
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Load our helper to silence the specific deprecation warning
      require('./src/lib/utils/silence-deprecation');
    }
    return config;
  },
};

module.exports = nextConfig;
