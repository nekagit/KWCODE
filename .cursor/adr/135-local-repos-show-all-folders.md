# 135 – Local repos: show all February folders

## Status

Accepted.

## Context

The "Local repos" section on the Projects page was not showing all repos/folders under Documents/February. Causes:

1. **Tauri `list_february_folders`**: Only pushed a folder when `path.canonicalize()` succeeded; some dirs were skipped. Also, the "February" directory was only taken as parent of project root, which can be wrong when the app runs from a different cwd or from a bundle.
2. **API**: Single source (cwd parent) could miss folders if the server ran from a different root.

## Decision

- **Multiple February directory candidates (Tauri and API):**
  1. `FEBRUARY_DIR` env var if set and the path exists.
  2. `~/Documents/February` (HOME or USERPROFILE + `/Documents/February`).
  3. Parent of project root (Tauri) or parent of `process.cwd()` (API).
- **Merge:** List subdirectories from every candidate that exists; deduplicate by path string; sort. So folders are never missed if any candidate is the correct February folder.
- **Per-dir listing:** Include every subdirectory; if canonicalize/realpath fails, still include the path (no silent skip).
- **UI:** Local repos ScrollArea max height increased to 480px.

## Follow-up (missing projects)

- **Canonical February path:** All candidate dirs (FEBRUARY_DIR, ~/Documents/February, parent of project root) are canonicalized before use so we always list the real February directory, not a symlink or alternate path that might point to a subset.
- **Include symlinks:** Entries that are symlinks are now included (in addition to directories) so symlinked project folders are never skipped.
- **API:** Same logic—candidates normalized with realpathSync where possible; listSubdirPaths includes both directories and symbolic links.

## Consequences

- All February subfolders appear even when app runs from a different cwd or when only one of the candidate paths is correct.
- User can set `FEBRUARY_DIR` to the exact February path to force which folder is used (and still get merged results if multiple candidates exist).
- Symlinks and dirs that fail canonicalize/realpath are still listed.
- Using the canonical parent of project root ensures we list the same February that contains `automated_development`, so no folders are missed.
