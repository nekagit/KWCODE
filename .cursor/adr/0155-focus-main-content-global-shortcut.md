# ADR 0155: Global keyboard shortcut for Focus main content (⌘⇧F / Ctrl+Alt+F)

## Status

Accepted.

## Context

The Keyboard shortcuts help dialog lists "Focus main content" under the Command palette (⌘K / Ctrl+K) only; there was no dedicated global shortcut. Keyboard and screen-reader users can use the skip link ("Skip to main content") when tabbing from the top of the page, but there was no way to move focus back to the main content area from elsewhere (e.g. after using the sidebar or a dialog) without opening the Command palette and selecting the action.

## Decision

- **CommandPalette.tsx**: Add a global keydown listener for Focus main content, following the same pattern as other global shortcuts in that component (e.g. Go to Run, Refresh data). When ⌘⇧F (Mac) or Ctrl+Alt+F (Windows/Linux) is pressed, prevent default and call `document.getElementById("main-content")?.focus()`.
- **Guards**: Do not trigger when the Command palette is open or when focus is in an INPUT, TEXTAREA, or SELECT element.
- **keyboard-shortcuts.ts**: Add one row to the Help group: keys "⌘⇧F / Ctrl+Alt+F", description "Focus main content", so the shortcuts help dialog documents the new shortcut.

## Consequences

- Users can move focus to the main content area from anywhere by pressing ⌘⇧F (Mac) or Ctrl+Alt+F (Windows/Linux), without opening the Command palette.
- Keyboard accessibility is improved: focus can be returned to the main content after navigating the sidebar or other chrome.
- The Keyboard shortcuts dialog (Shift+?) and any export of shortcuts include the new shortcut. The Command palette "Focus main content" action remains available as an alternative.
