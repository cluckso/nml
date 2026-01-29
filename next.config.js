const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Explicit root so Next.js uses this project, not a parent with another lockfile.
  // Use forward slashes on Windows to avoid Turbopack "Failed to benchmark file I/O" (os error 3).
  turbopack: {
    root: path.resolve(__dirname).split(path.sep).join('/'),
  },
}

module.exports = nextConfig
