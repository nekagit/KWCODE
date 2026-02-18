# ADR 0191 — Rebuild and put on desktop

## Status

Accepted.

## Context

Ticket #5 (Fast development) requested a single workflow: **rebuild** the KWCode Tauri app and **put the built app on the desktop** so users can run the latest build from a fixed location (e.g. `~/Desktop/KWCODE`).

## Decision

- Use the existing **`build:desktop`** npm script as the single entry point:
  - **Rebuild:** `npm run tauri:build` (Next.js build via `script/build-for-tauri.mjs`, then Tauri bundle with `--bundles app`).
  - **Put on desktop:** `node script/copy-build-to-desktop.mjs` copies the contents of `src-tauri/target/release/bundle/` (e.g. `macos/KWCode.app`) into **`~/Desktop/KWCODE/`**.
- No new Tauri commands or frontend changes; this is a **CLI/build-time** workflow only.
- Destination is `~/Desktop/KWCODE` so the desktop folder stays predictable and can hold the `.app` (macOS) or other bundle artifacts.

## Consequences

- Users run **`npm run build:desktop`** once to get a fresh build on the desktop.
- If the bundle is missing (e.g. first run or build failed), `copy-build-to-desktop.mjs` exits with a clear error and instructs to run `npm run tauri:build`.
- Desktop path is macOS/Linux `$HOME/Desktop/KWCODE`; Windows would require a separate path (e.g. `%USERPROFILE%\Desktop\KWCODE`) if needed later.
