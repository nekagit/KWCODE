# ADR 0307 — Projects list page: Print button

## Status

Accepted.

## Context

The app supports printing the current page via the keyboard shortcut (⌘P / Ctrl+P) and via the command palette ("Print current page"). The Dashboard (ADR 0300), Documentation page (ADR 0305), and Technologies page (ADR 0306) have an inline **Print** button in their toolbars. The Projects list page has a toolbar with filter, sort, Export (JSON, CSV, Markdown, Copy), and Restore defaults but no visible Print action. Users who prefer clicking over keyboard shortcuts had no one-click way to print the projects list from the UI.

## Decision

Add a **Print** button to the Projects list page toolbar:

- Place it at the start of the toolbar row (before the filter input) so Print is visible as a primary action.
- Use outline, size sm, Printer icon from lucide-react.
- On click: call `window.print()` to open the browser's print dialog.
- Use `aria-label="Print current page"` and `title="Print projects list (⌘P)"` for accessibility and shortcut discoverability.
- No new library; same pattern as the Dashboard, Documentation, and Technologies Print buttons.

## Consequences

- Users can print the Projects list page with one click from the page itself, without opening the command palette or using ⌘P.
- Parity with the Dashboard, Documentation, and Technologies Print buttons and consistent with other page-level print behaviour across the app.
