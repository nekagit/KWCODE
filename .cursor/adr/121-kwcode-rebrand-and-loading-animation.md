# ADR 121: KWCode rebrand and fancy loading animation

## Status

Accepted.

## Context

The app was previously named "Run Prompts Control" and showed a plain "Loading Run Prompts Control…" message with a basic spinner during initial load (Tauri load page and React root overlay). The user wanted to rebrand to **KWCode** and replace the loading experience with a more polished, branded animation.

## Decision

- **Rebrand to KWCode** everywhere: metadata, sidebar title, Tauri product/window name, capabilities, and load screens.
- **Loading experience**:
  - **No** "Loading…" text; show only the **KWCode** wordmark.
  - **Fancy animation**: shimmer gradient on the logo text, animated progress bar, and bouncing dots (no generic spinner).
- Applied in:
  - `src/components/root-loading-overlay.tsx` – React overlay with KWCode + shimmer + progress bar + dots.
  - `src/app/layout.tsx` – metadata title/description, critical CSS keyframes for `kwcode-shimmer`, `kwcode-progress`, `kwcode-bounce`.
  - `public/tauri-load.html` – KWCode title and body, same style of animation (shimmer + bar + dots) in plain HTML/CSS for Tauri’s initial webview.
  - `src/components/app-shell.tsx` – sidebar heading "KWCode".
  - `src-tauri/tauri.conf.json` – `productName`, `identifier`, window `title` set to KWCode.
  - `src-tauri/capabilities/default.json` – window label "KWCode".

## Consequences

- First paint and Tauri load screen are clearly branded as KWCode with a consistent, non-generic loading animation.
- All user-facing references to "Run Prompts Control" are removed; internal script names (e.g. `run_prompts_all_projects.sh`) and Cargo crate name remain unchanged for compatibility.
