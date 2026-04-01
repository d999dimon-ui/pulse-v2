/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly enable App Router for Vercel deployment
  experimental: {
    appDir: true,
  },
  // Nuclear fix: Force Vercel to use new clean build directory
  distDir: '.next_custom',
};

export default nextConfig;
