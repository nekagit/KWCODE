# ADR 084: Standard format for .cursor/tickets.md and display on project details

## Status

Accepted.

## Context

Work items (tickets) are tracked in `.cursor/tickets.md`. We wanted:
- A single, consistent format for this file so it stays readable and parseable.
- The file to be shown on the project details page when it exists, so users see the same work items in the Todos tab.

## Decision

1. **Standard format**  
   - Define the canonical structure in `.cursor/tickets-format.md`.  
   - Required sections: title (H1), metadata (Project, Source, Last updated), Summary (Done vs missing with tables), Prioritized work items (P0–P3 tables), Next steps.  
   - Keep `.cursor/tickets.md` aligned with this format; reference the format doc at the top of `tickets.md`.

2. **Display on project details**  
   - In the project details page, **Todos** tab → **Tickets** accordion card, always show a “Work items (.cursor/tickets.md)” block:  
     - If the file exists in the project repo: load and render its contents as markdown (read-only) in a scrollable area.  
     - If the file is missing or unreadable: show a short message (“No .cursor/tickets.md in this repo” or the error).  
   - Loading: show a loading state until the file is fetched or 404/error is determined.

3. **Loading the file**  
   - **Tauri:** Use `read_file_text_under_root` with the project’s `repoPath` and path `.cursor/tickets.md`.  
   - **Browser:** New API `GET /api/data/projects/[id]/file?path=.cursor/tickets.md` that resolves the path under the project’s `repoPath`, with a safety check that the repo is under the app’s `cwd`, then returns the file content as markdown or 404/4xx.

## Consequences

- `.cursor/tickets.md` has a single, documented format and is always shown in the Todos → Tickets card when present.  
- New API route and project-detail state/effects; format doc and ADR document the convention for future updates.
