# ADR 0306 — Technologies page: Print button

## Status

Accepted.

## Context

The app supports printing the current page via the keyboard shortcut (⌘P / Ctrl+P) and via the command palette ("Print current page"). The Dashboard (ADR 0300) and Documentation page (ADR 0305) have an inline **Print** button in their toolbars. The Technologies page has a toolbar with Copy path, Open folder, and Refresh but no visible Print action. Users who prefer clicking over keyboard shortcuts had no one-click way to print the Technologies page from the UI.

## Decision

Add a **Print** button to the Technologies page toolbar:

- Place it at the start of the button row (before "Copy path") so Print is visible as a primary action.
- Use outline, size sm, Printer icon from lucide-react.
- On click: call `window.print()` to open the browser's print dialog.
- Use `aria-label="Print current page"` and `title="Print technologies page (⌘P)"` for accessibility and shortcut discoverability.
- No new library; same pattern as the Dashboard and Documentation Print buttons.

## Consequences

- Users can print the Technologies page with one click from the page itself, without opening the command palette or using ⌘P.
- Parity with the Dashboard and Documentation Print buttons and consistent with other page-level print behaviour across the app.
