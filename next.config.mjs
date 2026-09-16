/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/tools/resize-pdf-kb",
        destination: "/tools/compress-to-size",
        permanent: true,
      },
      {
        source: "/tools/resize-pdf-mb",
        destination: "/tools/compress-to-size",
        permanent: true,
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
