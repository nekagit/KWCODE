# ADR 0308 — Ideas page: Print button

## Status

Accepted.

## Context

The app supports printing the current page via the keyboard shortcut (⌘P / Ctrl+P) and via the command palette ("Print current page"). The Dashboard (ADR 0300), Documentation (0305), Technologies (0306), Projects list (0307), and Configuration pages have an inline **Print** button in their toolbars. The Ideas page has a toolbar with Export (JSON, CSV, Markdown, Copy), folder actions (Copy path, Open folder), and Refresh but no visible Print action. Users who prefer clicking over keyboard shortcuts had no one-click way to print the Ideas page from the UI.

## Decision

Add a **Print** button to the Ideas page toolbar:

- Place it at the start of the Export row (before the Export JSON button) so Print is visible as a primary action.
- Use outline, size sm, Printer icon from lucide-react.
- On click: call `window.print()` to open the browser's print dialog.
- Use `aria-label="Print current page"` and `title="Print ideas page (⌘P)"` for accessibility and shortcut discoverability.
- No new library; same pattern as the other content-page Print buttons.

## Consequences

- Users can print the Ideas page with one click from the page itself, without opening the command palette or using ⌘P.
- Parity with the Dashboard, Documentation, Technologies, Projects list, and Configuration Print buttons and consistent with other page-level print behaviour across the app.
