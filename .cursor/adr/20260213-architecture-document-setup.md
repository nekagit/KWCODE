# ADR: Architecture document (architecture.md)

## Date
2026-02-13

## Status
Accepted

## Context
The project needed a single, authoritative reference for structural, data-flow, integration, and technical decisions. There was no consolidated architecture document for onboarding, refactoring, or AI-assisted development. Best practice for full-stack and AI-augmented projects is to maintain a living architecture document that describes style, boundaries, conventions, and anti-patterns so that all contributors and tooling align on how the system is built and how to extend it.

## Decision
- Introduce **`.cursor/setup/architecture.md`** as the **single source of truth for architecture** for KWCode.
- The document includes:
  - **Architecture Analysis** — Brief analysis of the current project: framework (Next.js 16), frontend (Client Components, Zustand, Context), backend (REST API, file-based persistence, no DB), state and data flow, Tauri dual-backend, and integration points (OpenAI, file system).
  - **Architecture Overview** — Stated style (layered + modular monolith, atomic design, dual-backend); high-level ASCII system diagram (browser/Tauri → Next.js API → file system + OpenAI); guiding principles (file-first, single run store, dual-backend abstraction, API validation, no server leakage, atomic UI, explicit client boundary); and architectural categories (REST, monolithic, layered, modular).
  - **Directory Structure & Module Boundaries** — Annotated `src/` tree; folder purposes and import rules; dependency rules (UI → lib/types/data/store/context; no reverse imports); naming conventions for files, functions, variables, types.
  - **Data Flow & State Architecture** — Data sources (server REST, client Zustand/Context/local/URL, persistent files and localStorage, external OpenAI); when to use Zustand vs Context vs local vs URL state; data fetching strategy (client fetch + run store, no Server Components data loading, no SWR/React Query); caching and revalidation; optional optimistic update note.
  - **API Design & Conventions** — Endpoint structure for data CRUD and generate routes; request/response envelope (recommended); HTTP status codes; Zod validation pattern (`parseAndValidate`); error handling on server and client.
  - **Native Integration (Tauri)** — Dual-backend strategy (`lib/tauri.ts`, no-op in browser); invoke/listen/dialog usage; event system; capabilities note; anti-patterns (no Tauri in API routes, feature-detect).
  - **Component Architecture** — Atomic design (ui → atoms → molecules → organisms → shared); file and client/server patterns; props and composition.
  - **Type System & Validation** — Type organization; Zod as source of truth where applicable; shared vs domain types; generic patterns.
  - **Error Handling & Resilience** — Error boundary hierarchy; API → client propagation; retry/fallback; logging/monitoring.
  - **Performance & Optimization** — Bundle splitting; memoization; image and data optimization.
  - **Security** — Input sanitization, auth note, env vars, CSP note.
  - **Scalability & Extension** — How to add a new entity, page, AI endpoint, or Zustand slice.
  - **Anti-Patterns** — 14 forbidden patterns with rationale (e.g. business logic in pages, global mutable state, fetch without cleanup, prop drilling, `any`, no validation, server imports in client, hardcoded URLs, silent failures, mutating props, over-abstracting, Tauri in API, UI in lib).
  - **ADRs summary table** — Key decisions (Next.js, file persistence, Zustand, Zod, Tauri, no auth, REST, atomic design) with date, rationale, and alternatives.
  - **Appendix** — Quick reference for common patterns, path aliases, and key files.
- The document is ~1000 lines, reference-grade, and aligned with the actual codebase (paths, file names, store, lib, API routes). New features and refactors should follow it; the doc should be updated when the system evolves.

## Consequences
- One place for architectural decisions and conventions; easier onboarding and consistent extension patterns.
- AI assistants and developers can rely on a single reference for structure, data flow, and forbidden patterns.
- Drift between doc and code should be corrected as part of normal iteration (living document).
