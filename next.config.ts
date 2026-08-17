import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/tablero",
        destination: "/solicitudes",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
