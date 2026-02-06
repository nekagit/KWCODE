# ADR 020: AI generate tickets – project analysis and feature/todo-style output

## Status
Accepted

## Context
The "AI Generate tickets" flow when using a selected project (e.g. Three.js) was sending only the project path and name. The model had no real codebase context and produced generic, low-value tickets such as "Create documentation" and "Install Three.js". Users need tickets that reflect actual project structure, tech stack, and missing work—i.e. a prioritized feature/todo list derived from analysis.

## Decision
1. **Tauri: project analysis command**
   - Add `analyze_project_for_tickets(project_path: String)` that:
     - Validates path is an existing directory.
     - Reads `package.json` (if present).
     - Reads README (README.md / readme.md), capped at 8k chars.
     - Lists top-level directories and files (skip hidden except `.git`).
     - Reads one of `tsconfig.json`, `vite.config.*`, `next.config.*`, `Cargo.toml`, `pyproject.toml`, `requirements.txt` as a config snippet (capped at 4k chars).
   - Return a `ProjectAnalysis` struct: `name`, `path`, `package_json`, `readme_snippet`, `top_level_dirs`, `top_level_files`, `config_snippet`.

2. **Generate-tickets API**
   - Extend request body with optional `project_analysis` (same shape as Rust struct).
   - When `project_analysis` is present:
     - Include it in the prompt under "Project analysis".
     - Use a dedicated system message and instructions: analyze the project first (infer tech stack, existing structure), then output a prioritized feature/todo list; avoid generic tickets like "Create documentation" or "Install X" unless the analysis shows they are missing; prefer concrete items (e.g. "Add orbit controls", "Unit tests for store X").
     - Order: setup/deps only if needed → core features → UX → tests → docs.

3. **Frontend (Tickets tab – generate from project)**
   - When generating from a selected project in Tauri: call `analyze_project_for_tickets(projectPath)` first; pass the result as `project_analysis` in the generate-tickets request.
   - If not in Tauri or analysis fails, keep existing behavior (description-only request).

## Consequences
- Tickets generated from a project (e.g. Three.js, any repo) are analysis-driven and project-specific.
- Same flow works for any project with package.json/README/structure; no change to AI Generate tab with manual description/files.
- Browser-only usage continues to work without analysis (description-only).
