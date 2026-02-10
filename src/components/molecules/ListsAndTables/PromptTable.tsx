"use client";

import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";

type PromptRecord = {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

interface PromptTableProps {
  fullPrompts: PromptRecord[];
  selectedPromptIds: number[];
  setSelectedPromptIds: (ids: number[]) => void;
  handleDelete: (id: number) => void;
  setEditOpen: (open: boolean) => void;
  setFormId: (id: number | undefined) => void;
  setFormTitle: (title: string) => void;
  setFormContent: (content: string) => void;
}

export function PromptTable({
  fullPrompts,
  selectedPromptIds,
  setSelectedPromptIds,
  handleDelete,
  setEditOpen,
  setFormId,
  setFormTitle,
  setFormContent,
}: PromptTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">Select</TableHead>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden sm:table-cell">Category</TableHead>
            <TableHead className="hidden md:table-cell">Tags</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead className="hidden lg:table-cell">Updated</TableHead>
            <TableHead className="max-w-[200px]">Content</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fullPrompts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No prompts. Create one above.
              </TableCell>
            </TableRow>
          ) : (
            fullPrompts.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
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
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
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
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
