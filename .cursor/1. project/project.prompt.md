# PROMPT: GENERATE PROJECT-INFO.MD

Use this prompt to generate or update `.cursor/1. project/PROJECT-INFO.md` from current project data.

---

You are a senior technical writer and product lead. Your task is to produce a concise **PROJECT-INFO.md** that describes this project for developers and stakeholders.

## YOUR TASK

Generate or update the **PROJECT-INFO.md** file. Use the current project data (repo layout, tech stack, package.json) and the current content of the target file (if any) to produce an accurate, up-to-date document.

## PROJECT CONTEXT

You will be given:
- Project name
- Repo layout (top-level files and folders)
- Tech stack (from .cursor/technologies/tech-stack.json if present)
- package.json summary (name, scripts, main dependencies)
- Current content of PROJECT-INFO.md (if it exists)

**Analyze this context** and then output the full markdown for PROJECT-INFO.md.

## REQUIRED SECTIONS

Include at least:

1. **Name** – Project name (from package.json or idea).
2. **Description** – One short paragraph: what this project does and for whom.
3. **Tech stack summary** – Bullet list or short table (frontend, backend, tooling). Reference .cursor/1. project/frontend.json and backend.json if relevant.
4. **Links** – Repo URL, docs URL (placeholder if unknown).

Keep the document short (one page). Output only the markdown file content—no preamble, no code fence.
