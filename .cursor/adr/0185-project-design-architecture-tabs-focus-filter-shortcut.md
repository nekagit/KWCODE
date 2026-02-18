# ADR 0185: Project Design and Architecture tabs — Focus filter with "/"

## Status

Accepted.

## Context

The project detail Design tab and Architecture tab each have a filter input ("Filter designs by name…", "Filter architectures by name…") with persisted filter/sort preferences (ADR 0135). Users had to click into the field before typing. The Projects, Prompts, Ideas, Technologies, Run tab, Shortcuts dialog, and Dashboard pages already use "/" to focus their filter (ADRs 0180, 0174, 0177, 0182, 0183, 0184, and the Dashboard tab). Adding the same pattern when the user is on a project's Design tab (`/projects/[id]?tab=design`) or Architecture tab (`?tab=architecture`) completes the behavior and speeds up filtering.

## Decision

- **New hooks**:
  - `useProjectDesignFocusFilterShortcut(inputRef)` in `src/lib/project-design-focus-filter-shortcut.ts`. Listens for keydown "/" when pathname matches `/projects/[id]` and `tab=design`; if the active element is not an input, textarea, or select, focuses the ref and prevents default.
  - `useProjectArchitectureFocusFilterShortcut(inputRef)` in `src/lib/project-architecture-focus-filter-shortcut.ts`. Same behavior for `tab=architecture`.
- **ProjectDesignTab**: Add a ref for the filter Input, call `useProjectDesignFocusFilterShortcut(filterInputRef)`, and attach the ref to that Input.
- **ProjectArchitectureTab**: Add a ref for the filter Input, call `useProjectArchitectureFocusFilterShortcut(filterInputRef)`, and attach the ref to that Input.
- **keyboard-shortcuts.ts**: Add two shortcut entries under Help: "/ (Design tab)" and "/ (Architecture tab)", description "Focus filter".
- No new Tauri commands or API routes.

## Consequences

- When viewing a project's Design or Architecture tab, users can press "/" to focus the filter input and type immediately.
- If the user is already typing in an input/textarea/select, "/" is not intercepted.
- The shortcuts are documented in the Keyboard shortcuts help dialog.
- Run `npm run verify` to confirm tests, build, and lint pass.
