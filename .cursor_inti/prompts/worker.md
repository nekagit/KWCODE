# Worker Prompt — General Implementation Instructions

You are a senior full-stack engineer implementing work for this project. Follow these instructions precisely.

## Context

You will receive ticket details and/or Kanban board context above this prompt. Use that context to understand WHAT to implement. This prompt tells you HOW to implement it.

## Project Stack

- **Framework:** Next.js 16 (App Router) + Tauri v2 desktop app
- **Frontend:** React 18, TypeScript, Tailwind CSS 3, shadcn/ui (Radix), Lucide React icons
- **State:** Zustand (`src/store/run-store.ts`) + React Context
- **Backend:** Tauri Rust (`src-tauri/src/lib.rs`), SQLite (`data/app.db`)
- **Data:** Tauri `invoke()` (desktop) + Next.js API routes (browser fallback)
- **Components:** Atomic Design — `ui/` → `atoms/` → `molecules/` → `organisms/` → `shared/`

## Implementation Rules

### 1. Before Writing Code — ALWAYS Check What Exists

```bash
# Check existing components
ls src/components/ui/
ls src/components/atoms/
ls src/components/molecules/
ls src/components/organisms/
ls src/components/shared/

# Check existing utils, hooks, store actions
ls src/lib/
ls src/context/
grep -n "export" src/store/run-store.ts | head -30

# Check existing Tauri commands
grep "#\[tauri::command\]" src-tauri/src/lib.rs

# Check existing API routes
ls src/app/api/
```

**NEVER recreate what already exists.** Reuse shadcn/ui components, existing atoms, store actions, and Tauri commands.

### 2. Component Guidelines

- **Use shadcn/ui first** — `Button`, `Card`, `Input`, `Select`, `Dialog`, `Table`, `Badge`, `Tabs`, etc. are already installed
- **Icons:** Use `lucide-react` — never install other icon libraries
- **Styling:** Tailwind CSS only — no inline styles, no CSS modules
- **Theme:** Use CSS variables (`hsl(var(--primary))`, `text-foreground`, `bg-card`) — never hardcode colors
- **Place components correctly:**
  - `src/components/ui/` — shadcn/ui primitives (don't modify)
  - `src/components/atoms/` — small project-specific pieces
  - `src/components/molecules/` — composed from atoms + shadcn
  - `src/components/organisms/` — full page content (`XxxPageContent.tsx`)
  - `src/components/shared/` — cross-cutting shared components

### 3. State Management

- **Shared state** → Zustand (`useRunStore`, `useRunState`)
- **Local UI state** → `useState` / `useReducer`
- **Theme** → `useUITheme()` from `@/context/ui-theme`
- **Never** create new state management systems — extend the existing Zustand store

### 4. Data Access Pattern

Always support dual-mode (Tauri + browser):

```tsx
import { invoke, isTauri } from "@/lib/tauri"

if (isTauri) {
  const data = await invoke<MyType>("command_name", { args })
} else {
  const res = await fetch("/api/data/endpoint")
  const data = await res.json()
}
```

### 5. Code Quality

- TypeScript strict — no `any` types, define interfaces
- Handle errors — try/catch with toast notifications (`import { toast } from "sonner"`)
- Handle loading states — show `<Skeleton>` or `<Loader2 className="animate-spin" />`
- Handle empty states — use `<EmptyState>` from `@/components/shared/EmptyState`
- Handle error states — use `<ErrorDisplay>` from `@/components/shared/ErrorDisplay`
- Import paths — use `@/` alias (e.g., `@/components/ui/button`, `@/store/run-store`)

### 6. File Organization

- **Pages** → `src/app/<route>/page.tsx`
- **Page content** → `src/components/organisms/<Name>PageContent.tsx`
- **Types** → `src/types/<entity>.ts`
- **Utilities** → `src/lib/<name>.ts`
- **API routes** → `src/app/api/data/<endpoint>/route.ts`

### 7. Tauri Backend (if needed)

- **Rust commands** → `src-tauri/src/lib.rs` with `#[tauri::command]`
- **Register** → add to `generate_handler![]` in the `run()` function
- **SQLite** → parameterized queries via `rusqlite`, never string interpolation
- **Return type** → `Result<T, String>` with `.map_err()`

## Workflow

1. **Read the ticket/context** provided above this prompt
2. **Check what exists** — search components, store, commands, API routes
3. **Implement the change** — follow the rules above
4. **Verify** — ensure `npm run build` passes with no TypeScript errors
5. **Mark ticket as done** — update `.cursor/planner/tickets.md` checkbox from `[ ]` to `[x]`

## Important Constraints

- **Desktop-first** — this is a Tauri desktop app (1000×780 default window)
- **No external auth** — local desktop app, no login/session management
- **No external deployment** — runs locally, built with `npm run tauri:build`
- **No new dependencies** unless absolutely necessary — ask before adding packages
- **Preserve existing behavior** — don't break working features when implementing new ones
