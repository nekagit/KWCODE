const isProd = process.env.NODE_ENV === "production";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Same-origin assets (no prefix) so Tauri webview loads scripts correctly.
  assetPrefix: undefined,
};

export default nextConfig;
