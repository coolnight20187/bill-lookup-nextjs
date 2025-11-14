/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['bcrypt', 'pg']
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    API_BASE_URL: process.env.API_BASE_URL,
    API_GET_BILL_PATH: process.env.API_GET_BILL_PATH,
    API_COOKIE: process.env.API_COOKIE,
    API_CSRF_TOKEN: process.env.API_CSRF_TOKEN,
    NEW_API_BASE_URL: process.env.NEW_API_BASE_URL,
    NEW_API_PATH: process.env.NEW_API_PATH,
  }
}

module.exports = nextConfig