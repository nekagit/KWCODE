# ADR 0153: Global keyboard shortcut for Print (⌘P / Ctrl+P)

## Status

Accepted.

## Context

The Keyboard shortcuts help dialog documents "⌘P / Ctrl+P" for "Print current page". Previously, that shortcut was only available indirectly: the user had to open the Command palette (⌘K), then select "Print current page". There was no global keydown handler for ⌘P / Ctrl+P, so the documented shortcut did not work as a direct shortcut.

## Decision

- **app-shell.tsx**: Add a global keydown listener for Print, following the same pattern as the existing ⌘B (toggle sidebar) and ⌘ Home (scroll to top) handlers. When ⌘P (Mac) or Ctrl+P (Windows/Linux) is pressed, prevent default and call `window.print()`.
- **Input exclusion**: Do not trigger when focus is in an INPUT, TEXTAREA, or SELECT element, so that browser Find (Ctrl+P in some contexts) and in-field editing are not broken.
- **No new UI or API**: The Command palette "Print current page" action remains; the global shortcut is an additional way to trigger the same behaviour. Keyboard shortcuts help text already documents ⌘P / Ctrl+P; no change to `keyboard-shortcuts.ts` required.

## Consequences

- Users can print the current page from anywhere by pressing ⌘P (Mac) or Ctrl+P (Windows/Linux), without opening the Command palette.
- The documented shortcut in the Keyboard shortcuts dialog (Shift+?) now matches actual behaviour.
- When focus is in a text field or select, the shortcut does not fire, avoiding conflicts with native browser or form behaviour.
