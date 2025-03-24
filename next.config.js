const { i18n } = require('./next-i18next.config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  //i18n,
  reactStrictMode: true,
  redirects: async () => {
    return [
      {
        source: '/en',
        destination: '/',
        permanent: true,
      },
      {
        source: '/jp',
        destination: '/',
        permanent: true,
      },
      {
        source: '/zh',
        destination: '/',
        permanent: true,
      },
    ];
  },
  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
};

module.exports = nextConfig;
