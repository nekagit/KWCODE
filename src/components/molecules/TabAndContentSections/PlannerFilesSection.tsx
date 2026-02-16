"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ListTodo } from "lucide-react";
import { listProjectFiles, readProjectFileOrEmpty, type FileEntry } from "@/lib/api-projects";
import { PLANNER_ROOT, PLANNER_TICKETS_PATH } from "@/lib/cursor-paths";
import { parseTicketsMd } from "@/lib/todos-kanban";
import type { Project } from "@/types/project";
import { SectionCard } from "@/components/shared/DisplayPrimitives";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/** Display label for the planner folder (must match PLANNER_ROOT in cursor-paths). */
const PLANNER_FOLDER_LABEL = ".cursor/7. planner";

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatUpdatedAt(updatedAt: string): string {
  try {
    const d = new Date(updatedAt);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString(undefined, { dateStyle: "short" });
  } catch {
    return "—";
  }
}

interface PlannerFilesSectionProps {
  project: Project;
  projectId: string;
}

export function PlannerFilesSection({ project, projectId }: PlannerFilesSectionProps) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [ticketStats, setTicketStats] = useState<{ total: number; done: number } | null>(null);
  const cancelledRef = useRef(false);

  const load = useCallback(async () => {
    if (!project.repoPath) return;
    try {
      const list = await listProjectFiles(projectId, PLANNER_ROOT, project.repoPath);
      if (cancelledRef.current) return;
      const files = (list ?? []).filter((e) => !e.isDirectory);
      setEntries(files);

      const ticketsMd = await readProjectFileOrEmpty(projectId, PLANNER_TICKETS_PATH, project.repoPath);
      if (cancelledRef.current) return;
      const tickets = parseTicketsMd(ticketsMd || "");
      setTicketStats({ total: tickets.length, done: tickets.filter((t) => t.done).length });
    } catch {
      if (!cancelledRef.current) {
        setEntries([]);
        setTicketStats(null);
      }
    }
  }, [projectId, project.repoPath]);

  useEffect(() => {
    cancelledRef.current = false;
    load();
    return () => {
      cancelledRef.current = true;
    };
  }, [load]);

  if (!project.repoPath) return null;

  return (
    <SectionCard accentColor="blue" className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <ListTodo className="h-4 w-4 text-blue-500" />
        <h3 className="text-sm font-semibold">Planner files</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Files in <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">{PLANNER_FOLDER_LABEL}</code>.
      </p>
      {ticketStats != null && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <span className="text-xs text-muted-foreground">Total tickets</span>
            <p className="text-lg font-semibold tabular-nums">{ticketStats.total}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
            <span className="text-xs text-muted-foreground">Done</span>
            <p className="text-lg font-semibold tabular-nums">{ticketStats.done}</p>
          </div>
        </div>
      )}
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground">No files in this folder.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs w-20">Size</TableHead>
              <TableHead className="text-xs w-24">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((e) => (
              <TableRow key={e.name}>
                <TableCell className="font-mono text-xs">{e.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatSize(e.size)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatUpdatedAt(e.updatedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );
}
