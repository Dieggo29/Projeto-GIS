/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Habilitado para detectar problemas
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Configurações para deploy no Vercel
  images: {
    domains: ['api.openweathermap.org'],
  },
  // Otimizações para produção
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;