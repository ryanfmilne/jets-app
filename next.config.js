/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add these for Netlify compatibility
  trailingSlash: false,
  output: 'standalone',
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig