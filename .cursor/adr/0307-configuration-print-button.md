# ADR 0307 — Configuration page: Print button

## Status

Accepted.

## Context

The app supports printing the current page via the keyboard shortcut (⌘P / Ctrl+P) and via the command palette ("Print current page"). The Dashboard (ADR 0300), Documentation (ADR 0305), and Technologies (ADR 0306) pages each have an inline **Print** button. The Configuration page has a top row with only a "Refresh" button and no Print action. Users who prefer clicking over keyboard shortcuts had no one-click way to print the Configuration page (theme, data paths, version, API health) from the UI.

## Decision

Add a **Print** button to the Configuration page:

- Place it in the top toolbar row, before the "Refresh" button.
- Use outline, size sm, Printer icon from lucide-react.
- On click: call `window.print()` to open the browser's print dialog.
- Use `aria-label="Print current page"` and `title="Print configuration page (⌘P)"` for accessibility and shortcut discoverability.
- No new library; same pattern as the Dashboard, Documentation, and Technologies Print buttons.

## Consequences

- Users can print the Configuration page with one click from the page itself, without opening the command palette or using ⌘P.
- Parity with the Dashboard, Documentation, and Technologies Print buttons and consistent with other page-level print behaviour across the app.
