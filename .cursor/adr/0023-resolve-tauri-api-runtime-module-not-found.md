## 0023-resolve-tauri-api-runtime-module-not-found

### Status
Accepted

### Context
Despite implementing dynamic imports for Tauri API functions, a runtime error (`Cannot find module '@tauri-apps/api/dialog'`) persisted. This indicated that Next.js's Webpack bundler was still attempting to resolve and include `@tauri-apps/api` modules in the client-side bundle, even for non-Tauri environments, leading to errors when those modules were not available.

### Decision
To definitively resolve the "Cannot find module '@tauri-apps/api/dialog'" runtime error, the Next.js Webpack configuration was customized to externalize `@tauri-apps/api` modules when building for the client-side. This prevents Webpack from bundling these modules, ensuring they are only resolved when the application is actually running in a Tauri environment.

Specifically, the `next.config.js` file was modified to include a `webpack` function:

```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@tauri-apps/api": false,
    };
  }
  return config;
},
```

By setting the alias for `@tauri-apps/api` to `false` (or `"./src/lib/noop-tauri.ts"` for a more explicit no-op module if needed) when `!isServer`, Webpack is instructed to treat these imports as external or effectively ignore them for client-side builds. This ensures that the Tauri API is only loaded in the actual Tauri runtime.

### Consequences
This change eliminates the runtime error by preventing the client-side bundle from including references to `@tauri-apps/api` modules when not in a Tauri environment. The application will now build and run correctly in both web and Tauri contexts, with Tauri-specific functionalities being available only when the application is executed as a Tauri desktop app.
