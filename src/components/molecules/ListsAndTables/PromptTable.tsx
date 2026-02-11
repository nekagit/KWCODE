"use client";

import React from 'react';
import { TableHead, TableHeader, TableRow, TableBody, TableCell, Table } from "@/components/ui/table";
import { PromptTableRow } from "@/components/atoms/list-items/PromptTableRow";

type PromptRecordRecord = {
  id: number;
  title: string;
  content: string;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string | null;
  updated_at?: string | null;
};

interface PromptRecordTableProps {
  fullPromptRecords: PromptRecordRecord[];
  selectedPromptRecordIds: number[];
  setSelectedPromptRecordIds: (ids: number[]) => void;
  handleDelete: (id: number) => void;
  setEditOpen: (open: boolean) => void;
  setFormId: (id: number | undefined) => void;
  setFormTitle: (title: string) => void;
  setFormContent: (content: string) => void;
}

export function PromptRecordTable({
  fullPromptRecords,
  selectedPromptRecordIds,
  setSelectedPromptRecordIds,
  handleDelete,
  setEditOpen,
  setFormId,
  setFormTitle,
  setFormContent,
}: PromptRecordTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {[{ key: "select", label: "Select", className: "w-10" },
            { key: "id", label: "ID", className: "w-16" },
            { key: "title", label: "Title" },
            { key: "category", label: "Category", className: "hidden sm:table-cell" },
            { key: "tags", label: "Tags", className: "hidden md:table-cell" },
            { key: "created_at", label: "Created", className: "hidden lg:table-cell" },
            { key: "updated_at", label: "Updated", className: "hidden lg:table-cell" },
            { key: "content", label: "Content", className: "max-w-[200px]" },
            { key: "actions", label: "Actions", className: "w-24 text-right" },
          ].map((header) => (
            <TableHead key={header.key} className={header.className}>
              {header.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {fullPromptRecords.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
              No prompts. Create one above.
            </TableCell>
          </TableRow>
        ) : (
          fullPromptRecords.map((p: PromptRecordRecord) => (
            <PromptTableRow
              key={p.id}
              prompt={p}
              selectedPromptRecordIds={selectedPromptRecordIds}
              setSelectedPromptRecordIds={setSelectedPromptRecordIds}
              handleDelete={handleDelete}
              setEditOpen={setEditOpen}
              setFormId={setFormId}
              setFormTitle={setFormTitle}
              setFormContent={setFormContent}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}
