/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is enabled by default in Next.js 14
  // Ensure no pages directory interferes with app router
  experimental: {
    appDir: true,
  },
};

export default nextConfig;
