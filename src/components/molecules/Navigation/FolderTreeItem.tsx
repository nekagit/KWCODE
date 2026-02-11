import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";

type FolderTreeItemProps = {
  nodeName: string;
  nodePath: string;
  isExpanded: boolean;
  depth: number;
  onToggle: (path: string) => void;
};

export function FolderTreeItem({
  nodeName,
  nodePath,
  isExpanded,
  depth,
  onToggle,
}: FolderTreeItemProps) {
  const indent = depth * 16;

  return (
    <div className="select-none">
      <button
        type="button"
        onClick={() => onToggle(nodePath)}
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
        <span className="truncate" title={nodePath}>
          {nodeName}
        </span>
      </button>
    </div>
  );
}
