# ADR: Tickets section styled like Features section

## Date
2026-02-11

## Status
Accepted

## Context
The Tickets section (below the Kanban board) showed a plain two-column list (In progress / Done) with no card container, while the Features section uses a dashed-border card and a consistent empty state. Users wanted the Tickets section to look like the Features section.

## Decision
- **Empty state:** When there are no tickets (`kanbanData.tickets.length === 0`), render the shared **EmptyState** component with ticket icon, title "No tickets yet", description about adding tickets / editing repo files, and an "Add ticket" button that opens the existing add-ticket dialog. This matches the Features section’s empty state (dashed card, centered content, primary action).
- **With tickets:** When there are tickets, wrap the existing two-column layout (In progress | Done) in a **dashed-border card** using the same visual style as EmptyState (rounded-2xl, border-dashed, same gradient background, padding). New class in `tailwind-molecules.json` for `ProjectTicketsTab.tsx`: **classes[62]** = `rounded-2xl border border-dashed border-gray-300/60 dark:border-gray-700/60 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800/50 backdrop-blur-sm p-6`.
- **Section structure:** Keep the "Tickets" heading with icon above; only the content block (empty state or two columns) changes so it always sits in a card consistent with the Features section.

## Consequences
- Visual consistency between Tickets and Features: same dashed card and empty-state pattern.
- Clear empty state with one primary action (Add ticket) when there are no tickets.
