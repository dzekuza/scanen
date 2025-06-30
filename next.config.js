/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BUILDER_PUBLIC_KEY: process.env.PUBLIC_BUILDER_KEY,
  },
};

module.exports = nextConfig;
