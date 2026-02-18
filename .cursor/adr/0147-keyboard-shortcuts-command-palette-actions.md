# ADR 0147: Keyboard shortcuts help — Document command palette actions

## Status

Accepted.

## Context

The Keyboard shortcuts help dialog (Shift+?) lists global shortcuts such as "Open command palette" (⌘K), "Go to Dashboard", "Refresh data", and others. It did not list what users can do **from** the command palette after opening it. Actions like "Clear run history", "Go to Run", "Copy app info", and "Open data folder" were only discoverable by opening the palette (⌘K) and browsing. Users looking for a single place to see all quick actions could not find palette-only actions in the help.

## Decision

- **Keyboard shortcuts data**: Add a new shortcut group in `src/data/keyboard-shortcuts.ts` with title "Command palette (⌘K / Ctrl+K)". List the main actions available from the palette: Refresh data, Go to Run, Clear run history, Keyboard shortcuts, Copy app info, Open data folder, Open documentation folder, Print current page, Scroll to top, Focus main content. Each row uses keys "⌘K / Ctrl+K" and the action name as the description, so the table reads "press ⌘K then select &lt;action&gt;".
- The group is placed after "Help" so it sits next to "Open command palette". Browser-only actions (e.g. "Check API health") are not listed so the help stays consistent across Tauri and browser.

## Consequences

- The Shortcuts help dialog is the single place to discover all quick actions, including those only available via the command palette.
- Users can see at a glance that "Clear run history", "Open data folder", and similar actions are available from ⌘K without having to open the palette first.
- Export/copy of keyboard shortcuts (Markdown, JSON) now includes the command palette actions list for documentation and onboarding.
