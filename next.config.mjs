import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const devOrigin = "http://127.0.0.1:4000";
// Static export only for production build (Tauri uses ../out). Dev server needs full Next so API routes work.
const nextConfig = {
  ...(process.env.NODE_ENV === "production" && { output: "export" }),
  images: {
    unoptimized: true,
  },
  // In dev, use absolute URLs so Tauri webview loads CSS/JS reliably (relative URLs can fail in webview).
  assetPrefix: process.env.NODE_ENV === "development" ? devOrigin : undefined,
  // Force resolution of sonner and Next internal loaders from project node_modules
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sonner: path.resolve(__dirname, "node_modules/sonner"),
    };
    // Fix "Can't resolve 'next-flight-client-entry-loader'" (Next 15.0.3 with ESM config)
    const nextLoadersDir = path.resolve(
      __dirname,
      "node_modules/next/dist/build/webpack/loaders"
    );
    config.resolveLoader = config.resolveLoader || {};
    config.resolveLoader.alias = {
      ...config.resolveLoader.alias,
      "next-flight-client-entry-loader": path.join(
        nextLoadersDir,
        "next-flight-client-entry-loader.js"
      ),
    };
    return config;
  },
};

export default nextConfig;
