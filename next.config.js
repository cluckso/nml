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
  // No custom outputFileTracingRoot/turbopack.root — use defaults so Vercel build (Linux) doesn't fail during TypeScript.
  // If you see "multiple lockfiles" locally, run from project root or use: next dev --webpack
}

module.exports = nextConfig
