/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }, // tighten this to your CDN domain(s) before production
    ],
  },
};

module.exports = nextConfig;
