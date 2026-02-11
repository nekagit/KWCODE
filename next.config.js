/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    const IS_TAURI_BUILD = process.env.NEXT_PUBLIC_IS_TAURI === 'true';

    if (IS_TAURI_BUILD) {
      config.externals.push(
        {
          "@tauri-apps/api": "commonjs @tauri-apps/api",
        }
      );
    }

    return config;
  },
};

module.exports = nextConfig;