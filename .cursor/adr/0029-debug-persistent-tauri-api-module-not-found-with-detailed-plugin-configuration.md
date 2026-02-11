## 0029-debug-persistent-tauri-api-module-not-found-with-detailed-plugin-configuration

### Status
Accepted

### Context
The `Module not found: Can't resolve '@tauri-apps/api/dialog'` build error continued to persist, even after implementing `webpack.NormalModuleReplacementPlugin` with a basic regular expression. This indicated that the plugin was not consistently intercepting and replacing the module requests for `@tauri-apps/api` (and its sub-modules) as intended during client-side Next.js builds.

### Decision
To definitively resolve the persistent build error, the `webpack.NormalModuleReplacementPlugin` configuration in `next.config.js` was refined to use a function for the `newResource` argument and a more precise regular expression. This approach allows for more explicit control over the module replacement process.

1.  **Ensured `src/lib/noop-tauri-api.ts` Exists**: The dummy module continues to provide no-op placeholder functions.

2.  **Modified `next.config.js` with Detailed Plugin Configuration**: The `webpack` configuration was updated to use a function for the `newResource` argument of `NormalModuleReplacementPlugin`, along with an adjusted regular expression:

    ```javascript
    // ...
    webpack: (config, { isServer, webpack }) => {
      if (!isServer) {
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            /^@tauri-apps\\/api(\\/.*)?$/,
            (resource) => {
              resource.request = require.resolve("./src/lib/noop-tauri-api.ts");
            }
          )
        );
      }
      return config;
    },
    // ...
    ```

    The regular expression `^@tauri-apps\/api(\\/.*)?$` is designed to match both `@tauri-apps/api` and any of its sub-modules (e.g., `@tauri-apps/api/dialog`). The function passed as the second argument to `NormalModuleReplacementPlugin` directly modifies the `resource.request` to point to `src/lib/noop-tauri-api.ts`.

### Consequences
This refined plugin configuration provides a more robust and explicit mechanism for replacing Tauri API imports during client-side Next.js builds. It is expected to finally resolve the `Module not found` error by ensuring that Webpack correctly substitutes all references to `@tauri-apps/api` with the no-op dummy module. This will allow for successful builds in non-Tauri environments while maintaining full functionality in the Tauri desktop application.
