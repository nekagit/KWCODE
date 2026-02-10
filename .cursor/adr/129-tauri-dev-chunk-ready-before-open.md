# ADR 129: Tauri dev – wait for chunks before opening window

## Status

Accepted.

## Context

When running `tauri dev`, the app sometimes stayed on a loading screen with no data. The terminal showed: "Warning: could not confirm chunk availability; Tauri may open with 404s."

- The `beforeDevCommand` (wait-dev-server.mjs) waited for the root URL to return 200 and an extra delay, then optionally checked that a Next.js chunk URL returned 200.
- If the chunk check failed (e.g. Next not compiled yet, or regex didn’t match the emitted script tags), the script still exited 0, so Tauri opened the window. The webview then requested JS chunks that weren’t ready → 404s → app never hydrates → loading forever and no data.

## Decision

- **Block Tauri until chunks are ready**: In `script/wait-dev-server.mjs`:
  - Increase post-200 delay from 5s to **8s** so Next has more time to compile.
  - Broaden chunk URL detection: match any script `src` containing `_next/static` or `_next/` (covers static and webpack dev).
  - If chunk check still fails after the wait window (**90s** max), **exit 1** instead of 0 so `beforeDevCommand` fails and Tauri does not open. User sees a clear error and can run `npm run dev` first, then `tauri dev` again.
- **Consequences**: First `tauri dev` run may take longer (up to ~8s + chunk wait). If the chunk check times out, the process exits with 1 and the window does not open; retrying after the dev server is warm usually succeeds.

## Consequences

- Avoids opening the Tauri window when the app would 404 on chunks and stay stuck loading.
- Slightly longer initial wait; chunk confirmation is more reliable with the broader regex and longer delay.
- On failure, user runs `npm run dev`, waits for compile, then runs `tauri dev` again.
