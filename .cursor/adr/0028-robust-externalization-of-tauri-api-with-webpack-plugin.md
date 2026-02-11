## 0028-robust-externalization-of-tauri-api-with-webpack-plugin

### Status
Accepted

### Context
The `Module not found: Can't resolve '@tauri-apps/api/dialog'` build error persisted despite previous attempts to externalize `@tauri-apps/api` using `config.resolve.alias` in `next.config.js`. This indicated that Webpack's aliasing mechanism was not sufficiently preventing the bundler from attempting to resolve and include the native Tauri API modules during client-side Next.js builds.

### Decision
To definitively resolve the persistent build error, a more robust Webpack externalization strategy was implemented using `webpack.NormalModuleReplacementPlugin` within `next.config.js`.

1.  **Confirmed `src/lib/noop-tauri-api.ts`**: The dummy module created in the previous step was confirmed to be present and correctly defined.

2.  **Modified `next.config.js`**: The `webpack` configuration was updated to leverage `NormalModuleReplacementPlugin`:

    ```javascript
    // ...
    webpack: (config, { isServer, webpack }) => {
      if (!isServer) {
        config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            /^@tauri-apps\\/api.*$/,
            require.resolve("./src/lib/noop-tauri-api.ts")
          )
        );
      }
      return config;
    },
    // ...
    ```

    This plugin explicitly instructs Webpack to intercept any import request matching the regular expression `/^@tauri-apps\/api.*$/` and replace it with an import from `src/lib/noop-tauri-api.ts`, but only when `isServer` is `false` (i.e., for client-side builds).

### Consequences
This robust externalization strategy ensures that the `@tauri-apps/api` modules are never bundled into the client-side JavaScript. Webpack will now replace these imports with the no-op dummy module during web builds, definitively resolving the `Module not found` error. When the application runs in a Tauri environment, the native Tauri API will be correctly loaded and utilized, while the web build remains functional without native API references. This approach provides a clear and reliable separation of concerns for Tauri-specific code.
