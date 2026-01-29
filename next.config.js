const path = require('path')

// Same value for turbopack and file tracing (Vercel warns if they differ).
const projectRoot = path.resolve(__dirname).split(path.sep).join('/')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Align tracing root with turbopack root so "outputFileTracingRoot and turbopack.root must have the same value" is satisfied.
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
}

module.exports = nextConfig
