# ADR 0295 — Configuration page: Copy repository URL

## Status

Accepted.

## Context

The Configuration page shows app version (with a "Copy version" button) and, when `NEXT_PUBLIC_APP_REPOSITORY_URL` is set, a "View source" button that opens the app repository in the browser. Users had no way to copy the repository URL to the clipboard from the Configuration page; they had to open the link and copy from the address bar or use external tools.

## Decision

Add a **Copy repository URL** button on the Configuration page when the app repository URL is set:

- Place it next to the existing "View source" button in the version/source row.
- Use a ghost/sm button with Copy icon, label "Copy repository URL", `aria-label="Copy repository URL to clipboard"`, `title="Copy repository URL"`.
- On click: call `copyTextToClipboard(repoUrl)` and show a success toast ("Repository URL copied to clipboard").
- Reuse existing `copyTextToClipboard` and `toast` from the same page; no new lib required.

## Consequences

- Users can copy the app repository URL from the Configuration page for pasting into docs, issues, or chat without opening the link.
- Parity with the "Copy version" action on the same page and consistent with other copy-to-clipboard actions in the app.
