/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'app_build',
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['motion'],
};

module.exports = nextConfig;
