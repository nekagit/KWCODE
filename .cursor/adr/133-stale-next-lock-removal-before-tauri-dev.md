# 133. Stale Next.js Dev Lock Removal Before Tauri Dev

## Status

Accepted

## Context

When running `npm run tauri dev`, the Tauri window sometimes showed a white screen. The terminal showed:

```
⨯ Unable to acquire lock at .next/dev/lock, is another instance of next dev running?
```

The flow is: Tauri runs `beforeDevCommand` (`npm run dev:tauri` → `script/wait-dev-server.mjs`). The script checks if the dev server is already up on port 4000; if not, it spawns `npm run dev`. A **stale** `.next/dev/lock` file from a previous run (e.g. killed without cleanup) caused the newly spawned Next process to fail to acquire the lock and exit. No dev server was then listening, so when the Tauri window opened and loaded `http://127.0.0.1:4000/`, it got no response or errors → white screen.

## Decision

1. **Remove stale lock only when spawning**: In `script/wait-dev-server.mjs`, when the script is about to spawn the dev server (`!alreadyUp`), remove `.next/dev/lock` if it exists before calling `spawn("npm", ["run", "dev"], ...)`. Do not remove the lock when reusing an existing server (`alreadyUp`), so we do not disturb a running instance.
2. **Short delay after spawn**: After spawning the dev process, wait 3 seconds before starting to poll for readiness, so Next.js has time to start and acquire the lock.

## Consequences

- Stale lock from previous runs no longer blocks the spawned dev server; Tauri dev can start reliably after a previous crash or manual kill.
- Slightly longer wait when starting from cold (3s after spawn) before polling; overall behavior remains bounded by existing `waitReady` and `waitForChunk` timeouts.
- No change when a dev server is already running on the port (lock is not touched).

## References

- `script/wait-dev-server.mjs`
- ADR 012 (Tauri dev white screen fix)
- ADR 132 (Improve Next.js dev server readiness check for Tauri)
