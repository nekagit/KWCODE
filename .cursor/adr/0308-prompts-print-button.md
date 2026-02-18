# ADR 0308 — Prompts page: Print button

## Status

Accepted.

## Context

The app supports printing the current page via the keyboard shortcut (⌘P / Ctrl+P) and via the command palette ("Print current page"). The Dashboard (ADR 0300), Documentation (ADR 0305), Technologies (ADR 0306), Configuration (ADR 0307), Projects list (ADR 0307), and Ideas page have an inline **Print** button. The Prompts page has a Card header with action buttons (Create, Edit, Generate) and Refresh but no visible Print action. Users who prefer clicking over keyboard shortcuts had no one-click way to print the Prompts page from the UI.

## Decision

Add a **Print** button to the Prompts page CardHeader action row:

- Place it after the PromptRecordActionButtons and before the Refresh button so Print is visible as a primary action.
- Use outline, size sm, Printer icon from lucide-react.
- On click: call `window.print()` to open the browser's print dialog.
- Use `aria-label="Print current page"` and `title="Print prompts page (⌘P)"` for accessibility and shortcut discoverability.
- No new library; same pattern as the Dashboard and other page Print buttons.

## Consequences

- Users can print the Prompts page with one click from the page itself, without opening the command palette or using ⌘P.
- Parity with the other content pages' Print buttons and consistent with print behaviour across the app.
