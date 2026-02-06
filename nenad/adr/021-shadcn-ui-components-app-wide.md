# ADR 021: Shadcn UI components app-wide

## Status

Accepted.

## Context

The app already used several shadcn components (Button, Card, Input, Label, Checkbox, ScrollArea, Tabs, Accordion, Select, Dialog). To improve consistency, accessibility, and maintainability we wanted to adopt more shadcn components across the app and standardise on the shadcn design system.

## Decision

- **Use the shadcn MCP** to discover and add components from the `@shadcn` registry.
- **Add these shadcn components** (manually where CLI install failed due to npm ENOTEMPTY):
  - `badge` – status and counts (e.g. ticket board columns, running count).
  - `alert` / `AlertDescription` – all error messages (replacing plain `<p className="text-destructive">`).
  - `textarea` – multi-line inputs (ticket description, prompt content, AI generate).
  - `tooltip` – icon buttons (e.g. delete ticket); wrap app in `TooltipProvider` in root layout.
  - `popover` – running terminals widget in app shell (replace hover-reveal div).
  - `table`, `skeleton`, `progress`, `switch`, `dropdown-menu`, `empty` – added for future use; `empty` and `badge` used immediately.
- **Replace custom UI with shadcn**:
  - Error messages → `<Alert variant="destructive"><AlertDescription>...</AlertDescription></Alert>` on all pages (page.tsx, prompts, run, configuration).
  - Ticket form description and prompt dialogs → `<Textarea>`.
  - Ticket board column headers → `<Badge variant="secondary">` and count.
  - Ticket card priority → `<Badge variant="outline">`; delete button wrapped in `<Tooltip>`.
  - “No tickets” / “No features” → `<Empty title="..." description="..." icon={...} />`.
  - Running terminals widget → `<Popover>` + `<PopoverTrigger>` / `<PopoverContent>`, with `<Badge>` for count and `<Empty>` when no runs.
- **Dependencies**: Add Radix packages for new components: `@radix-ui/react-tooltip`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-progress`, `@radix-ui/react-switch`, `@radix-ui/react-popover`, `@radix-ui/react-alert-dialog` (via `package.json`).

## Consequences

- **Pros**: Consistent design system, better a11y (alerts, tooltips), less custom CSS, easier to add more shadcn blocks later.
- **Cons**: Extra Radix dependencies; manual component files when `npx shadcn add` failed.
- **Follow-ups**: Run `npm install` to ensure new Radix deps are installed; consider adding more components (e.g. `sidebar` block for app-shell, `Table` for ticket/feature lists) in a later iteration.
