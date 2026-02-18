# ADR 0156: Global keyboard shortcut and Command palette action for Scroll main content to bottom (⌘ End / Ctrl+End)

## Status

Accepted.

## Context

The app already had "Scroll to top" via ⌘ Home / Ctrl+Home in app-shell and a "Scroll to top" action in the Command palette. There was no symmetric way to jump to the bottom of the main content (e.g. long Run history or Documentation page) without manually scrolling. Keyboard users and users of the Command palette benefit from a "Scroll to bottom" option.

## Decision

- **app-shell.tsx**: Global keydown listener for Scroll main content to bottom. When ⌘ End (Mac) or Ctrl+End (Windows/Linux) is pressed, prevent default and set `#main-content` scroll position to bottom (`scrollTop = scrollHeight - clientHeight`). Do not trigger when focus is in INPUT, TEXTAREA, or SELECT.
- **keyboard-shortcuts.ts**: Add to the Navigation group one row: keys "⌘ End / Ctrl+End", description "Scroll main content to bottom".
- **CommandPalette.tsx**: Add a "Scroll to bottom" action (icon ChevronDown) that scrolls `#main-content` to bottom and closes the palette, so users can invoke it via ⌘K without memorising the global shortcut.

## Consequences

- Users can jump to the bottom of the main content from anywhere via ⌘ End (Mac) or Ctrl+End (Windows/Linux).
- Users can also open the Command palette (⌘K) and choose "Scroll to bottom" for the same behaviour.
- The Keyboard shortcuts help (Shift+?) documents the global shortcut in the Navigation group; the Command palette section lists "Scroll to bottom" as an available action.
