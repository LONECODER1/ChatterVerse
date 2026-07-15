import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['192.168.1.41'],
  async rewrites() {
    return [
      {
        source: '/((?!api|_next|static|.*\\..*).*)',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
