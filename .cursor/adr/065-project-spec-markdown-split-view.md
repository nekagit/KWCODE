# ADR 065: Project spec – markdown view split next to card

## Status

Accepted.

## Context

On the project details page, the Project Spec accordion lists files (from the project’s `.cursor` folder or exported from Design/Architecture). Users wanted to open a file and see its content as rendered markdown without leaving the page. A modal would overlay the page; a split view keeps the spec list and the preview side-by-side for better context.

## Decision

- **Click to preview**: Clicking a file row in the Project Spec list opens a markdown preview. The row is focusable and keyboard-activable (Enter).
- **Split layout**: When a file is selected, the Project Spec accordion content uses a two-column grid (one column on small screens, two on `md+`). The left column is the existing file list and description; the right column is a preview panel.
- **Preview panel**: Shows the file name in a header, a close (X) button, and a scrollable area with markdown rendered via `ReactMarkdown` and `remarkGfm`, reusing the same `markdown-viewer` styling as on the Design page. Loading and error states are shown in the panel.
- **Content source**: Use stored `content` on the spec file when present (e.g. exported design/architecture). Otherwise load from disk: Tauri `read_file_text(path)` or, in browser, `GET /api/data/file?path=...` (path under app root). Clear preview on close.
- **Remove button**: The remove-from-spec button on each row uses `stopPropagation` so it does not trigger the row click (open preview).

## Consequences

- Users can read spec file content as markdown in place, next to the list.
- Same UX as Design page for markdown rendering (headings, lists, tables, code).
- In Tauri, any file path from the project’s `.cursor` folder can be read; in browser, only paths under the app root are supported by the file API.
