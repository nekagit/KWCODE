# ADR 0010: Testing strategy and standards document

## Status

Accepted

## Context

The project (KWCode / run-prompts) has Playwright configured for E2E but no unit or integration tests, no Vitest setup, and no single source of truth for testing philosophy, stack, patterns, or CI. To improve quality and onboarding, we need a production-grade testing playbook that is actionable and enforceable.

## Decision

- **Adopt `.cursor/setup/testing.md`** as the definitive testing strategy, standards, and playbook for the project.
- **Contents**: Testing landscape (architecture, current setup, critical flows, challenges), testing philosophy and pyramid, stack and tools (Vitest, Testing Library, Playwright), organization and naming, unit/component/E2E/API/Tauri/AI/a11y/performance standards, CI/CD guidance, and anti-patterns.
- **Tailoring**: The document is specific to this repo: run-store, `src/lib/tauri.ts`, `api-validation`, file-based `data/projects.json`, generate-* and data API routes, baseURL 4000, Next.js 16, Tauri 2, Zustand, shadcn/ui, Zod, Playwright in `e2e/`.
- **Version**: 1.0, dated 2026-02-15. Treat the doc as a living playbook and update it as patterns or tools change.

## Consequences

- One canonical reference for how and what to test; new contributors and AI agents can follow it consistently.
- Clear coverage targets (unit 80%+, integration 70%+, E2E critical paths) and definition of “tested.”
- Guidance for mocking at boundaries (Tauri, OpenAI, fs) and for run-store, API routes, and AI features.
- Foundation for adding Vitest, test scripts, and CI steps without re-deciding conventions.

## References

- Strategy document: `.cursor/setup/testing.md`
- E2E config: `playwright.config.ts` (baseURL 4000, testDir `e2e/`)
- Run store: `src/store/run-store.ts`; Tauri bridge: `src/lib/tauri.ts`
- API validation: `src/lib/api-validation.ts`; projects API: `src/app/api/data/projects/route.ts`
