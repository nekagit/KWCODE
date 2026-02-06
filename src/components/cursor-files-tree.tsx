"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, Plus } from "lucide-react";

export type CursorFileEntry = { name: string; path: string };

type CursorTreeFolder = {
  type: "folder";
  name: string;
  path: string;
  children: CursorTreeNode[];
};

type CursorTreeFile = {
  type: "file";
  name: string;
  path: string;
};

type CursorTreeNode = CursorTreeFolder | CursorTreeFile;

function normalizePath(p: string) {
  return p.replace(/\\/g, "/");
}

function buildTree(
  cursorFiles: CursorFileEntry[],
  repoPath: string
): CursorTreeFolder | null {
  const normRepo = normalizePath(repoPath.trim().replace(/\/$/, ""));
  const base = normRepo + "/";
  let relativePaths = cursorFiles
    .map((f) => {
      const full = normalizePath(f.path);
      if (!full.startsWith(base)) return null;
      return full.slice(base.length);
    })
    .filter((p): p is string => p != null && p.length > 0);

  // Paths are like ".cursor/adr/001.md" or ".cursor/design.md"; strip ".cursor/" so we don't show .cursor twice
  relativePaths = relativePaths.map((p) =>
    p.startsWith(".cursor/") ? p.slice(".cursor/".length) : p
  );

  if (relativePaths.length === 0) return null;

  const root: CursorTreeFolder = {
    type: "folder",
    name: ".cursor",
    path: ".cursor",
    children: [],
  };

  function ensureFolder(parent: CursorTreeFolder, segment: string): CursorTreeFolder {
    let child = parent.children.find(
      (c): c is CursorTreeFolder => c.type === "folder" && c.name === segment
    );
    if (!child) {
      const folderPath = parent.path + "/" + segment;
      child = { type: "folder", name: segment, path: folderPath, children: [] };
      parent.children.push(child);
    }
    return child;
  }

  for (const rel of relativePaths) {
    const segments = rel.split("/");
    if (segments.length === 1) {
      root.children.push({
        type: "file",
        name: segments[0],
        path: ".cursor/" + rel,
      });
    } else {
      let parent: CursorTreeFolder = root;
      for (let i = 0; i < segments.length - 1; i++) {
        parent = ensureFolder(parent, segments[i]);
      }
      parent.children.push({
        type: "file",
        name: segments[segments.length - 1],
        path: ".cursor/" + rel,
      });
    }
  }

  sortNode(root);
  return root;
}

function sortNode(node: CursorTreeNode): void {
  if (node.type === "folder") {
    node.children.sort((a, b) => {
      const aIsFolder = a.type === "folder" ? 1 : 0;
      const bIsFolder = b.type === "folder" ? 1 : 0;
      if (aIsFolder !== bIsFolder) return aIsFolder - bIsFolder;
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    });
    node.children.forEach(sortNode);
  }
}

type CursorFilesTreeProps = {
  cursorFiles: CursorFileEntry[];
  repoPath: string;
  specFiles: { path: string }[];
  specFilesSaving: boolean;
  addToSpec: (f: CursorFileEntry) => void;
};

export function CursorFilesTree({
  cursorFiles,
  repoPath,
  specFiles,
  specFilesSaving,
  addToSpec,
}: CursorFilesTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set([".cursor"]));

  const root = useMemo(
    () => buildTree(cursorFiles, repoPath),
    [cursorFiles, repoPath]
  );

  const toggle = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  if (!root) return null;

  function renderNode(node: CursorTreeNode, depth: number) {
    const indent = depth * 16;

    if (node.type === "folder") {
      const isExpanded = expanded.has(node.path);
      return (
        <div key={node.path} className="select-none">
          <button
            type="button"
            onClick={() => toggle(node.path)}
            className="flex items-center gap-2 w-full rounded px-2 py-1.5 hover:bg-muted/50 text-left text-sm font-mono min-w-0"
            style={{ paddingLeft: 8 + indent }}
          >
            <span className="shrink-0 text-muted-foreground">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {isExpanded ? (
                <FolderOpen className="h-4 w-4" />
              ) : (
                <Folder className="h-4 w-4" />
              )}
            </span>
            <span className="truncate" title={node.path}>
              {node.name}
            </span>
          </button>
          {isExpanded &&
            node.children.map((child) => renderNode(child, depth + 1))}
        </div>
      );
    }

    const inSpec = specFiles.some((s) => s.path === node.path);
    return (
      <div
        key={node.path}
        className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50 min-w-0 group"
        style={{ paddingLeft: 8 + indent + 24 }}
      >
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="truncate flex-1 min-w-0 font-mono text-sm" title={node.path}>
          {node.name}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => addToSpec({ name: node.name, path: node.path })}
          disabled={inSpec || specFilesSaving}
          title={inSpec ? "Already in project spec" : "Add to project spec"}
        >
          {inSpec ? "Added" : (
            <>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {renderNode(root, 0)}
    </div>
  );
}
