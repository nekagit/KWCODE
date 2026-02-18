# ADR 0297 — Loading screen: Copy repository URL

## Status

Accepted.

## Context

The Loading screen shows app version (with a "Copy version" button) and, when `NEXT_PUBLIC_APP_REPOSITORY_URL` is set, a "View source" link that opens the app repository in the browser. Users had no way to copy the repository URL to the clipboard from the Loading screen; the Configuration page already has a "Copy repository URL" button (ADR 0295). Adding the same action on the Loading screen gives parity so users on the Loading page can paste the repo URL without opening the link.

## Decision

Add a **Copy repository URL** button on the Loading screen when the app repository URL is set:

- Place it next to the existing "View source" link in the footer.
- Use a ghost/sm button with Copy icon, label "Copy repository URL", `aria-label="Copy repository URL to clipboard"`, `title="Copy repository URL"`.
- Reuse the same footer styling as the existing "Copy version" button (white/60, hover, border).
- On click: call `copyTextToClipboard(repoUrl)` and show a success toast ("Repository URL copied to clipboard").
- Reuse existing `copyTextToClipboard` and `toast`; no new lib required.

## Consequences

- Users can copy the app repository URL from the Loading screen for pasting into docs, issues, or chat without opening the link.
- Parity with the Configuration page "Copy repository URL" and with the "Copy version" action on the same Loading screen.
