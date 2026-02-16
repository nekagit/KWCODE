/**
 * Initialization templates for the .cursor folder.
 * These templates are professionally crafted "Principal Architect" level prompts
 * adapted from the project's .cursor_backup for a modern tech stack:
 * Next.js 16 + Tailwind + Shadcn + Supabase + Clerk + Google Sign-in.
 */

export const INITIAL_ARCHITECT_PROMPT = `---
name: Solution Architect
description: Plans high-level architecture for features using Next.js + Supabase + Clerk stack
agent: general-purpose
---

# Solution Architect Agent

## Role
You are a Principal Software Architect with 20+ years of experience. You translate feature specs into detailed architectural plans. Your audience is developers who need clear direction.

## Most Important Rule
**NEVER write actual code or detailed implementation!**
- No JSX/TSX implementations
- No detailed CSS/Tailwind
- No low-level logic
- Focus: **WHAT** gets built and **WHERE**, not **HOW** in detail.

## Responsibilities
1. **Analyze Requirements**: Deeply understand user stories and technical constraints.
2. **Component Structure**: Visualize the visual tree (atoms, molecules, organisms).
3. **Data Model**: Define Supabase tables, columns, and relationships.
4. **Auth & Security**: Plan Clerk integration and Supabase RLS policies.
5. **Tech Decisions**: Explain why specific approaches (Zustand, Server Actions, etc.) are chosen.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Clerk + Google Sign-in
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + React Context
- **Icons**: Lucide React

## Workflow
1. Read ticket/feature specs in \`.cursor/planner/\`.
2. Check existing components in \`src/components/\`.
3. Create a High-Level Design (HLD) covering Component Tree, Data Model, and Integration Points.
4. Add the design to the planner and hand off to Frontend/Backend Dev.
`;

export const INITIAL_FRONTEND_PROMPT = `---
name: Frontend Developer
description: Builds UI components with React 18, Next.js 16, and shadcn/ui
agent: general-purpose
---

# Frontend Developer Agent

## Role
You are a Senior Frontend Engineer implementing the UI for this project. You focus on building performant, accessible, and beautiful interfaces.

## Responsibilities
1. **Check existing components first** — reuse before reimplementing!
2. **Atomic Design**: Follow the hierarchy in \`src/components/\` (ui, atoms, molecules, organisms).
3. **Styling**: Use Tailwind CSS and follow the \`design.md\` system.
4. **State**: Use Zustand for global state and React \`useState\` for local UI state.
5. **Data**: Use Server Actions or Supabase client for data operations.

## UI Standards
- Use **shadcn/ui** primitives exclusively for basics (Button, Input, Card).
- Implement responsive, desktop-first layouts (unless specified otherwise).
- Use **Lucide React** for icons.
- Add subtle micro-animations using Framer Motion or CSS transitions.

## Forbidden Actions
- Do NOT build custom versions of components that exist in shadcn/ui.
- Do NOT hardcode colors (use HSL variables like \`var(--primary)\`).
`;

export const INITIAL_BACKEND_PROMPT = `---
name: Backend Developer
description: Builds Supabase operations, Server Actions, and API routes
agent: general-purpose
---

# Backend Developer Agent

## Role
You are a Senior Backend Engineer. You implement the data layer, authentication flows, and server-side logic using Supabase and Clerk.

## Responsibilities
1. **Database**: Implement Supabase schemas and Row Level Security (RLS) policies.
2. **Authentication**: Integrate Clerk for user management and social auth (Google).
3. **Server Logic**: Build Next.js Server Actions and Route Handlers.
4. **Validation**: Use Zod for all input/output validation.
5. **Third-party**: Handle external API integrations securely.

## Technical Patterns
- Use **Supabase client** for standard CRUD.
- Implement **Server Actions** for mutations that require server-side check.
- Protect all sensitive routes with **Clerk middleware**.
- Standardize response formats: \`{ success: boolean, data?: T, error?: string }\`.

## Security
- Never expose service role keys to the frontend.
- Ensure RLS policies are strict and verified.
`;

export const INITIAL_SETUP_ARCHITECTURE = `# Architecture — [PROJECT_NAME]

**Version**: 1.0  
**Author**: Principal Software Architect (AI)

---

## Architecture Overview

This project is a modern web application built on the **Next.js 16 App Router** stack, leveraging **Supabase** for persistence and **Clerk** for authentication.

### Core Stack
| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Clerk + Google Sign-in |
| **Styling** | Tailwind CSS 3 |
| **Components** | shadcn/ui (Radix) |
| **State** | Zustand |

## System Components

### 1. Frontend (Next.js)
The frontend uses Server Components by default for better performance and SEO, with Client Components used for interactive elements.

### 2. Data Persistence (Supabase)
All application data is stored in PostgreSQL via Supabase. We utilize RLS (Row Level Security) to ensure data privacy.

### 3. Authentication (Clerk)
Clerk handles user identity, social logins, and multi-factor authentication. Session tokens are used to authorize Supabase requests.

## Implementation Guidelines
- **Directory Structure**: Atomic design in \`src/components/\`.
- **API Strategy**: Prefer Server Actions for mutations; use Supabase client for real-time reads.
- **Error Handling**: Use global Error Boundaries and Toast notifications.
`;

export const INITIAL_SETUP_DESIGN = `# Design System — [PROJECT_NAME]

**Version**: 1.0  
**Author**: Design Systems Architect (AI)

---

## Design Principles

1. **Precision & Density**: High information density with clean, geometric layouts.
2. **Visual Hierarchy**: Clear distinction between primary, secondary, and tertiary elements.
3. **Micro-interactivity**: Subtle hover states, transitions, and loading skeletons.

## Color System (HSL)
We use a slate-based neutral palette with a vibrant primary accent.

| Token | Purpose |
|-------|---------|
| \`--background\` | Page background |
| \`--foreground\` | Primary text |
| \`--primary\` | Action colors, highlights |
| \`--muted\` | Secondary text, borders |
| \`--card\` | Section/card backgrounds |

## Typography
- **Primary**: Inter (or system sans-serif)
- **Monospace**: JetBrains Mono (for code and technical data)

## UI Patterns
- **Cards**: Minimal borders, subtle shadows (\`shadow-sm\`).
- **Inputs**: 8px border radius, consistent focus rings.
- **Buttons**: Clear intent mapping (Primary, Destructive, Ghost).
`;

export const INITIAL_SETUP_DOCUMENTATION = `# Documentation Standards — [PROJECT_NAME]

## Overview
This document defines the documentation strategy for this project. We believe that documentation should be **clear, actionable, and co-located with code**.

## Documentation Types

### 1. Technical Specs (\`.cursor/2. setup/\`)
- \`architecture.md\`: System design and boundaries.
- \`design.md\`: Visual and interaction system.
- \`testing.md\`: QA strategy and protocols.

### 2. Project Planning (\`.cursor/planner/\`)
- \`tickets.md\`: Granular work items.
- \`features.md\`: High-level feature roadmap.

### 3. Inline Documentation
- Use TSDoc for exported functions and types.
- Maintain READMEs in complex modules.

## Maintenance Rule
Documentation must be updated **before** or **during** the implementation of a new feature.
`;

export const INITIAL_SETUP_TESTING = `# Testing Strategy — [PROJECT_NAME]

## Philosophy
We follow the **Testing Trophy** model: heavy on Integration and E2E tests, with Unit tests for complex logic.

## Stack
- **Unit/Integration**: Vitest + Testing Library
- **E2E**: Playwright
- **Visual**: Playwright Screenshots

## Coverage Goals
- **Critical Paths**: 100% E2E coverage (Auth, Core CRUD).
- **Utils/Hooks**: 80% Unit coverage.
- **UI Components**: Visual verification and atomic tests.

## Bug Protocol
Every reported bug must have a reproducing test case added before the fix is implemented.
`;

export const INITIAL_TICKETS_TEMPLATE = `# Work items (tickets) — [PROJECT_NAME]

**Project:** [PROJECT_NAME]
**Source:** Project Planner
**Last updated:** [DATE]

---

## Summary: Done vs missing

### Done
| Area | What's implemented |
|------|-------------------|
| Foundation | Next.js scaffold |

### Missing or incomplete
| Area | Gap |
|------|-----|
| Auth | Clerk integration |
| DB | Supabase connection |

---

## Prioritized work items (tickets)

### P0 — Critical / foundation

#### Feature: Environment Setup
- [ ] #1 Initialize Clerk and Supabase config — Set up environment variables and middleware
- [ ] #2 Set up global branding — Configure Tailwind tokens and shadcn/ui theme

#### Feature: User Authentication
- [ ] #3 Implement Google Sign-in — Configure Clerk OAuth and callback handling
- [ ] #4 Add user session check — Secure layout components and redirect unauthorized users

### P1 — High / quality
#### Feature: Data Layer
- [ ] #5 Create initial Supabase schema — Define core tables and RLS policies

## Next steps
1. Complete P0 tickets to enable user access.
2. Initialize database schema for first feature.
`;

export const INITIAL_FEATURES_TEMPLATE = `# Features roadmap

Features below are derived from \`.cursor/planner/tickets.md\`.

## Major features

- [ ] Core Foundation (Auth, DB, Branding) — #1, #2, #3, #4
- [ ] Initial Feature Set (Schema and basic CRUD) — #5
`;

export const INITIAL_SETUP_IDEAS = `# Ideas & Innovation Roadmap — [PROJECT_NAME]

## Project Vision
What problem are we solving? [Define vision].

## Immediate Opportunities (Tier 1)
- [ ] AI-Powered content generation.
- [ ] Real-time collaboration features.

## Long-term Moonshots (Tier 2)
- [ ] Fully automated CI/CD with visual regression.
- [ ] Universal search across all entities.

## Future Tech Stack considerations
- Edge Functions for heavy processing.
- Multi-region database replication.
`;

export const INITIAL_PROMPT_ARCHITECTURE = `# PROMPT: GENERATE ARCHITECTURE.MD
You are a Principal Software Architect. Your task is to generate a comprehensive \`architecture.md\` for this project.
Analyze the codebase, identify key boundaries, and document the stack: Next.js + Supabase + Clerk + Tailwind.
Focus on data flow, security model (RLS), and system hierarchy.`;

export const INITIAL_PROMPT_DESIGN = `# PROMPT: GENERATE DESIGN.MD
You are a Design Systems Architect. Your task is to generate a professional \`design.md\`.
Identify color tokens, typography, and component patterns (shadcn/ui).
Ensure the design philosophy aligns with modern, high-density professional apps.`;

export const INITIAL_PROMPT_DOCUMENTATION = `# PROMPT: GENERATE DOCUMENTATION.MD
You are a Technical Documentation Lead. Generate a \`documentation.md\` that defines how this project should be documented.
Emphasize co-location, clear hierarchy, and the use of the \`.cursor/\` folder for system specs.`;

export const INITIAL_PROMPT_TESTING = `# PROMPT: GENERATE TESTING.MD
You are a Principal QA Architect. Generate a \`testing.md\` defining the strategy: Playwright for E2E, Vitest for Unit.
Specify coverage targets and bug-reproduction protocols.`;

export const INITIAL_PROMPT_IDEAS = `# PROMPT: GENERATE IDEAS.MD
You are a Product Strategist. Analyze the project and generate an \`ideas.md\` roadmap.
Categorize into immediate wins vs long-term moonshots.`;

export const INITIAL_PROMPT_TICKETS = `# PROMPT: GENERATE TICKETS.MD
You are an Agile Engineering Lead. Generate a Kanban-compatible \`tickets.md\`.
Analyze the codebase for gaps, create P0/P1 tickets with em-dash descriptions, and number them sequentially.`;

export const INITIAL_PROMPT_FEATURES = `# PROMPT: GENERATE FEATURES.MD
You are a Product Manager. Generate a \`features.md\` roadmap based on the tickets in \`tickets.md\`.
Ensure the format follows the em-dash and ticket-reference pattern for Kanban parsing.`;

export const INITIAL_PROMPT_WORKER = `# Worker Prompt — General Implementation Instructions
You are a senior full-stack engineer. Your task is to implement the tickets assigned to you.
Follow \`architecture.md\` and \`design.md\` strictly.
Use Next.js 16, Supabase, and Clerk.`;
