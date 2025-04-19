/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure for Vercel deployment
  output: 'standalone',
  // Don't include external imports that aren't needed on the frontend
  experimental: {
    serverComponentsExternalPackages: [],
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
};

module.exports = nextConfig;
