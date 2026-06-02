/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['node-ssh', 'ssh2'],
};

export default nextConfig;
