import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: "export", // Ensures static export
  images: {
    unoptimized: true, // Disables Next.js Image Optimization (GitHub Pages does not support it)
  },
  basePath: isProd ? '/qrcheck' : '', // Change this to your GitHub repo name
  assetPrefix:isProd ? '/qrcheck' : '', // Change this to your GitHub repo name
};

export default nextConfig;
