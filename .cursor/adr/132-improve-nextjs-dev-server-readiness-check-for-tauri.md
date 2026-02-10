# 132. Improve Next.js Dev Server Readiness Check for Tauri

## Context

The application was failing to load essential frontend JavaScript files (e.g., `main-app.js`, `app-pages-internals.js`) when running within the Tauri development environment. This resulted in 404 errors and a blank user interface, indicating that the Next.js development server was not properly serving its assets or that Tauri's `beforeDevCommand` (`npm run dev:tauri`) was not accurately detecting when the frontend was ready.

The `script/wait-dev-server.mjs` script is responsible for starting the Next.js development server and waiting for it to be ready before Tauri opens the application window. The existing chunk URL detection logic and logging were insufficient to diagnose the exact cause of the asset loading failures, especially with potential changes in Next.js asset paths (e.g., in Next.js 15).

## Decision

To address the asset loading failures and improve the diagnostic capabilities of the `wait-dev-server.mjs` script, the following modifications have been implemented:

1.  **More Generic `findChunkUrl`**: The `findChunkUrl` function has been updated to use a more generic regular expression. Instead of specifically looking for `_next/static` or `_next/webpack`, it now searches for any `<script>` tag with a `src` attribute containing `/_next/`. This makes the script more resilient to changes in Next.js asset naming conventions and ensures it can correctly identify the compiled JavaScript chunks.
    *   **Old Regex**: `src=["']([^"']*_next\/static[^"']+)["']` or `<script[^>]+src=["']([^"']*_next\/static[^"']+)["']` or `src=["']([^"']*_next\/[^"']+)["']`
    *   **New Regex**: `/<script[^>]+src=[\"\']([^\"\']*\/_next\/[^\"\']+)[\"\']/`

2.  **Enhanced Logging in `waitForChunk`**: Detailed `console.log` statements have been added within the `waitForChunk` function. These logs now explicitly show:
    *   When `devUrl` is being fetched and its response status.
    *   When no chunk URL is found in the HTML.
    *   The specific `chunkUrl` being checked and its response status.
    *   Confirmation when the chunk URL is successfully loaded.

3.  **Reduced `readyDelayMs`**: The `readyDelayMs` (extra delay after the first 200 response from the dev server) has been reduced from `8000ms` to `2000ms`. This change aims to provide faster feedback during development if the Next.js server isn't compiling assets as quickly as expected, while still allowing a reasonable buffer for initial compilation.

## Status

Accepted

## Consequences

*   **Improved Diagnostic Capabilities**: The enhanced logging in `waitForChunk` will provide much clearer insights into the Next.js development server's readiness and whether frontend assets are being served correctly. This will significantly aid in debugging future asset loading issues.
*   **Increased Robustness**: The more generic `findChunkUrl` will make the `wait-dev-server.mjs` script less brittle to future updates in Next.js that might alter asset paths.
*   **Faster Feedback Loop**: Reducing `readyDelayMs` will allow developers to identify and address issues related to Next.js compilation or server startup more quickly during the development cycle.
*   **Potential for Faster Startup**: In cases where Next.js compiles quickly, the reduced delay might lead to a slightly faster initial application window opening in Tauri development mode.

## References

*   `script/wait-dev-server.mjs`
*   `src-tauri/tauri.conf.json`
*   `package.json`
