import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { type CursorFileEntry } from "@/types/file-tree";

type FileTreeItemProps = {
  nodeName: string;
  nodePath: string;
  depth: number;
  inSpec: boolean;
  specFilesSaving: boolean;
  onAddToSpec: (file: CursorFileEntry) => void;
};

export function FileTreeItem({
  nodeName,
  nodePath,
  depth,
  inSpec,
  specFilesSaving,
  onAddToSpec,
}: FileTreeItemProps) {
  const indent = depth * 16;

  return (
    <div
      className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50 min-w-0 group"
      style={{ paddingLeft: 8 + indent + 24 }}
    >
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate flex-1 min-w-0 font-mono text-sm" title={nodePath}>
        {nodeName}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="h-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onAddToSpec({ name: nodeName, path: nodePath })}
        disabled={inSpec || specFilesSaving}
        title={inSpec ? "Already in project spec" : "Add to project spec"}
      >
        {inSpec ? (
          "Added"
        ) : (
          <>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </>
        )}
      </Button>
    </div>
  );
}
