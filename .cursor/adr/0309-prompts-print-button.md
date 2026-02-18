# ADR 0309 — Prompts page: Print button

## Status

Accepted.

## Context

The app supports printing the current page via the keyboard shortcut (⌘P / Ctrl+P) and via the command palette ("Print current page"). The Dashboard (ADR 0300), Documentation (0305), Technologies (0306), Projects list (0307), Configuration (0307), and Ideas (0308) pages have an inline **Print** button in their toolbars. The Prompts page (Prompt records) has a Card header with action buttons (Create, Edit, Generate) and Refresh but no visible Print action. Users who prefer clicking over keyboard shortcuts had no one-click way to print the Prompts page from the UI.

## Decision

Add a **Print** button to the Prompts page Card header row:

- Place it in the same row as PromptRecordActionButtons and Refresh (the `flex items-center gap-2` div), before the Refresh button.
- Use outline, size sm, Printer icon from lucide-react.
- On click: call `window.print()` to open the browser's print dialog.
- Use `aria-label="Print current page"` and `title="Print prompts page (⌘P)"` for accessibility and shortcut discoverability.
- No new library; same pattern as the other content-page Print buttons.

## Consequences

- Users can print the Prompts page with one click from the page itself, without opening the command palette or using ⌘P.
- Parity with the Dashboard, Documentation, Technologies, Projects list, Configuration, and Ideas Print buttons and consistent with other page-level print behaviour across the app.
