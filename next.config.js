/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
