import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Forced rebuild for deployment fix
  reactCompiler: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
