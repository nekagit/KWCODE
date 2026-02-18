# ADR 0300: Dashboard — Print button

## Status

Accepted.

## Context

The app supports printing the current page via the global shortcut ⌘P / Ctrl+P (app-shell) and via the command palette ("Print current page"). The Dashboard Overview section has an "Export metrics" toolbar with Copy/Download as JSON, CSV, and Markdown but no visible **Print** action. Users who prefer UI over keyboard had no one-click way to print the dashboard from the page.

## Decision

Add a **Print** button to the Dashboard Overview "Export metrics" toolbar in `DashboardOverview.tsx`:

- Placed at the start of the toolbar row (before "Copy as JSON") so Print is visible as a primary action.
- On click: `window.print()` (same as the command palette and ⌘P).
- Uses Printer icon from Lucide; variant outline, size sm to match other toolbar buttons.
- `aria-label="Print current page"`, `title="Print dashboard (⌘P)"` for accessibility and discoverability of the shortcut.

No new lib or backend; reuses the browser print API.

## Consequences

- Users can print the dashboard from the Dashboard page without opening the command palette or using ⌘P.
- Behavior is consistent with the existing "Print current page" palette action and global shortcut.
- Minimal change: one button and Printer icon import in `DashboardOverview.tsx`.
