import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['ssh2', 'ssh2-sftp-client', 'emf-to-png', '@resvg/resvg-js', 'sharp']
};

export default nextConfig;
