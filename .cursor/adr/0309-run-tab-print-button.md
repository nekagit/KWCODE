# ADR 0309 — Run tab: Print button

## Status

Accepted.

## Context

The app supports printing the current page via the keyboard shortcut (⌘P / Ctrl+P) and via the command palette ("Print current page"). The Dashboard, Documentation, Technologies, Configuration, Projects list, Ideas, and Prompts pages have an inline **Print** button. The Run tab (project Worker tab) has a History toolbar with Copy last run, Download, Remove last run, Copy summary, stats JSON/CSV, Copy all, and related actions, but no visible Print action. Users who prefer clicking over keyboard shortcuts had no one-click way to print the run history view from the Run tab UI.

## Decision

Add a **Print** button to the Run tab History toolbar:

- Place it at the start of the toolbar (before "Copy last run") so Print is visible as the first action.
- Use variant ghost, size sm, Printer icon from lucide-react to match the other History toolbar buttons.
- On click: call `window.print()` to open the browser's print dialog.
- Use `aria-label="Print current page"` and `title="Print run tab (⌘P)"` for accessibility and shortcut discoverability.
- No new library; same pattern as the Dashboard and other page Print buttons.

## Consequences

- Users can print the run tab (run history view) with one click from the Run tab itself, without opening the command palette or using ⌘P.
- Parity with the other content pages' Print buttons and consistent with print behaviour across the app.
