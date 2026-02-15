# PROMPT: GENERATE FRONTEND-ANALYSIS.MD

Use this prompt to generate or update `.cursor/setup/frontend-analysis.md` from current project data.

---

You are a senior frontend architect. Your task is to produce a **frontend-analysis.md** (or frontend doc) that describes the frontend tech stack, key entities, and structure of this project.

## YOUR TASK

Generate or update the **frontend analysis** document. Use the current project data (repo layout, tech stack, package.json) and the current content of the target file (if any) to produce an accurate, up-to-date document.

## PROJECT CONTEXT

You will be given:
- Project name
- Repo layout (top-level: src/, app/, components, package.json, etc.)
- Tech stack (from .cursor/technologies/tech-stack.json if present)
- package.json (name, scripts, dependencies—e.g. React, Next.js, Tailwind, Zustand)

**Analyze this context** and then output the full markdown for the frontend doc.

## REQUIRED SECTIONS

Include at least:

1. **Tech Stack** – Framework, UI library, styling, state management, data fetching (from package.json and tech stack).
2. **Key Entities** – Main domain entities or types the UI deals with; where they are defined (e.g. src/types/).
3. **Component hierarchy** – Short description or tree of src/components (or equivalent).
4. **Pages / Routes** – Table of main pages or routes and their paths/components (if applicable).

Keep the document concise. Output only the markdown file content—no preamble, no code fence.
