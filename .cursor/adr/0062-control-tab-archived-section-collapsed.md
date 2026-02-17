# ADR 0062: Control tab — accepted tickets in collapsed Archived section

## Status
Accepted (2025-02-17)

## Context
In the Control tab, completed implementation log entries could be Accepted or Declined. All entries were shown in one list; accepted entries stayed inline with a badge.

## Decision
- When a user accepts a ticket, it is moved conceptually to an **Archived** section below the main list.
- **Main list**: shows only pending and declined entries (with Accept/Decline buttons for pending).
- **Archived**: a separate section below, implemented as a single accordion item "Archived (N accepted)", containing all accepted entries. The accordion has no `defaultValue`, so it is **collapsed by default**.
- Copy updated to: "Accept moves an entry to Archived below."
- When there are no pending entries, show a short line: "No pending entries. Accepted entries are in Archived below."

## Consequences
- Accepted tickets are grouped in Archived and do not clutter the main list.
- Archived is collapsed by default so the tab stays focused on pending work; users can expand to review accepted entries.
