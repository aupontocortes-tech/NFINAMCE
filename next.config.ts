import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Forced rebuild for deployment fix
  reactCompiler: true,
};

export default nextConfig;
