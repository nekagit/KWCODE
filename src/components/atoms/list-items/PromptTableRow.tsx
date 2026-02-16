import React, { useCallback, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Copy, Check, Eye } from "lucide-react";
import { ButtonGroup } from "@/components/shared/ButtonGroup";
import { toast } from "sonner";

type PromptRecord = {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

interface PromptTableRowProps {
  prompt: PromptRecord;
  selectedPromptIds: number[];
  setSelectedPromptIds: React.Dispatch<React.SetStateAction<number[]>>;
  handleDelete: (id: number) => void;
  setEditOpen: (open: boolean) => void;
  setFormId: (id: number | undefined) => void;
  setFormTitle: (title: string) => void;
  setFormContent: (content: string) => void;
  onViewPrompt?: (prompt: PromptRecord) => void;
}

export const PromptTableRow: React.FC<PromptTableRowProps> = ({
  prompt: p,
  selectedPromptIds,
  setSelectedPromptIds,
  handleDelete,
  setEditOpen,
  setFormId,
  setFormTitle,
  setFormContent,
  onViewPrompt,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const text = p.content ?? "";
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        toast.success("Prompt copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      });
    },
    [p.content]
  );

  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      if (onViewPrompt && !(e.target as HTMLElement).closest("button, [role='checkbox']")) {
        onViewPrompt(p);
      }
    },
    [onViewPrompt, p]
  );

  return (
    <TableRow
      key={p.id}
      className={onViewPrompt ? "cursor-pointer hover:bg-muted/50" : undefined}
      onClick={handleRowClick}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selectedPromptIds.includes(p.id)}
          onCheckedChange={(checked) => {
            setSelectedPromptIds(
              checked ? [...selectedPromptIds, p.id] : selectedPromptIds.filter((id) => id !== p.id)
            );
          }}
        />
      </TableCell>
      <TableCell className="font-mono text-xs">{p.id}</TableCell>
      <TableCell className="font-medium max-w-[180px] truncate" title={p.title}>
        {p.title}
      </TableCell>
      <TableCell className="hidden sm:table-cell text-muted-foreground">
        {p.category ?? "—"}
      </TableCell>
      <TableCell className="hidden md:table-cell text-muted-foreground max-w-[120px] truncate">
        {Array.isArray(p.tags) && p.tags.length > 0 ? p.tags.join(", ") : "—"}
      </TableCell>
      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs whitespace-nowrap">
        {p.created_at ?? "—"}
      </TableCell>
      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs whitespace-nowrap">
        {p.updated_at ?? "—"}
      </TableCell>
      <TableCell className="max-w-[200px] text-muted-foreground text-xs truncate" title={p.content ?? ""}>
        {(p.content ?? "").replace(/\s+/g, " ").slice(0, 60)}
        {(p.content ?? "").length > 60 ? "…" : ""}
      </TableCell>
      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
        <ButtonGroup alignment="right">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            title="Copy prompt"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            title="View content"
            onClick={() => onViewPrompt?.(p)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            title="Edit prompt"
            onClick={() => {
              setSelectedPromptIds([p.id]);
              setEditOpen(true);
              setFormId(p.id);
              setFormTitle(p.title);
              setFormContent(p.content ?? "");
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            title="Delete prompt"
            onClick={() => handleDelete(p.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </ButtonGroup>
      </TableCell>
    </TableRow>
  );
};
