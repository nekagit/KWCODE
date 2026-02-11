# 0032 - Robust Externalization of Tauri API in Next.js Webpack

## Status
Accepted

## Context
Previously, attempts to externalize specific `@tauri-apps/api` sub-modules in `next.config.js` for Next.js applications running within a Tauri environment were not consistently resolving "Module not found" errors, particularly for `@tauri-apps/api/dialog`. This indicated that the granular externalization approach was insufficient or incompatible with how Webpack and Next.js handle these dynamic imports.

## Decision
To ensure all `@tauri-apps/api` sub-modules are correctly externalized and not bundled by Webpack when `NEXT_PUBLIC_IS_TAURI` is true, we will modify `next.config.js` to externalize the entire `@tauri-apps/api` package. This change will allow Tauri to load its API at runtime without interference from Webpack.

The updated `next.config.js` configuration will look like this:

```javascript
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
```

## Consequences
- The "Module not found" errors for `@tauri-apps/api` sub-modules, specifically `@tauri-apps/api/dialog`, should be resolved.
- The Next.js application will correctly utilize the Tauri API when `NEXT_PUBLIC_IS_TAURI` is true.
- This approach provides a more robust and comprehensive externalization strategy for the Tauri API, preventing potential future module resolution issues with other sub-modules.