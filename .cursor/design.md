# Design

## Design system / UI overview

- **Stack**: Tailwind CSS, Radix UI primitives, Lucide icons. Component set follows a **shadcn-style** pattern (CVA, `cn()`, semantic tokens).
- **Colors**: CSS variables in `src/app/globals.css` — `--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--ring`, `--radius`. Light theme default; `.dark` overrides for dark mode. Raw background fallback in layout: `#fafafa` (light), `#171717` (text).
- **Typography**: No custom font family set; system stack. Sizes and weights via Tailwind (`text-sm`, `font-medium`, etc.).
- **Layout**: Sidebar (`w-48`) + main content; `min-h-screen`, `overflow-auto` for scroll. Cards and sections use `rounded-lg`, `border`, `bg-card` / `bg-muted/30`.
- **Spacing**: Consistent `gap-2`, `gap-4`, `space-y-*`, `p-4`, `md:p-6` for main content.

## Key sections / pages

- **Shell**: Fixed sidebar with nav groups (main, Log & Data, Settings); top-right floating “running terminals” button with badge; main area with `Suspense` and padding.
- **Dashboard (home)**: Tabs (dashboard, tickets, feature, projects, prompts, all, data, log); cards for quick actions, ticket kanban, prompts; accordions for “Add ticket” / “Add feature”.
- **Run**: Prompt selection, project checkboxes, feature dropdown, Run/Stop; optional timing link to Configuration.
- **Projects**: List with badges (template/idea), “New project”, “From path”; project cards link to detail.
- **Project detail**: Accordions for Prompts, Tickets, Features, Ideas, Design, Architecture, Spec (markdown), Cursor files; actions: Export, Best practice, Analysis prompt.
- **Prompts / Ideas / Design / Architecture**: List or table + create/edit dialogs; AI generate actions; Design has markdown/HTML preview and library save.
- **Configuration**: Form for timing parameters (sleep durations) used by run script.

## Template type

**Dashboard / control panel**. Not a marketing landing or docs site. Primary template: sidebar + content; secondary: tabbed dashboard (home), forms and tables for CRUD, and dialogs for create/edit/generate.
