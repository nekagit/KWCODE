# ADR 024: Fix next-flight-client-entry-loader build error

## Status

Accepted.

## Context

With Next.js 15.0.3 and an ESM config (`next.config.mjs`), the build failed with:

```
Module not found: Error: Can't resolve 'next-flight-client-entry-loader' in '<project root>'
```

The loader is an internal Next.js webpack loader (React Server Components / App Router). It lives under `node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js`. Next’s default config sets `resolveLoader.alias` using `__dirname`; when the config is loaded as ESM, `__dirname` can be undefined in that context, so the alias is wrong and webpack tries to resolve the loader from the project root and fails.

## Decision

- In `next.config.mjs`, extend the webpack config to set an explicit **resolveLoader alias** for `next-flight-client-entry-loader` to the absolute path of the loader inside the project’s `node_modules/next`:

  ```js
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
  ```

- Keep existing `resolve.alias` for `sonner`; document that the webpack callback is used for both module and loader resolution where needed.

## Consequences

- Build compiles successfully without the loader resolution error.
- Workaround is localized to `next.config.mjs`; no changes to Next.js or node_modules.
- Upgrading to a newer Next.js 15.x may remove the need for this alias; it can be re-evaluated on upgrade.
