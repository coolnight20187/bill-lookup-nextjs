/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placehold.co'],
  },
  // Remove env section since Next.js automatically loads from .env files
}

module.exports = nextConfig