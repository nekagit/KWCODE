# KWCode

**Desktop app to manage projects and run Cursor CLI agents (Ask, Plan, Fast dev, Debug) from one place.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Screenshots

*Screenshot: [Coming soon] — Dashboard with Projects, Run, and Planner.*

---

## Features

- **Dashboard** — Overview, active projects, quick links to Projects, Run, Prompts, Ideas, Design, Architecture, Testing, Planner, Versioning, Documentation, and Configuration.
- **Projects** — Add repos by path; **Initialize** (seed `.cursor` from `.cursor_init.zip`); **Starter** (project template + `.cursor`); open in Cursor, terminal, or file manager.
- **Worker (Run) tab** — Per-project: **Ask** (read-only), **Plan** (design first), **Fast development** (run agent), **Debug** (paste logs, fix). Uses Cursor CLI with `--mode=ask|plan|debug`; terminal output and history.
- **Planner** — Kanban (tickets), milestones, sync with `.cursor/7. planner/tickets.md`.
- **Ideas, Prompts, Design, Architecture, Testing, Versioning, Documentation** — Per-project or global views; export/copy as Markdown, JSON, or CSV where applicable.
- **Configuration** — Data directory, app version, repository link, API health.
- **Command palette** (⌘K) — Navigation, copy/download actions, go to first project by tab.
- **Desktop app** — Tauri 2; single window, no browser required; SQLite + file storage.

---

## Tech stack

- **Frontend:** Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS, Radix UI (shadcn), Zustand.
- **Desktop:** Tauri 2 (Rust); WebView loads static export of the Next app.
- **Data:** SQLite (rusqlite in Tauri, better-sqlite3 in Node API); file-based (`data/`, `.cursor/`) for projects and prompts.
- **Agent integration:** Cursor CLI (`agent`) invoked via shell script for the Worker tab (optional; the app works without it).

---

## Prerequisites

- **Node.js** 18+ (LTS recommended).
- **Rust** (for Tauri desktop build): [rustup](https://rustup.rs).
- **Cursor CLI** (optional): for Worker tab agent runs; [install](https://cursor.com/docs/cli/overview).
- **macOS** (primary); Windows/Linux — Tauri supports them; build and test on your platform.

---

## Install and run

**Clone and install:**

```bash
git clone <repo-url> && cd KW-February-KWCode
npm install
```

**Browser (no Tauri):**

```bash
npm run dev
```

Then open [http://127.0.0.1:4000](http://127.0.0.1:4000). Some features (file system, terminal agent) require the desktop app.

**Desktop (Tauri):**

```bash
npm run dev:tauri
```

Starts the Next dev server and Tauri window.

**Production build (desktop):**

```bash
npm run build:desktop
```

Builds the app and copies it to your Desktop (see [package.json](package.json) for more scripts).

---

## Project structure

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router pages and API routes |
| `src/components/` | UI (atoms, molecules, organisms, shared, ui) |
| `src/lib/`, `src/store/`, `src/types/` | Logic, state, types |
| `src-tauri/` | Tauri (Rust) app, commands, SQLite, bundling |
| `script/` | Build and worker scripts (e.g. `run_terminal_agent.sh`) |
| `.cursor/` | Project-specific Cursor prompts, ADRs, docs (see [.cursor/README.md](.cursor/README.md)) |

---

## Documentation

For detailed Cursor usage, agents, and workflows, see [.cursor/README.md](.cursor/README.md).

---

## Contributing

Contributions are welcome. Please open an issue or PR.

---

## License

This project is licensed under the [MIT](LICENSE) License.
