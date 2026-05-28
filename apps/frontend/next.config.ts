import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@vedaai/shared-types'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
