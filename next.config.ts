import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  allowedDevOrigins: ['192.168.1.41'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5001/api/:path*',
      },
      {
        source: '/socket.io/:path*',
        destination: 'http://127.0.0.1:5001/socket.io/:path*',
      },
      {
        source: '/((?!api|_next|static|.*\\..*).*)',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
