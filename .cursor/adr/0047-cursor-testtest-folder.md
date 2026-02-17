# ADR 0047: Add `.cursor/testtest` folder (Ticket #2)

## Status

Accepted.

## Context

Ticket #2 requested creating a new folder under the Cursor workspace configuration directory: a folder named `testtest` inside `.cursor` (ticket text referred to ".cursro", interpreted as ".cursor" per project conventions). This supports organizing project-specific Cursor artifacts and follows the practice of keeping structured subfolders under `.cursor/` for agents, ADRs, documentation, planner, and setup.

## Decision

1. **Create directory**  
   Add `.cursor/testtest/` as a new top-level folder under `.cursor/`.

2. **Version control**  
   Add a `.gitkeep` file inside `.cursor/testtest/` so the empty directory is tracked by Git.

3. **No code or config changes**  
   No application code, Tauri commands, API routes, or frontend components are required. No changes to existing `.cursor` layout or agent instructions.

## Consequences

- The folder exists for future use (e.g. test fixtures, temporary agent output, or project-specific experiments) without affecting existing behavior.
- Aligns with best practice for AI-assisted projects: document structural changes in ADR form and keep `.cursor/` layout explicit and versioned.

## References

- Ticket #2: Create a new folder in .cursor called testtest
- ADR 0004: KWCode restructuring — .cursor_inti and .cursor (folder layout under `.cursor/`)
