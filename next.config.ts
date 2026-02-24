import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles output mode automatically
  serverExternalPackages: ["@libsql/client"],
};

export default nextConfig;
