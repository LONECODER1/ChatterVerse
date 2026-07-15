import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['192.168.1.41'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://localhost:5001/socket.io/:path*',
      },
      {
        source: '/((?!api|_next|static|.*\\..*).*)',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
