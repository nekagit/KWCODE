# Prompt: Bug fix

Use when fixing a bug described in a ticket.

## Context

- Bug: (paste title, steps to reproduce, expected vs actual).
- Relevant area: frontend / backend / both (and which files if known).

## Instructions

1. Reproduce the bug locally.
2. Identify root cause; make minimal fix.
3. Add a regression test or note if appropriate.
4. Verify no regression in related flows.
5. Mark ticket done in `.cursor/7. planner/tickets.md`.

## Output

- Patch, test (if added), and brief note on cause.
