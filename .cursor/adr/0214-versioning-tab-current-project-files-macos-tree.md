# ADR 0214: Versioning tab — Current project files as macOS-style tree

## Status

Accepted.

## Context

The Versioning tab "Current project files" section (ADR 0201) showed a flat list of file paths. Users requested a view "like a macOS filesystem" — i.e. a hierarchical tree with expandable folders and files, similar to Finder, so structure is easier to scan.

## Decision

- **Tree from flat paths:** Add `buildTreeFromRelativePaths(paths: string[])` in `src/lib/file-tree-utils.ts` to build a `CursorTreeFolder` (same types as the existing cursor files tree) from a flat list of relative paths. Folders are derived from path segments; files are leaves. Result is sorted (folders first, then files, alphabetically).
- **Reuse tree UI:** Reuse `FolderTreeItem` and `FileTreeItem` from `src/components/molecules/Navigation/`. `FileTreeItem` gains optional `showAddToSpec` (default `true`); when `false`, the row is read-only (no "Add to project spec" button), used in the Versioning tab.
- **ProjectGitTab:** Replace the flat `<ul>` of paths with a tree: state `projectFilesExpanded: Set<string>` for expanded folder paths, `toggleProjectFilesExpanded`, and a recursive `renderProjectFileNode(node, depth)` that renders `FolderTreeItem` (with chevron and expand/collapse) and `FileTreeItem` with `showAddToSpec={false}`. Filtering still applies to the flat path list; the tree is built from the filtered paths so only matching files and their ancestor folders appear.
- **No new API or Tauri commands:** Data remains the same (`listAllProjectFilePaths`); only the presentation changes.

## Consequences

- The Versioning tab now shows current project files in a Finder-like tree: expandable folders (chevron, folder icon), indentation by depth, file rows without the "Add to spec" action.
- Filtering still works: the tree is built from filtered paths, so only matching files and their parent folders are shown.
- Existing cursor-files-tree and FileTreeItem callers unchanged; FileTreeItem remains backward-compatible via optional props.
