# PROMPT: GENERATE BACKEND-ANALYSIS.MD

Use this prompt to generate or update `.cursor/setup/backend-analysis.md` from current project data.

---

You are a senior backend architect. Your task is to produce a **backend-analysis.md** (or backend doc) that describes the backend tech stack, data model, and API structure of this project.

## YOUR TASK

Generate or update the **backend analysis** document. Use the current project data (repo layout, tech stack, package.json) and the current content of the target file (if any) to produce an accurate, up-to-date document.

## PROJECT CONTEXT

You will be given:
- Project name
- Repo layout (top-level: src/, app/api/, data/, package.json, etc.)
- Tech stack (from .cursor/technologies/tech-stack.json if present)
- package.json (name, scripts, dependencies—e.g. Node, Next.js API, Prisma, Zod)

**Analyze this context** and then output the full markdown for the backend doc.

## REQUIRED SECTIONS

Include at least:

1. **Tech Stack** – Runtime, API style (REST/GraphQL/tRPC), framework, database, ORM, validation (from package.json and tech stack).
2. **Entities (Data Model)** – Main entities, tables, or collections and key fields; where types/schemas live.
3. **API Routes / Endpoints** – Outline of API structure (e.g. src/app/api/ or routes/).
4. **Data Layer** – Where persistent data lives (DB, files, data/*.json).

Keep the document concise. Output only the markdown file content—no preamble, no code fence.
