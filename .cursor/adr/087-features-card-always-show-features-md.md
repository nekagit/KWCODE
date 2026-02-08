# ADR 087: Features card always shows .cursor/features.md

## Status

Accepted.

## Context

The project details page has a **Features** card (Todos tab) that showed linked features and spec files, but did not always display the contents of `.cursor/features.md`. Users need to see the features roadmap file in that card whenever it exists, similar to how the Tickets card always shows `.cursor/tickets.md`.

## Decision

1. **Always show .cursor/features.md in the Features card**  
   - In the project details page, **Todos** tab → **Features** accordion card, add a dedicated block at the top: “.cursor/features.md — features roadmap (always shown)”.  
   - If the file exists in the project repo: load and render its contents as markdown (read-only) in a scrollable area (same UX as the Tickets card).  
   - If the file is missing or unreadable: show “No .cursor/features.md in this repo” or the error message.

2. **Loading**  
   - Reuse the same mechanism as for tickets:  
     - **Tauri:** `read_file_text_under_root` with the project’s `repoPath` and path `.cursor/features.md`.  
     - **Browser:** `GET /api/data/projects/[id]/file?path=.cursor/features.md`.  
   - Add state: `cursorFeaturesMd`, `cursorFeaturesMdLoading`, `cursorFeaturesMdError`, and a `loadCursorFeaturesMd` callback that runs when the project is loaded.

3. **Placement**  
   - The features.md block is the first content inside the Features accordion (above the “Spec files” drag area and the linked features list) so it is always visible when the section is expanded.

## Consequences

- `.cursor/features.md` is always visible in the Features card when present, matching the Tickets card behavior.  
- No new API route; the existing project file API is used with `path=.cursor/features.md`.
