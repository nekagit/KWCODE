# ADR 075: Fix invalid React component (lucide TicketIcon import)

## Status
Accepted

## Context
Console error: "React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: undefined."

This occurs when a component used in JSX is `undefined`, commonly due to:
- Missing or incorrect export from a module
- Wrong named import (e.g. importing a name that does not exist)

## Decision
In `src/components/tickets-data-table.tsx`, the icon was imported as:
```ts
import { TicketIcon } from "lucide-react";
```
`lucide-react` does not export `TicketIcon`; it exports `Ticket`. The import resolved to `undefined`, and using `<TicketIcon />` in the Empty component’s `icon` prop caused the React error.

**Fix:** Use the correct export with an alias:
```ts
import { ..., Ticket as TicketIcon } from "lucide-react";
```
and remove the separate `import { TicketIcon } from "lucide-react";` line.

## Consequences
- The Tickets tab and any usage of `TicketsDataTable` (e.g. empty state with ticket icon) render correctly.
- Aligns with the rest of the codebase (e.g. `page.tsx`, `projects/page.tsx`) which use `Ticket as TicketIcon` from lucide-react.
