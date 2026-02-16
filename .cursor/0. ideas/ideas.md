# Ideas & Innovation Roadmap — run-prompts

**Version**: 1.0  
**Last Updated**: 2026-02-15  
**Author**: Product Strategist & AI Innovator (AI)

---

## Project Context & Current State

**run-prompts** (package name from `package.json`) is a project, prompt, and ticket management application with AI-augmented workflows. It runs in the browser and optionally as a native desktop app via Tauri v2.

**Repo layout (top level):** `.cursor/`, `app-icon.svg`, `components.json`, `data/`, `docs/`, `next-env.d.ts`, `next.config.js`, `next.config.mjs`, `node_modules/`, `out/`, `package-lock.json`, `package.json`, `playwright.config.ts`, `postcss.config.mjs`, `public/`, `script/`, `src-tauri/`, `src/`, `tailwind.config.ts`, `tsconfig.json`, `tsconfig.tsbuildinfo`.

**Tech stack:** Frontend — Next.js 16 (App Router), React 18, Tailwind CSS, shadcn/ui, Radix UI (accordion, alert-dialog, checkbox, dialog, dropdown-menu, label, popover, progress, scroll-area, select, separator, slot, switch, tabs, tooltip), Zustand, Lucide React, TanStack Table. Backend — Next.js API routes, Node.js, Zod for validation. Desktop — Tauri 2. Tooling — ESLint, TypeScript, Playwright (e2e), npm. Additional deps: `react-markdown`, `remark-gfm`, `sonner`, `pdf-parse`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`.

**Current scope:** Projects with tabs (Setup, Frontend, Backend, Documentation Hub, Ideas, Run, Tickets, Kanban, Testing, Milestones, Git, Files, etc.), prompts and prompt records, ideas (templates, AI-generated), agents, Analyze workflows, Implement All (worker prompt + tickets), local repos, and floating terminal. Data lives in `data/` and is managed via store and API patterns.

**Core problem space:** Developers and small teams need a single place to manage project context, run AI-assisted prompts, track tickets/ideas, and execute implementation workflows—without leaving the app. Primary users are developers using Cursor (or similar) who want structured prompts, tickets, and agent runs.

**Gaps & opportunities:** Deeper AI integration (chaining, context passing, local LLM), keyboard-first UX (command palette), real-time collaboration, semantic search over docs, and stronger integrations (Git, CI/CD, OAuth) are clear next steps. The codebase is well-structured (molecules, organisms, store, `.cursor/` docs and prompts), so new features can build on existing patterns.

---

## 1. Vision Statement

**North Star (12–18 Months)**

run-prompts becomes the **AI-native project cockpit** that turns scattered prompts, tickets, and agent runs into one coherent workflow. Unlike generic note apps or pure IDEs, it **orchestrates context**—projects, docs, ideas, and implementation instructions—so that AI agents and humans work from a single source of truth. Users feel **in control and fast** because every action (analyze, implement, refine) is one click or shortcut away, and the app learns from their usage. The vision is a **desktop-first, optionally offline** hub that makes AI-assisted development predictable, traceable, and delightful.

**Key Differentiators (Top 3)**

1. **Unified project + prompt + ticket + agent model** — One place for project metadata, worker prompts, tickets, and run history; no context switching between Notion, Linear, and the terminal.
2. **Native desktop + optional Tauri backend** — Full control over filesystem and local data; future local LLM and MCP integrations without depending on a browser sandbox.
3. **Cursor-native workflow** — Designed around Cursor’s agent and Run tab; worker prompt, tickets, and Implement All are first-class, making AI implementation repeatable and auditable.

---

## 2. Tier 1 — High-Impact, Near-Term Ideas (1–3 Months)

#### 1. Intelligent Prompt Chaining

**Problem**: Single-shot prompts don’t reflect real workflows (analyze → plan → implement → verify). Users re-paste context and lose continuity.

**Solution**: Multi-step workflows where the output of step N becomes context for step N+1. Define chains in the UI (e.g. “Analyze project” → “Generate tickets” → “Implement first ticket”) and run them with one action. State is persisted so users can resume or fork.

**AI Integration**: Each step calls the same agent/API with a step-specific system prompt and the previous step’s output in the user message. Optionally use a small classifier to suggest the next step (e.g. “suggest: add tests”) based on last output.

**User Flow**:
1. User creates or selects a chain template (e.g. “Full implementation”).
2. User runs the chain; step 1 executes (e.g. analyze).
3. Output is shown and auto-fed to step 2; user can edit before continuing.
4. User runs step 2, 3, … or stops and resumes later.

**Technical Approach**: New store slice for chains (steps, inputs, outputs); API route that runs one step and returns result; UI for chain editor and step runner. Reuse existing prompt/agent invocation patterns.

**Dependencies**: Stable prompt/agent API, run store.

**Effort**: L  
**Impact**: 🔥🔥🔥  
**Success Metrics**: % of runs that use a chain; time from “analyze” to “first ticket implemented.”

---

#### 2. Auto-Categorization and Tagging of Ideas & Tickets

**Problem**: Ideas and tickets pile up without structure; finding “backend” or “auth” items is manual.

**Solution**: On create or bulk action, run a lightweight AI pass to suggest (or apply) tags/categories (e.g. frontend, backend, docs, bug). Users confirm or edit; over time the model can be tuned from corrections.

**AI Integration**: Single LLM call per item (or batched) with a small prompt: “Given this title/description, pick from [categories]. Reply with JSON.” Use a cheap/fast model; cache by text hash to avoid re-tagging unchanged content.

**User Flow**:
1. User adds an idea or ticket (or selects many).
2. User clicks “Suggest tags” or tags are suggested on save.
3. User accepts, edits, or dismisses; choices are stored.
4. Filtering and search use these tags.

**Technical Approach**: New API route `POST /api/ideas/tag` or `POST /api/tickets/tag`; optional background job for bulk; store tags in existing idea/ticket schema; UI: tag pills and filter dropdowns.

**Dependencies**: Ideas and tickets data model with tag field(s).

**Effort**: M  
**Impact**: 🔥🔥  
**Success Metrics**: Tag usage rate; time to find an item by category.

---

#### 3. Smart Scheduling and Prioritization

**Problem**: Users don’t know which ticket or idea to do next; queues are static.

**Solution**: A “Suggested order” view that scores items by effort (from description or history), dependencies, and optional due dates. User can accept the order, drag to reorder, or mark items as “do first.”

**AI Integration**: LLM estimates effort (S/M/L) and suggests dependencies from titles/descriptions; optional integration with git (e.g. “touches same files”) for dependency hints. Scores are computed locally from a simple formula (e.g. impact/effort + urgency).

**User Flow**:
1. User opens “Prioritized backlog” or “Suggested order” in Tickets or Ideas.
2. App shows a ranked list with short rationale (e.g. “Quick win,” “Unblocks 3 others”).
3. User reorders or pins; order is saved per project.
4. User picks the top item to implement.

**Technical Approach**: Scoring service (API or client-side) that combines AI effort/dependency output with rules; store preferred order; Kanban or list view sorted by score.

**Dependencies**: Tickets/ideas with minimal metadata; optional git integration.

**Effort**: M  
**Impact**: 🔥🔥  
**Success Metrics**: Use of “suggested order”; correlation between order and completion rate.

---

#### 4. Command Palette (⌘K)

**Problem**: Navigation and actions are scattered across tabs and buttons; power users want to open projects, run “Analyze,” or jump to Ideas without clicking through the UI.

**Solution**: A global command palette (⌘K / Ctrl+K) with fuzzy search over projects, prompts, ideas, tickets, and actions (e.g. “Analyze current project,” “New idea,” “Run Implement All”). Recent items and AI-suggested next actions appear at the top.

**AI Integration**: Optional “suggest next action” based on current route and recent activity (e.g. “You just analyzed Backend — run Implement All?”). Model receives minimal context (current project, last action) and returns 1–3 suggested commands; display as chips in the palette.

**User Flow**:
1. User presses ⌘K anywhere in the app.
2. Palette opens with search; user types “analyze” or “project X.”
3. Matching projects, prompts, and actions are listed; user selects one.
4. App navigates or runs the action; palette closes.

**Technical Approach**: Radix Dialog or custom modal; keyboard handling (⌘K, Escape, arrows); fuse.js or similar for fuzzy search over a normalized list of entities and actions; optional API call for AI suggestions when palette opens.

**Dependencies**: Central list of navigable entities and runnable actions; global keyboard listener.

**Effort**: M  
**Impact**: 🔥🔥🔥  
**Success Metrics**: Daily palette opens; % of actions triggered from palette vs. UI.

---

#### 5. Advanced Search with Semantic Understanding

**Problem**: Keyword search misses “auth” when the user wrote “login and permissions.”

**Solution**: Search that combines keyword match with semantic similarity (embeddings) over project docs, ideas, and tickets. Results show a snippet and relevance score; filters by type (doc, idea, ticket).

**AI Integration**: Embed documents and short texts with OpenAI (or local) embeddings; store vectors in SQLite (e.g. sqlite-vec) or a small vector DB; query embeds the search phrase and runs similarity search; optionally rerank top-K with an LLM for better ordering.

**User Flow**:
1. User types in the global search bar or in a project-scoped search.
2. Results update as they type (debounced); results are grouped by type.
3. User clicks a result; app navigates to the item and highlights the snippet.
4. Optional: “Similar items” on an idea or ticket detail page.

**Technical Approach**: Embedding pipeline (batch for existing data, on-the-fly for new); vector store (SQLite extension or dedicated); search API that returns IDs + snippets; UI: search input, result list, highlight in detail view.

**Dependencies**: Embedding API or local model; vector storage.

**Effort**: L  
**Impact**: 🔥🔥🔥  
**Success Metrics**: Search usage; click-through rate from search to item.

---

#### 6. One-Click Project Scaffolding

**Problem**: Starting a new project still requires manual setup of folders, cursor docs, and first prompts.

**Solution**: “Scaffold project” from a template (e.g. Next.js + Tauri, or “docs-only”) that creates folder structure, `.cursor/` files (worker, prompts, tickets placeholder), and optional first prompts. User picks template and project name; everything is created in a chosen path.

**AI Integration**: Optional: after scaffold, run a single “customize for my stack” prompt that fills in tech stack and conventions in worker.md and setup docs.

**User Flow**:
1. User clicks “New project” and chooses “From template.”
2. User selects template (e.g. “Next.js + Tauri”), name, and path.
3. App creates directories and files; progress is shown.
4. User opens the project in the app; optional “Customize with AI” step.

**Technical Approach**: Template definitions (file trees + placeholders) in `.cursor/templates/` or config; Node script or Tauri command to write files; reuse existing “New project” flow with template selector.

**Dependencies**: File write access (Tauri or Node); template specs.

**Effort**: M  
**Impact**: 🔥🔥  
**Success Metrics**: Number of projects created from template; time to first “Implement” run.

---

#### 7. Git Integration (Branch-per-Feature, Auto-Commit, PR Draft)

**Problem**: Users implement from tickets but don’t tie commits or branches to tickets; PRs are written by hand.

**Solution**: When starting work on a ticket, offer “Create branch” (e.g. `ticket/123-short-title`). After Implement All or manual work, offer “Commit changes” with a generated message from the ticket. Optional: “Draft PR” that creates a PR with ticket title and description.

**AI Integration**: Commit message and PR body can be generated by LLM from ticket title + description + optional diff summary; user edits before committing.

**User Flow**:
1. User selects a ticket and clicks “Start” or “Implement.”
2. App suggests creating a branch; user confirms; branch is created and checked out.
3. User runs Implement All or edits code; when done, clicks “Commit.”
4. App suggests commit message; user edits and commits; optional “Open PR” creates draft PR.

**Technical Approach**: Git commands via Tauri (shell or libgit2) or Node; branch naming convention; API or local script for commit/PR; integrate into Run tab and ticket card actions.

**Dependencies**: Git available; repo is the project root or known path.

**Effort**: L  
**Impact**: 🔥🔥🔥  
**Success Metrics**: % of tickets with a linked branch/commit; time to first commit after “Implement.”

---

#### 8. Usage Analytics Dashboard

**Problem**: No visibility into which features (prompts, Analyze, Implement All, ideas) are used or where users drop off.

**Solution**: A simple analytics view (admin or self-hosted only): counts of runs by type (analyze, implement, prompt), by project, and over time; list of most-used prompts and recent runs. No PII; data stays local or in the user’s DB.

**AI Integration**: Optional “insights” card: “You use Implement All most on Tuesdays” or “Backend tab runs have the highest completion rate”—simple aggregates or a single LLM call over summarized stats.

**User Flow**:
1. User opens “Analytics” or “Usage” in settings or a dedicated tab.
2. Dashboard shows charts (runs per day, by type, by project) and top prompts.
3. User can filter by date range; data is read-only.
4. Optional: export CSV for external analysis.

**Technical Approach**: Event logging (run type, project id, timestamp) in existing store or DB; aggregation queries; charts with a small library (e.g. Recharts) or simple tables; respect “no telemetry” if configured.

**Dependencies**: Persistent store or DB for runs; optional feature flag for analytics.

**Effort**: M  
**Impact**: 🔥🔥  
**Success Metrics**: Use of dashboard; decisions made from data (e.g. deprecating a prompt).

---

#### 9. Context-Aware Suggestions (Next Action)

**Problem**: After an action (e.g. “Analyze backend”), users don’t always know the logical next step.

**Solution**: A “Suggested next” card or inline hint that recommends one to three actions based on current context: last run type, current tab, and project state. E.g. “You just analyzed Backend — run Implement All for ticket #3?” or “You have 5 untagged ideas — add tags?”

**AI Integration**: LLM receives: last action, current route, project id, and a short list of available actions. Returns 1–3 suggestions with short labels. Cache by context hash to limit calls. Fallback: rule-based (e.g. if last = analyze → suggest implement).

**User Flow**:
1. User finishes an action (e.g. Analyze, or views a ticket).
2. “Suggested next” appears in the Run tab or sidebar.
3. User clicks a suggestion; the corresponding action runs or navigates.
4. User can dismiss; feedback (used/dismissed) can tune rules or model.

**Technical Approach**: Context builder (last run, route, project); API or client call to suggestion service; UI component that shows 1–3 buttons; store “last action” and optional feedback.

**Dependencies**: Run history and route info; list of suggestible actions.

**Effort**: M  
**Impact**: 🔥🔥  
**Success Metrics**: Suggestion click-through rate; correlation with faster “analyze → implement” flow.

---

#### 10. API Playground (Test Endpoints, Inspect Responses)

**Problem**: Internal or future APIs (e.g. run step, tag ideas) are hard to try without the full UI.

**Solution**: A simple API playground: dropdown of endpoints, method, and body editor (JSON); “Send” and response viewer (status, headers, body). Optional: save requests as examples or link to a prompt that calls the API.

**AI Integration**: Optional “Generate example request” from endpoint schema or docs; or “Explain this response” for a selected snippet.

**User Flow**:
1. User opens “API Playground” (e.g. in Setup or Dev tab).
2. User selects an endpoint (e.g. POST /api/run/step), edits body, clicks Send.
3. Response is shown; user can copy or save.
4. Optional: generate a curl or fetch snippet.

**Technical Approach**: List of routes from config or discovery; form with method/url/body; fetch from client or Tauri; response viewer with syntax highlight; no new backend beyond existing APIs.

**Dependencies**: Documented or discoverable API list.

**Effort**: S  
**Impact**: 🔥  
**Success Metrics**: Use by developers; fewer “how do I call X?” questions.

---

#### 11. Hot Reload / Instant UI Updates

**Problem**: After changing prompts or config, users refresh the whole app to see updates.

**Solution**: Where possible, use Next.js HMR and reactive store so that edits to prompts, tickets, or ideas (e.g. in `.cursor/` or data files) are reflected without full reload. For Tauri, optional file watcher that reloads or re-fetches affected data.

**AI Integration**: None directly; improves perceived speed of AI workflows (change prompt → see result without losing state).

**User Flow**:
1. User edits a file (e.g. worker.md) or data in the app.
2. UI updates within 1–2 seconds without manual refresh.
3. For external file edits, optional toast: “Project config changed — reload?”

**Technical Approach**: Store subscriptions and re-fetch on focus or interval; optional Tauri fs watcher; Next.js already supports HMR for React; ensure store hydration doesn’t overwrite in-memory edits.

**Dependencies**: Clear ownership of “source of truth” (file vs. store).

**Effort**: M  
**Impact**: 🔥🔥  
**Success Metrics**: Reduction in full page reloads; user satisfaction with “instant” feel.

---

#### 12. OAuth / GitHub (and GitLab) Integration

**Problem**: Repos and PRs are manual; no “list my repos” or “open PR” from the app.

**Solution**: Optional OAuth with GitHub (and later GitLab): connect account, list repos, clone or link repo to a project, and “Open PR” that opens the PR in the browser or uses API to create draft. Tokens stored locally; no server-side auth required for MVP.

**AI Integration**: Optional: “Describe my recent commits” or “Suggest PR title” from commit messages via LLM.

**User Flow**:
1. User goes to Settings → Integrations → GitHub, clicks Connect.
2. User authorizes; app stores token (local or env); repos are listed.
3. When creating a project, user can “Import from GitHub” and pick repo.
4. From a ticket, “Open PR” uses branch/commit and opens GitHub PR page or creates draft via API.

**Technical Approach**: OAuth flow (client-side or minimal backend); store token securely (Tauri secure storage or env); GitHub API for repos and PRs; UI for connection status and repo picker.

**Dependencies**: GitHub app or OAuth app; user consent and token handling.

**Effort**: L  
**Impact**: 🔥🔥🔥  
**Success Metrics**: Number of connected accounts; “Open PR” usage.

---

#### 13. Slack/Discord Webhooks (Notifications, Bot Commands)

**Problem**: Users want “Implement All finished” or “New idea added” in a channel without polling the app.

**Solution**: Optional webhook URL per project or global: on run complete, idea created, or ticket moved, send a small JSON payload to the webhook. Optional: Discord/Slack bot that accepts “run analyze for project X” and replies with a link or summary.

**AI Integration**: Optional: bot uses LLM to summarize “Implement All finished” (e.g. “3 files changed, 2 tests added”) before posting.

**User Flow**:
1. User adds webhook URL in project settings or global settings.
2. On run complete or key events, app POSTs to the URL.
3. User sees a message in Slack/Discord with project name and link.
4. Optional: user types “/run-prompts analyze ProjectName” and bot triggers run and replies.

**Technical Approach**: Event hooks in run store and idea/ticket APIs; queue or fire-and-forget POST; optional bot process (separate or Tauri sidecar) that listens and calls app API or runs agent.

**Dependencies**: Webhook config storage; optional bot hosting.

**Effort**: M  
**Impact**: 🔥🔥  
**Success Metrics**: Webhooks configured; delivery success rate; bot command usage.

---

## 3. Tier 2 — Medium-Term Innovation (3–6 Months)

#### 14. Agent Collaboration Workflows (Architect → Frontend → Backend → QA)

**Problem**: One agent does everything; quality and specialization suffer.

**Solution**: Multi-agent pipelines where “architect” produces a plan, “frontend” and “backend” agents implement, and “QA” suggests or generates tests. Handoffs are structured (e.g. plan document, file list) so each agent has clear input.

**AI Integration**: Per-agent system prompts (from `.cursor/agents/`); orchestration layer that runs agents in sequence or parallel and passes outputs; optional human approval between steps.

**User Flow**: User selects “Full stack implementation”; app runs architect → frontend + backend (parallel) → QA; user reviews each stage and can re-run or edit.  
**Technical Approach**: Job queue or state machine; agent runner per type; shared context (plan, file paths).  
**Dependencies**: Agent definitions and run infrastructure.  
**Effort**: L | **Impact**: 🔥🔥🔥

---

#### 15. Vector Database for Project Docs (Semantic Search, RAG)

**Problem**: Long docs and many ideas aren’t searchable by meaning.

**Solution**: Embed all project docs, ADRs, and key ideas into a vector store (e.g. SQLite with sqlite-vec, or Pinecone/Weaviate). Semantic search and RAG for “answer from my docs” in the app and for agent context.

**AI Integration**: RAG: query → retrieve top-K chunks → build prompt with chunks → LLM answer. Enables “Ask about this project” and injects doc snippets into Implement All context.

**User Flow**: User asks a question in a project; app returns an answer with “From: setup/architecture.md.” Agents can use the same retrieval when running.  
**Technical Approach**: Embedding pipeline; vector index; retrieval API; optional reranker.  
**Dependencies**: Embeddings and vector storage (Tier 1 idea #5 can share this).  
**Effort**: L | **Impact**: 🔥🔥🔥

---

#### 16. Custom Workflow Builder (Drag-Drop Nodes, Triggers)

**Problem**: Fixed chains don’t fit every team’s process.

**Solution**: Visual workflow editor: nodes (prompt, branch, delay, webhook, “run agent”), edges, and triggers (manual, schedule, file change). Users build flows like “On new idea → tag → notify” or “Every Monday → suggest tickets.”

**AI Integration**: Nodes can be “LLM step” with configurable prompt; “Classifier” node for routing.  
**User Flow**: User opens Workflow editor, drags nodes, connects them, sets trigger, saves. Flow runs in background or on demand.  
**Technical Approach**: Flow runtime (execute DAG); persistence; UI (React Flow or similar).  
**Dependencies**: Event system and job runner.  
**Effort**: L | **Impact**: 🔥🔥

---

#### 17. Session Sharing (Invite Collaborator to Live Session)

**Problem**: Solo use only; no way to “pair” on a run or project.

**Solution**: “Share session” generates a link; another user opens it and sees the same project and run state (read-only or live). Optional: cursor presence (who’s viewing), chat, or “request control.”

**AI Integration**: Optional: shared AI chat so both users see the same thread.  
**User Flow**: User A clicks Share → copy link; User B opens link and sees current view; optionally both see run output in real time.  
**Technical Approach**: Session IDs; sync layer (WebSocket or polling); conflict-free state if editable.  
**Dependencies**: Auth/identity; real-time backend.  
**Effort**: L | **Impact**: 🔥🔥

---

#### 18. Automated Documentation Generation (Code → Markdown)

**Problem**: Docs drift from code; ADRs and setup docs are manual.

**Solution**: On demand or on commit, run a pipeline that generates or updates markdown from code (e.g. API from routes, component list from `src/`). Store in `.cursor/docs/` or `docs/` and optionally commit.

**AI Integration**: LLM summarizes generated sections or writes “Overview” and “Getting started” from file structure and key exports.  
**User Flow**: User clicks “Refresh docs”; app runs generator and shows diff; user approves and saves.  
**Technical Approach**: Code parsers (AST or heuristics); template-based markdown; optional git write.  
**Dependencies**: Codebase access; doc templates.  
**Effort**: M | **Impact**: 🔥🔥

---

#### 19. Self-Improving Prompts (A/B Test Prompt Variations)

**Problem**: Prompts are tuned by guesswork; no data on which variant works better.

**Solution**: Run the same task with two prompt variants (A/B); compare outcomes (e.g. implement success, user edit distance). Store results and recommend the winning variant; optional auto-rotation for testing.

**AI Integration**: Metrics can include LLM-as-judge (e.g. “Which output is more complete?”) in addition to user actions.  
**User Flow**: Admin defines variant A and B for “Implement All”; next N runs are split; dashboard shows win rate and user preference.  
**Technical Approach**: Variant assignment; outcome logging; analysis script or dashboard.  
**Dependencies**: Run pipeline and metrics.  
**Effort**: M | **Impact**: 🔥🔥

---

#### 20. MCP (Model Context Protocol) Integration

**Problem**: Agents can’t use external tools (files, DB, APIs) in a standard way.

**Solution**: Integrate MCP servers: list tools, call them from the agent (e.g. “read_file”, “run_sql”), and stream results back. Users configure MCP servers in settings; worker prompt can say “use these MCP tools when relevant.”

**AI Integration**: Agent receives tool definitions and invokes them during a run; responses are passed back to the model for the next turn.  
**User Flow**: User adds MCP server URL or path; agent runs have access to “Filesystem” or “Database” tools; run logs show tool calls.  
**Technical Approach**: MCP client in Node or Tauri; tool registry; agent loop with tool use.  
**Dependencies**: MCP spec; server implementations.  
**Effort**: L | **Impact**: 🔥🔥🔥

---

## 4. Tier 3 — Moonshot / R&D Explorations (6–12 Months)

#### 21. Local LLM Integration (Ollama / llama.cpp via Tauri)

**Problem**: Cloud-only AI blocks offline and raises privacy/cost concerns.

**Solution**: Optional local inference via Tauri: call Ollama or llama.cpp binary, stream tokens into the UI. Use for tagging, suggestions, or full runs when the user prefers local.

**AI Integration**: Same “run step” interface; backend selects cloud vs. local based on model name or setting; prompt format normalized.  
**User Flow**: User installs Ollama and selects “Local” model in settings; runs use local model; fallback to cloud if unavailable.  
**Technical Approach**: Tauri command or Node child_process to Ollama API or CLI; streaming response handling; model picker in UI.  
**Dependencies**: Ollama or compatible runtime.  
**Effort**: L | **Impact**: 🔥🔥🔥

---

#### 22. Proactive Agent (Opens PRs, Suggests Next Ticket)

**Problem**: Users must remember to run agents and create PRs.

**Solution**: Background agent that monitors repo state (e.g. branch with changes, ticket “In progress”) and suggests “Ready to open PR?” or “Next suggested ticket: #7.” Optional: auto-open draft PR when branch is pushed and ticket is done.

**AI Integration**: Agent that reasons over tickets, branches, and diffs; generates PR title/body and suggests assignee.  
**User Flow**: User enables “Proactive agent”; gets notifications or in-app cards; one-click to open PR or start next ticket.  
**Technical Approach**: Scheduled or event-driven job; git and ticket API; notification layer.  
**Dependencies**: Git integration; notification channel.  
**Effort**: L | **Impact**: 🔥🔥

---

#### 23. Meta-Learning from All Projects (Patterns, Best Practices)

**Problem**: Each project is isolated; no learning from past work.

**Solution**: Anonymous or opt-in analytics across projects: which stacks, prompts, and ticket patterns lead to faster completion? Surface “Projects like yours often use X” and “Your completion rate is higher when you do Y first.”

**AI Integration**: Embeddings or stats over project metadata; clustering “similar projects”; LLM-generated tips from patterns.  
**User Flow**: User sees “Insights” card: “Teams with similar setup often add E2E after backend”; optional “Apply suggestion.”  
**Technical Approach**: Aggregation pipeline (privacy-preserving); pattern mining; insight generator.  
**Dependencies**: Multi-project data; user consent.  
**Effort**: L | **Impact**: 🔥🔥

---

#### 24. Voice-Driven Project Management (Natural Language Commands)

**Problem**: Hands-free or accessibility need for “run analyze” or “what’s next?”

**Solution**: Voice input that maps to commands: “Run implement all for ticket three,” “Open ideas,” “What did I do last week?” Use speech-to-text (browser or local) and a small NLU or LLM to map to actions.

**AI Integration**: LLM parses intent and entities from transcript; returns structured command (action, project, ticket id).  
**User Flow**: User clicks mic, speaks; app shows transcript and inferred command; user confirms; action runs.  
**Technical Approach**: Web Speech API or Whisper; intent parser; command dispatcher.  
**Dependencies**: Microphone; optional offline STT.  
**Effort**: L | **Impact**: 🔥

---

#### 25. One-Click Deploy to Vercel/Netlify/Railway

**Problem**: Projects stay local; no simple path to production.

**Solution**: “Deploy” button: connect Vercel/Netlify/Railway (OAuth), select project and repo, trigger deploy. Show build log and live URL; optional env and branch config.

**AI Integration**: Optional: “Suggest env vars” from codebase scan or LLM.  
**User Flow**: User connects deploy provider once; for a project, clicks Deploy; app triggers build and shows status and URL.  
**Technical Approach**: Provider APIs; token storage; deploy trigger and status polling.  
**Dependencies**: Provider accounts and APIs.  
**Effort**: L | **Impact**: 🔥🔥

---

## 5. Technical R&D Explorations

- **Local LLM Integration**: Ollama/llama.cpp via Tauri for offline AI (see Tier 3 #21).
- **WebSocket Streaming**: Real-time token streaming for AI responses to improve perceived speed.
- **Vector Embeddings & RAG**: Semantic search over project knowledge (Tier 1 #5, Tier 2 #15); sqlite-vec or Pinecone/Weaviate.
- **Prompt Caching**: Cache frequent prompt prefixes to reduce cost and latency (e.g. system prompt + project context).
- **CRDT-based Collaboration**: Conflict-free real-time editing (Yjs/Automerge) for shared sessions (Tier 2 #17).
- **IndexedDB for Offline**: Full offline capability with sync when online; critical for desktop-first.
- **MCP (Model Context Protocol)**: Integrate MCP servers for richer agent tool use (Tier 2 #20).
- **Plugin System**: User extensions (API + optional marketplace) for custom nodes, prompts, and integrations.
- **End-to-End Encryption**: Encrypt user data at rest and in transit for sensitive projects.
- **Audit Logs**: Track all runs and config changes for compliance and debugging.

---

## 6. UX Innovation Ideas

**Command & Control**

- **Command Palette (⌘K)** — Tier 1 #4: fuzzy search across entities, AI-suggested next actions.
- **Quick Actions**: Context-sensitive shortcuts (right-click, hotkeys) on tickets, ideas, and runs.
- **Breadcrumb Navigation**: Persistent “Project → Tab → Item” so users always know where they are.
- **Recent History**: “Recently viewed” projects, ideas, and tickets in sidebar or palette.

**Visualization & Organization**

- **Spatial Canvas**: Infinite canvas to arrange projects, features, and tickets (e.g. Excalidraw-style).
- **Timeline View**: Chronological activity (runs, ideas, commits) per project.
- **Dependency Graph**: Visualize ticket/idea dependencies and blockers.
- **Mind Map Mode**: Brainstorm ideas in a tree (e.g. for Ideas tab).

**Focus & Productivity**

- **Focus Mode**: Hide sidebar and non-essential UI; show only current task.
- **Do Not Disturb**: Mute notifications during deep work.
- **Zen Mode**: Distraction-free writing for prompts and ideas.

**Personalization**

- **Custom Dashboards**: Drag-drop widgets (recent runs, top prompts, suggested ticket).
- **Themes**: Beyond light/dark (custom color schemes).
- **Layout Preferences**: Sidebar position, compact/comfortable density.
- **AI Chat Sidebar**: Persistent chat that understands full project context.

**Accessibility**

- **High Contrast Mode**: For visually impaired users.
- **Screen Reader Optimization**: Full ARIA and semantic markup.
- **Keyboard Navigation**: 100% keyboard-accessible (palette, tabs, lists).

---

## 7. Competitive Analysis Matrix

| Feature | run-prompts (Current) | run-prompts (Planned) | Cursor | GitHub Copilot | Windsurf | Linear | Notion |
|--------|------------------------|------------------------|--------|----------------|----------|--------|--------|
| AI Code Generation | ✅ (via agents) | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Multi-Agent Workflows | ❌ | 🚧 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Project + Prompt + Ticket Hub | ✅ | ✅ | ❌ | ❌ | ❌ | Partial | Partial |
| Kanban / Tickets | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Command Palette (⌘K) | ❌ | 🚧 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Local LLM Support | ❌ | 🚧 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Real-Time Collaboration | ❌ | 🚧 | ✅ | ❌ | ✅ | ✅ | ✅ |
| Native Desktop (Tauri) | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Worker Prompt + Implement All | ✅ | ✅ | Partial | ❌ | Partial | ❌ | ❌ |
| Ideas + AI Ideas | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| API Access | ❌ | 🚧 | ✅ | ✅ | ❌ | ✅ | ✅ |
| Self-Hosting / Local-First | ✅ (data local) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legend**: ✅ = Shipped | 🚧 = Planned | ❌ = Not Available

**Key Insights**

- run-prompts’ niche is **orchestration**: project context, worker prompt, tickets, and agent runs in one place. Cursor and Copilot focus on editing; Linear/Notion on tasks/docs. Combining “run AI from here” with “manage projects and tickets” is the differentiator.
- **Table stakes**: Command palette, good search, and reliable runs. **Differentiators**: Local-first, optional local LLM, MCP, and deep Cursor/workflow integration.
- **Gaps to close**: Real-time collab, API for integrations, and richer multi-agent flows.

---

## 8. Prioritization Framework

**Scoring Formula**

```
Priority Score = (Impact × Feasibility × Strategic Alignment) / Effort
```

**Definitions**

- **Impact**: 1–5 (How much does this move the needle for users?)
- **Feasibility**: 1–5 (Can we build this with current tech/team?)
- **Strategic Alignment**: 1–5 (Does this advance the vision: project cockpit, AI-native, desktop-first?)
- **Effort**: 1–5 (1 = days, 5 = months)

**Scoring Matrix (Sample)**

| Idea | Impact | Feasibility | Alignment | Effort | Score | Priority |
|------|--------|-------------|-----------|--------|------|----------|
| Intelligent Prompt Chaining | 5 | 4 | 5 | 3 | 33.3 | P0 |
| Command Palette (⌘K) | 5 | 4 | 5 | 2 | 50 | P0 |
| Semantic Search | 5 | 3 | 5 | 4 | 18.75 | P1 |
| Git Integration (branch, commit, PR) | 5 | 4 | 5 | 4 | 25 | P0 |
| OAuth / GitHub | 5 | 4 | 5 | 4 | 25 | P0 |
| Agent Collaboration Workflows | 5 | 3 | 5 | 5 | 15 | P1 |
| MCP Integration | 5 | 3 | 5 | 4 | 18.75 | P1 |
| Local LLM (Ollama) | 5 | 3 | 5 | 4 | 18.75 | P1 |
| Session Sharing | 4 | 3 | 4 | 5 | 9.6 | P2 |
| Voice Commands | 3 | 3 | 3 | 4 | 6.75 | P3 |

**Priority Buckets**

- **P0 (Must Have)**: Score ≥ 25 — Build in next 1–3 months.
- **P1 (Should Have)**: Score 15–24 — Next 3–6 months.
- **P2 (Nice to Have)**: Score 10–14 — Backlog.
- **P3 (Wishlist)**: Score < 10 — Archive or long-term R&D.

---

## 9. Ranked Backlog (Top 15 Ideas)

1. **Command Palette (⌘K)** (Tier 1 #4) — Priority Score: 50 — Impact: 🔥🔥🔥
2. **Intelligent Prompt Chaining** (Tier 1 #1) — Priority Score: 33.3 — Impact: 🔥🔥🔥
3. **Git Integration (branch, commit, PR)** (Tier 1 #7) — Priority Score: 25 — Impact: 🔥🔥🔥
4. **OAuth / GitHub Integration** (Tier 1 #12) — Priority Score: 25 — Impact: 🔥🔥🔥
5. **Advanced Search with Semantic Understanding** (Tier 1 #5) — Priority Score: 18.75 — Impact: 🔥🔥🔥
6. **MCP Integration** (Tier 2 #20) — Priority Score: 18.75 — Impact: 🔥🔥🔥
7. **Local LLM (Ollama)** (Tier 3 #21) — Priority Score: 18.75 — Impact: 🔥🔥🔥
8. **Agent Collaboration Workflows** (Tier 2 #14) — Priority Score: 15 — Impact: 🔥🔥🔥
9. **Vector DB for Project Docs / RAG** (Tier 2 #15) — Priority Score: 15 — Impact: 🔥🔥🔥
10. **Auto-Categorization and Tagging** (Tier 1 #2) — Priority Score: 14 — Impact: 🔥🔥
11. **Smart Scheduling and Prioritization** (Tier 1 #3) — Priority Score: 14 — Impact: 🔥🔥
12. **One-Click Project Scaffolding** (Tier 1 #6) — Priority Score: 13 — Impact: 🔥🔥
13. **Context-Aware Suggestions** (Tier 1 #9) — Priority Score: 12 — Impact: 🔥🔥
14. **Usage Analytics Dashboard** (Tier 1 #8) — Priority Score: 11 — Impact: 🔥🔥
15. **Slack/Discord Webhooks** (Tier 1 #13) — Priority Score: 11 — Impact: 🔥🔥

---

## 10. Idea Lifecycle Management

**How Ideas Move Through the Pipeline**

```
💡 Proposed → 🔍 Researched → ✅ Validated → 🚧 In Progress → 🚀 Shipped → 📊 Measured
```

**Stage Definitions**

- **💡 Proposed**: New idea; needs research and feasibility check.
- **🔍 Researched**: Feasibility assessed; requirements and dependencies documented.
- **✅ Validated**: User feedback or spike confirms value; greenlit for build.
- **🚧 In Progress**: In active development.
- **🚀 Shipped**: Deployed; available to users.
- **📊 Measured**: Success metrics tracked; iterate or pivot based on data.

**Rejection Criteria (When to Archive)**

- Low user demand (validated via surveys or interviews).
- Technical infeasibility with current stack or team.
- Strategic misalignment with vision (project cockpit, AI-native, desktop-first).
- Resource constraints (timeline or team size make it unsustainable).

---

## 11. User Feedback Integration

**Feedback Channels**

- In-app feedback widget (e.g. thumbs up/down + optional comment on runs or features).
- GitHub Issues / Discussions for bugs and feature requests.
- User interviews (1-on-1, ~30 min) for power users.
- Quarterly surveys (NPS + feature request ranking).
- Community Discord/Slack for async discussion.

**Feedback Processing**

1. Triage weekly: tag by category (bug, feature, enhancement).
2. Cluster similar requests to find patterns.
3. Add novel, aligned ideas to this document (with Proposed status).
4. Reply to users (acknowledge and set expectations).
5. Prioritize using the framework in §8.

**Closing the Loop**

- When an idea ships, notify requesters (e.g. in release notes or email).
- Call out community contributions in changelogs.
- Offer beta access or early previews to power users who suggested or validated the idea.

---

## 12. Innovation Experiments

**A. Feature Flags**

- Ship features to a subset of users (e.g. 10%); measure engagement and feedback; roll out to 100% or roll back.

**B. Prototyping**

- Build low-fidelity mockups (Figma, Excalidraw); share with 5–10 users; iterate before coding.

**C. Dogfooding**

- Use run-prompts internally for all project and prompt management; find pain points and fix before wider release.

**D. Beta Programs**

- Invite power users to test unreleased features (e.g. Command Palette, prompt chaining); trade early access for structured feedback.

**E. Spike Projects**

- Timebox research (1–2 days); prove or disprove feasibility (e.g. local LLM, MCP); document learnings and go/no-go.

---

## 13. Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|----------------------|
| **Scope Creep** | High | High | Strict prioritization (§8–9); MVP-first; timeboxing. |
| **Technical Debt** | Medium | High | Code reviews; refactoring sprints; automated tests (Playwright, unit). |
| **User Adoption** | Medium | High | User research; beta testing; clear onboarding and docs. |
| **AI Cost Overruns** | Medium | Medium | Caching; cheaper models for tagging/suggestions; rate limits. |
| **Security Vulnerabilities** | Low | Critical | Secure token storage; no secrets in logs; optional security review. |
| **Team Burnout** | Medium | High | Sustainable pace; clear P0/P1; say no to low-value work. |

---

## Appendix: Idea Template

Use this template when proposing new ideas:

```markdown
#### [Idea Name]

**Problem**:
**Solution**:
**AI Integration**:
**User Flow**:
**Technical Approach**:
**Dependencies**:
**Effort**:
**Impact**:
**Success Metrics**:
```

---

*This ideas document is a living roadmap. Update it as priorities shift and new opportunities emerge.*
