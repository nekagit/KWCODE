# ADR 150: TicketsTable Organism Consists of Molecules Only

## Status
Accepted

## Date
2026-02-11

## Context
The `TicketsTable` organism was rendering table structure (header, body, rows, empty state) directly using UI primitives (`Table`, `TableHeader`, `TableBody`, etc.) and TanStack Table logic. To align with the project’s atomic design and the “organisms consist of molecules only” rule, table rendering should live in molecules and the organism should only compose them.

## Decision
* **Introduce a reusable molecule** `DataTableLayout` in `src/components/molecules/Tables/DataTableLayout.tsx` that:
  * Accepts a TanStack `table` instance, `columns`, optional `emptyMessage`, and optional `className`.
  * Renders the full table (wrapper, header groups, body rows, and empty state) using `@/components/ui/table` and `flexRender`.
* **Refactor `TicketsTable`** in `src/components/organisms/TicketsTable.tsx` so that it:
  * Imports only the `DataTableLayout` molecule and type imports from `@tanstack/react-table`.
  * Renders a single molecule: `<DataTableLayout table={table} columns={columns} emptyMessage="No tickets match the current filter." />`.
  * No longer uses UI table primitives or `flexRender` directly.

## Consequences
* **Positive:** Organisms stay at the “molecules only” level; table layout and TanStack wiring are reusable for other data tables via `DataTableLayout`.
* **Positive:** Clear separation: molecule = table structure + behavior, organism = tickets-specific composition and copy.
* **Neutral:** One additional file (`DataTableLayout.tsx`); type surface remains minimal (`ColumnDef<TData, unknown>[]`).
