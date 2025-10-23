/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Para deploy estático
  },
  trailingSlash: true,
  // Removendo a seção env que estava causando o warning
  // PWA configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;