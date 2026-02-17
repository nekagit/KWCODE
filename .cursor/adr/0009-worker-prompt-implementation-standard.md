# ADR 0009: Worker prompt as implementation standard

## Status

Accepted

## Context

AI-assisted implementation (e.g. Implement All in the Run tab, or agent runs per ticket) needs a single, project-specific source of *how* to implement: stack, patterns, file layout, and constraints. Without a canonical prompt, agents may guess conventions, duplicate components, or ignore existing store/API structure. Best practice for AI-assisted projects is to maintain one "worker" or "implementation instructions" document that is injected as context for every implementation run.

## Decision

- **Use a single worker prompt** as the source of truth for general implementation instructions (see ADR 0040: app uses `.cursor/8. worker/implement-all.md`; agents from `.cursor/2. agents/`).
- **Run tab (Implement All)** loads the implement-all prompt as the base and combines it with ticket context and per-ticket agents from `.cursor/2. agents/`.
- **Content covers:** project stack (Next.js 16, Tauri v2, React 18, Tailwind, shadcn/ui, Zustand), implementation rules (check existing components/store/commands first, component guidelines, state management, data access pattern, code quality, file organization, Tauri backend), workflow (read ticket → check what exists → implement → verify → mark done), and constraints (desktop-first, no external auth/deployment, preserve behavior).
- **Tickets/scope** continue to come from Kanban / `.cursor/7. planner/tickets.md`; the worker prompt describes *how*, not *what*.

## Consequences

- All implementation runs (human-driven or agent) use the same rules, reducing drift and rework.
- New contributors and AI tools have one place to read project conventions.
- Updating stack or patterns requires editing only the implement-all prompt (`.cursor/8. worker/implement-all.md`); no scattered prompts.

## References

- ADR 0040: Implement All minimal script and `.cursor/2. agents` everywhere.
- Run tab: `ProjectRunTab.tsx` (reads `WORKER_IMPLEMENT_ALL_PROMPT_PATH` for Implement All).
- Planner: `.cursor/7. planner/tickets.md` for *what* to implement; worker prompt for *how*.
- Docs: `.cursor/README.md`, `docs/guides/usage-guide.md` (worker prompt path).
