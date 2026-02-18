# ADR 0294: Command palette — Copy app version

## Status

Accepted.

## Context

The Loading screen and Configuration page offer a "Copy version" button that copies the app version string (e.g. "v0.1.0") to the clipboard. The command palette already has "Copy app info" (full block), "Copy app info as Markdown", and "Copy app info as JSON", but no action that copies only the version string. Keyboard-first users had to open Configuration or Loading to copy the version for bug reports or support.

## Decision

Add a **Copy app version** action to the command palette (⌘K):

- New lib `src/lib/copy-app-version.ts`: `copyAppVersionToClipboard()` — resolves version via `getAppVersion()`, formats as `v${version}`, copies via `copyTextToClipboard`, returns `Promise<boolean>`. No toast inside the lib; the Command palette shows success/error toast and closes.
- Command palette: one new action "Copy app version" (Copy icon), placed next to other app-info actions. Handler calls the lib, toasts, then closes the palette.
- One entry in `src/data/keyboard-shortcuts.ts` (Command palette group).

## Consequences

- Users can copy the app version from ⌘K without opening Configuration or Loading.
- Single new module; reuses `getAppVersion` and `copyTextToClipboard`.
- Loading and Configuration keep their existing "Copy version" buttons; no change required there.
