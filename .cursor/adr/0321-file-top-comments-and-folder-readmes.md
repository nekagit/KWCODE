# ADR 0321 — File-top comments and folder READMEs

## Status

Accepted.

## Context

- The codebase has many source files and folders; new contributors and tooling benefit from a brief file-level description and folder-level summary without per-function docstrings.
- A plan (file_comments_and_folder_readmes) defines: one short file-top comment per source file (TS, TSX, RS, MJS, SH) and a README.md in every folder that contains source or is a meaningful module.

## Decision

1. **File-top comment**
   - One JSDoc block (2–4 lines) at the top of each `.ts`/`.tsx` file, immediately after `"use client";` (if present) and before the first `import`. Describes what the file is and its role. No docstrings on every function.
   - Rust: `//!` module doc at the very top. Shell: short comment block after shebang. Node scripts: `/** ... */` or `//` at top. Test files: one-line comment is enough.

2. **Folder README**
   - `README.md` in each directory that contains source or is a meaningful module: 2–6 sentences on what the folder contains and how it fits in the app. No listing of every file.

3. **Phases**
   - Phase 1: `src/lib`, `src/store`, `src/types`, `src/context`, `src/data` (READMEs + file comments).
   - Phase 2: `src/components` (all layers and key subfolders).
   - Phase 3: `src/app` (pages + API routes).
   - Phase 4: `script/`, `src-tauri/`.

4. **Rules**
   - Do not change behavior or logic; only add comments and READMEs. Preserve directive order (e.g. `"use client";` first). Skip generated/minified files.

## Consequences

- Easier onboarding and navigation; consistent file-level documentation. All four phases implemented: Phase 1 (lib, store, types, context, data), Phase 2 (components), Phase 3 (app pages and API), Phase 4 (script, src-tauri). Helper script: `script/add-file-comments.mjs` for adding file-top JSDoc to a directory.
