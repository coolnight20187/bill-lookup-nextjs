/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    API_BASE_URL: process.env.API_BASE_URL,
    API_GET_BILL_PATH: process.env.API_GET_BILL_PATH,
    API_COOKIE: process.env.API_COOKIE,
    API_CSRF_TOKEN: process.env.API_CSRF_TOKEN,
    NEW_API_BASE_URL: process.env.NEW_API_BASE_URL,
    NEW_API_PATH: process.env.NEW_API_PATH,
  }
}

module.exports = nextConfig