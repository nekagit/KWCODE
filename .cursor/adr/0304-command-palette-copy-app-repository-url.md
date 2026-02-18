# ADR 0304 — Command palette: Copy app repository URL

## Status

Accepted.

## Context

The Configuration page and Loading screen both show a "Copy repository URL" button when `NEXT_PUBLIC_APP_REPOSITORY_URL` is set (ADR 0295, 0297). The command palette already had "View source" (opens the app repository in the browser) when that URL is set, but no way to copy the URL from the palette. Users had to open Configuration or Loading screen to copy the app repository URL.

## Decision

Add a **Copy repository URL** action to the command palette when the app repository URL is set:

- In the same block where "View source" is added (when `getAppRepositoryUrl()` returns a URL), add an entry **"Copy repository URL"** with Copy icon, before "View source".
- On select: call `copyTextToClipboard(repoUrl)`, show success toast ("Repository URL copied to clipboard") or error toast, then close the palette.
- Reuse existing `copyTextToClipboard` from `@/lib/copy-to-clipboard` and toast; no new lib.

## Consequences

- Users can copy the app repository URL from anywhere via the command palette (⌘K / Ctrl+K) without opening the Configuration or Loading screen.
- Parity with Configuration and Loading screen copy actions and consistent with other copy-to-clipboard entries in the palette.
