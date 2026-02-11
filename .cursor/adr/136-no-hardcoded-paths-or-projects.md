# ADR 136: No hardcoded paths or projects

## Status

Accepted (2026-02-11)

## Context

The codebase previously relied on hardcoded paths (e.g. `~/Documents/February`) and a hardcoded list of project names in source. This:

- Tied the app to one machine layout and naming
- Made reuse in other environments or repos difficult
- Caused build issues when Cargo/Tauri picked up paths from another project (e.g. `automated_development`)

## Decision

- **Paths**: Do not hardcode any absolute path or fixed directory name. Resolve the “projects root” only via:
  1. `data/february-dir.txt` (one line, absolute path) — highest priority
  2. `FEBRUARY_DIR` environment variable (or from `.env`)
  3. Parent of current working directory / project root as fallback
- **Projects**: Do not hardcode project names in source. Repos overview is config-driven:
  - Default: empty list
  - Optional: `data/february-repos-overview.json` served by `GET /api/data/february-repos-overview`
- **UI copy**: Use generic wording (“configured projects directory”) instead of specific path or folder names.

## Consequences

- App works in any environment by setting `data/february-dir.txt` or `FEBRUARY_DIR`.
- No dependency on `~/Documents/February` or on a fixed list of repo names in code.
- Tauri build no longer resolves paths from another project’s target dir when config is set correctly.
- Optional repos overview can be provided via JSON for documentation/UX without code changes.

## References

- `src/app/api/data/february-folders/route.ts` — path resolution (file, env, cwd parent only)
- `src-tauri/src/lib.rs` — `resolve_february_dir()` and `list_february_folders` (no `Documents/February` fallback)
- `src/data/february-repos-overview.ts` — empty default; type and API for optional JSON
- `src/app/api/data/february-repos-overview/route.ts` — serves optional `data/february-repos-overview.json`
