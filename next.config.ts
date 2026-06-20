import type { NextConfig } from "next";

process.env.TZ = "America/Argentina/Buenos_Aires";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@auth/core", "bcryptjs"],
};

export default nextConfig;
