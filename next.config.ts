import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['next-intl'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default config;
