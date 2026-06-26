/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // CORS for /api/* so Capacitor app (origin https://localhost or capacitor://localhost) can call API with Bearer token
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PATCH, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Authorization, Content-Type, Accept' },
        ],
      },
    ]
  },
  typescript: {
    // Only ignore type errors during build if they're not critical
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
