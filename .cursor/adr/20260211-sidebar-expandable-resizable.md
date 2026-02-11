# 2026-02-11: Sidebar Expandable and Resizable

## Status

Accepted

## Context

The app shell sidebar was collapsible (expand/collapse via toggle) but used fixed widths (`w-[3.25rem]` when collapsed, `w-48` when expanded). Users had no way to adjust the expanded width to suit their preference or screen size, which is a common expectation in IDE-like and dashboard UIs.

## Decision

The sidebar was made both **expandable** (existing behavior kept) and **resizable**:

1. **Expandable**: The existing collapse/expand toggle (`SidebarToggle`) is unchanged. Collapsed width remains 52px (3.25rem); expanded width is now user-adjustable.

2. **Resizable**: When expanded, a thin drag handle is shown on the right edge of the sidebar. Users can drag to set width between 160px and 400px. The chosen width is persisted in `localStorage` under the key `kwcode-sidebar-width` so it survives reloads.

3. **Implementation** (in `src/components/app-shell.tsx`):
   - State: `sidebarWidth`, `isResizing`; refs for drag start position and last width (for reliable persist on mouseup).
   - Hydration: On mount, width is read from `localStorage` (clamped to min/max).
   - Resize: `mousedown` on handle starts resize; `mousemove`/`mouseup` on `window` update width and persist on release. Transition is disabled during drag; `select-none` and `cursor-col-resize` are applied to `document.body` while resizing.
   - The aside uses inline `style={{ width: currentWidth, transition: ... }}` so width is dynamic; collapsed state still forces 52px.

4. **Accessibility**: The resize handle has `role="separator"` and `aria-label="Resize sidebar"`.

## Consequences

*   **Better UX**: Users can tailor sidebar width to their workflow and display.
*   **Consistency**: Aligns with common patterns in IDEs and dashboards (e.g. VS Code, Linear).
*   **Persistence**: Width preference is retained across sessions via `localStorage`.
*   **No new dependencies**: Resize is implemented with React state and DOM events only.
*   **Minor risk**: If `localStorage` is unavailable or full, persistence is skipped (try/catch); the app still works with the default width.
