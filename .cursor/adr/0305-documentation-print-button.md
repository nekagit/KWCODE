# ADR 0305 — Documentation page: Print button

## Status

Accepted.

## Context

The app supports printing the current page via the keyboard shortcut (⌘P / Ctrl+P) and via the command palette ("Print current page"). The Dashboard has an inline **Print** button in its Export metrics toolbar (ADR 0300). The Documentation page has a toolbar with Open folder, Copy path, Download/Copy as Markdown/JSON and Refresh, but no visible Print action. Users who prefer clicking over keyboard shortcuts had no one-click way to print the Documentation page from the UI.

## Decision

Add a **Print** button to the Documentation page toolbar:

- Place it at the start of the button row (before "Open documentation folder") so Print is visible as a primary action.
- Use outline, size sm, Printer icon from lucide-react.
- On click: call `window.print()` to open the browser's print dialog.
- Use `aria-label="Print current page"` and `title="Print documentation page (⌘P)"` for accessibility and shortcut discoverability.
- No new library; same pattern as the Dashboard Print button.

## Consequences

- Users can print the Documentation page with one click from the page itself, without opening the command palette or using ⌘P.
- Parity with the Dashboard's Print button and consistent with other page-level print behaviour across the app.
