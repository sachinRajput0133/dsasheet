import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Output standalone for Docker
  output: 'standalone',

  // Image domains if needed
  images: {
    domains: [],
  },

  // Env vars exposed to browser must be prefixed NEXT_PUBLIC_
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  },
};

export default nextConfig;
