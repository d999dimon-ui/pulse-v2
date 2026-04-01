/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly enable App Router for Vercel deployment
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
