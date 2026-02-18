# ADR 0280 — Sidebar Shortcuts nav item

## Status

Accepted.

## Context

- The app has a dedicated `/shortcuts` redirect (ADR 0276) that redirects to `/?openShortcuts=1`, opening the keyboard shortcuts help modal.
- The Dashboard has a Shortcuts quick link (ADR 0269) that opens the same modal via `openShortcutsModal()`.
- The command palette offers "Keyboard shortcuts" (⌘K) and the global shortcut Shift+? opens the shortcuts help.
- The sidebar includes Run, Testing (ADR 0268), and Database (ADR 0271) but has no direct link to Shortcuts; users had to use the Dashboard button, command palette, or Shift+?.

## Decision

- Add **Shortcuts** to the sidebar in the **System** section (bottom nav).
- **Shortcuts:** `href="/shortcuts"`, label "Shortcuts", icon `Keyboard` (consistent with Dashboard and shortcuts help).
- Place after Configuration and before Loading so System section order is: Configuration, Shortcuts, Loading.
- No new routes; reuse existing `/shortcuts` redirect page.

## Consequences

- Users can open the keyboard shortcuts help from the sidebar with one click, consistent with Configuration and Loading.
- Sidebar navigation aligns with Dashboard and command palette for Shortcuts access.
- Active state for the Shortcuts item works when pathname is `/shortcuts` (during the brief redirect).
