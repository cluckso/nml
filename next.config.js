/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // No custom outputFileTracingRoot/turbopack.root — use defaults so Vercel build (Linux) doesn't fail during TypeScript.
  // If you see "multiple lockfiles" locally, run from project root or use: next dev --webpack
}

module.exports = nextConfig
