"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  FileText,
  Bot,
  ListTodo,
  MessageSquare,
  Settings,
  FolderGit2,
  Folder,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { listProjectFiles, readProjectFileOrEmpty, type FileEntry } from "@/lib/api-projects";
import { parseTicketsMd } from "@/lib/todos-kanban";
import type { Project } from "@/types/project";
import type { AccentColor } from "@/components/shared/DisplayPrimitives";
import { SectionCard, CountBadge, MetadataBadge } from "@/components/shared/DisplayPrimitives";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectAgentsSection } from "@/components/molecules/TabAndContentSections/ProjectAgentsSection";
import { ProjectFilesTab } from "@/components/molecules/TabAndContentSections/ProjectFilesTab";

const SETUP_FOLDERS: {
  id: string;
  label: string;
  path: string;
  description: string;
  icon: LucideIcon;
  accent: AccentColor;
}[] = [
  { id: "adr", label: "ADR", path: ".cursor/adr", description: "Architecture decision records", icon: FileText, accent: "violet" },
  { id: "agents", label: "Agents", path: ".cursor/agents", description: "Agent definitions and roles", icon: Bot, accent: "cyan" },
  { id: "planner", label: "Planner", path: ".cursor/planner", description: "Tickets, project plan, Kanban state", icon: ListTodo, accent: "blue" },
  { id: "prompts", label: "Prompts", path: ".cursor/prompts", description: "Prompt templates per phase", icon: MessageSquare, accent: "amber" },
  { id: "setup", label: "Setup", path: ".cursor/setup", description: "Setup files in .cursor/setup", icon: Settings, accent: "emerald" },
  { id: "rules", label: "Rules", path: ".cursor/rules", description: "Cursor rules and conventions", icon: Folder, accent: "teal" },
];

const ACCENT_BADGE_COLORS: Record<AccentColor, string> = {
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
  amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  teal: "bg-teal-500/10 border-teal-500/20 text-teal-400",
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
  sky: "bg-sky-500/10 border-sky-500/20 text-sky-400",
  orange: "bg-orange-500/10 border-orange-500/20 text-orange-400",
};

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

interface ProjectSetupTabProps {
  project: Project;
  projectId: string;
}

export function ProjectSetupTab({ project, projectId }: ProjectSetupTabProps) {
  const [entriesByFolder, setEntriesByFolder] = useState<Record<string, FileEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [plannerTicketStats, setPlannerTicketStats] = useState<{ total: number; done: number } | null>(null);

  const loadFolder = useCallback(
    async (path: string): Promise<FileEntry[]> => {
      if (!project.repoPath) return [];
      try {
        const list = await listProjectFiles(projectId, path, project.repoPath);
        return list ?? [];
      } catch {
        return [];
      }
    },
    [projectId, project.repoPath]
  );

  const loadAll = useCallback(async () => {
    if (!project.repoPath) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const next: Record<string, FileEntry[]> = {};
    for (const folder of SETUP_FOLDERS) {
      const list = await loadFolder(folder.path);
      next[folder.id] = list;
    }
    setEntriesByFolder(next);

    // Planner: load tickets.md for stats
    try {
      const ticketsMd = await readProjectFileOrEmpty(projectId, ".cursor/planner/tickets.md", project.repoPath);
      const tickets = parseTicketsMd(ticketsMd || "");
      const total = tickets.length;
      const done = tickets.filter((t) => t.done).length;
      setPlannerTicketStats({ total, done });
    } catch {
      setPlannerTicketStats(null);
    }
    setLoading(false);
  }, [project.repoPath, projectId, loadFolder]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  if (!project.repoPath?.trim()) {
    return (
      <EmptyState
        icon={<Settings className="size-6 text-muted-foreground" />}
        title="No repo path"
        description="Set a repo path for this project to see the setup overview."
      />
    );
  }

  const fileEntries = (folderId: string) => {
    const entries = entriesByFolder[folderId] ?? [];
    return entries.filter((e) => !e.isDirectory);
  };

  const latestUpdated = (folderId: string): string | null => {
    const entries = entriesByFolder[folderId] ?? [];
    const withDate = entries.filter((e) => e.updatedAt);
    if (withDate.length === 0) return null;
    const sorted = [...withDate].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return sorted[0].updatedAt;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <ScrollArea className="flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pr-4">
          {SETUP_FOLDERS.map((folder) => {
            const files = fileEntries(folder.id);
            const count = files.length;
            const lastUpdated = latestUpdated(folder.id);
            const Icon = folder.icon;

            return (
              <SectionCard
                key={folder.id}
                accentColor={folder.accent}
                className={`flex flex-col gap-4 ${folder.id === "setup" ? "lg:col-span-2" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/60">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{folder.label}</h3>
                      <p className="text-xs text-muted-foreground">{folder.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <CountBadge
                    count={folder.id === "planner" && plannerTicketStats ? plannerTicketStats.total : count}
                    label={folder.id === "planner" && plannerTicketStats ? "tickets" : "files"}
                    color={ACCENT_BADGE_COLORS[folder.accent]}
                  />
                  <MetadataBadge
                    icon={<FileText className="size-3" />}
                    color="bg-muted/50 border-border/50 text-muted-foreground"
                  >
                    <span className="font-mono text-[10px]">{folder.path}</span>
                  </MetadataBadge>
                  {lastUpdated && (
                    <MetadataBadge
                      icon={<span className="text-[10px]">Updated</span>}
                      color="bg-muted/50 border-border/50 text-muted-foreground"
                    >
                      {formatUpdatedAt(lastUpdated)}
                    </MetadataBadge>
                  )}
                </div>

                {folder.id === "agents" && (
                  <div className="mt-2">
                    <ProjectAgentsSection project={project} projectId={projectId} />
                  </div>
                )}

                {folder.id === "planner" && (
                  <>
                    {plannerTicketStats && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                          <span className="text-xs text-muted-foreground">Total tickets</span>
                          <p className="text-lg font-semibold tabular-nums">{plannerTicketStats.total}</p>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                          <span className="text-xs text-muted-foreground">Done</span>
                          <p className="text-lg font-semibold tabular-nums">{plannerTicketStats.done}</p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Manage tickets in the Planner tab.</p>
                    {files.length > 0 && (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs w-20">Size</TableHead>
                            <TableHead className="text-xs w-24">Updated</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {files.map((e) => (
                            <TableRow key={e.name}>
                              <TableCell className="font-mono text-xs">{e.name}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{formatSize(e.size)}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{formatUpdatedAt(e.updatedAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </>
                )}

                {["adr", "prompts", "rules"].includes(folder.id) && (
                  <>
                    {files.length === 0 ? (
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
                          {files.map((e) => (
                            <TableRow key={e.name}>
                              <TableCell className="font-mono text-xs">{e.name}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{formatSize(e.size)}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{formatUpdatedAt(e.updatedAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </>
                )}

                {folder.id === "setup" && (
                  <>
                    {files.length === 0 ? (
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
                          {files.map((e) => (
                            <TableRow key={e.name}>
                              <TableCell className="font-mono text-xs">{e.name}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{formatSize(e.size)}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{formatUpdatedAt(e.updatedAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </>
                )}
              </SectionCard>
            );
          })}

          {/* Project Files — full width */}
          <SectionCard accentColor="rose" className="lg:col-span-2">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Project Files</h3>
                    <p className="text-xs text-muted-foreground">Files in .cursor directory</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={loadAll} disabled={loading} className="gap-1.5">
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Refresh
                </Button>
              </div>
              <ProjectFilesTab project={project} projectId={projectId} />
            </div>
          </SectionCard>
        </div>
      </ScrollArea>
    </div>
  );
}
