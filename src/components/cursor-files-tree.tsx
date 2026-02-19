"use client";

/** cursor-files-tree component. */
import { useState, useMemo } from "react";
import { FolderTreeItem } from "@/components/molecules/Navigation/FolderTreeItem";
import { FileTreeItem } from "@/components/molecules/Navigation/FileTreeItem";
import { buildTree } from "@/lib/file-tree-utils";
import { type CursorFileEntry, type CursorTreeNode } from "@/types/file-tree";

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
    if (node.type === "folder") {
      const isExpanded = expanded.has(node.path);
      return (
        <div key={node.path}>
          <FolderTreeItem
            nodeName={node.name}
            nodePath={node.path}
            isExpanded={isExpanded}
            depth={depth}
            onToggle={toggle}
          />
          {isExpanded &&
            node.children.map((child) => renderNode(child, depth + 1))}
        </div>
      );
    }

    const inSpec = specFiles.some((s) => s.path === node.path);
    return (
      <FileTreeItem
        key={node.path}
        nodeName={node.name}
        nodePath={node.path}
        depth={depth}
        inSpec={inSpec}
        specFilesSaving={specFilesSaving}
        onAddToSpec={addToSpec}
      />
    );
  }

  return (
    <div className="space-y-0.5">
      {renderNode(root, 0)}
    </div>
  );
}
