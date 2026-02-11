"use client";

import React from 'react';
import { Table } from "@/components/shared/Table";
import { TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { PromptTableRow } from "@/components/atoms/PromptTableRow";

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
    <Table
      headers={[
        { key: "select", label: "Select", className: "w-10" },
        { key: "id", label: "ID", className: "w-16" },
        { key: "title", label: "Title" },
        { key: "category", label: "Category", className: "hidden sm:table-cell" },
        { key: "tags", label: "Tags", className: "hidden md:table-cell" },
        { key: "created_at", label: "Created", className: "hidden lg:table-cell" },
        { key: "updated_at", label: "Updated", className: "hidden lg:table-cell" },
        { key: "content", label: "Content", className: "max-w-[200px]" },
        { key: "actions", label: "Actions", className: "w-24 text-right" },
      ]}
      data={fullPrompts}
      renderRow={(p) => (
        <PromptTableRow
          key={p.id}
          prompt={p}
          selectedPromptIds={selectedPromptIds}
          setSelectedPromptIds={setSelectedPromptIds}
          handleDelete={handleDelete}
          setEditOpen={setEditOpen}
          setFormId={setFormId}
          setFormTitle={setFormTitle}
          setFormContent={setFormContent}
        />
      )}
      emptyState={
        <TableRow>
          <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
            No prompts. Create one above.
          </TableCell>
        </TableRow>
      }
    />
  );
}
