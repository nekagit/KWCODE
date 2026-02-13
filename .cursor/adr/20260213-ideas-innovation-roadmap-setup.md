# ADR: Ideas & innovation roadmap (ideas.md)

## Date
2026-02-13

## Status
Accepted

## Context
The project needed a single, ambitious yet actionable innovation roadmap to guide product and R&D for the next 12–18 months. There was no consolidated place for feature ideas, prioritization, competitive positioning, or idea lifecycle. Best practice for AI and product-led projects is to maintain a living ideas document that captures vision, tiers (near-term, medium-term, moonshots), technical R&D, UX innovations, and a clear prioritization framework so the team and stakeholders can align on what to build next.

## Decision
- Introduce **`.cursor/setup/ideas.md`** as the **single innovation roadmap and R&D backlog** for KWCode.
- The document includes:
  - **Project context & current state** (core problem, users, scope, value proposition, gaps, tech stack).
  - **Vision statement** (north star 12–18 months, top 3 differentiators).
  - **Tier 1 — High-impact, near-term (1–3 months)**: 10+ ideas with problem, solution, AI integration, user flow, technical approach, dependencies, effort, impact, success metrics (e.g. Command Palette, AI prompt chaining, semantic search, keyboard-first workflows, usage analytics, conflict handling).
  - **Tier 2 — Medium-term (3–6 months)**: Multi-agent orchestration, RAG for prompts, workflow builder, session sharing, self-improving prompts, doc generation, approval workflows.
  - **Tier 3 — Moonshots (6–12 months)**: Local LLM, proactive AI pair, cross-project meta-learning, voice commands, one-click deploy.
  - **Technical R&D explorations**: Local LLM, streaming, vectors, prompt caching, CRDT, IndexedDB, MCP, plugins, audit log.
  - **UX innovation ideas**: Command palette, shortcuts, breadcrumbs, focus mode, dashboards, accessibility.
  - **Competitive analysis matrix**: KWCode vs Cursor, Copilot, Windsurf, Linear, Notion.
  - **Prioritization framework**: Score = (Impact × Feasibility × Strategic Alignment) / Effort; P0–P3 buckets.
  - **Ranked backlog (top 15 ideas)** and **idea lifecycle** (Proposed → Researched → Validated → In Progress → Shipped → Measured).
  - **User feedback integration**, **innovation experiments**, **risks & mitigation**, and an **appendix idea template**.
- New ideas should be added using the appendix template; prioritization and lifecycle updates should keep ideas.md current. The doc is updated when vision or priorities change.

## Consequences
- One place for product and R&D direction; easier alignment and onboarding.
- Clear ordering of work (P0/P1/P2) and a shared vocabulary for impact, effort, and strategy.
- Ideas.md is maintained as a living roadmap; ADRs can reference it when making product or scope decisions.
