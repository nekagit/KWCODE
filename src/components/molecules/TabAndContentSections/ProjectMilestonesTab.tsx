"use client";

import { useState, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionCard } from "@/components/shared/DisplayPrimitives";
import { EmptyState } from "@/components/shared/EmptyState";
import { Flag, Copy, Loader2, PlusCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import type { Project } from "@/types/project";
import {
  readProjectFileOrEmpty,
  writeProjectFile,
  listProjectFiles,
  analyzeProjectDoc,
} from "@/lib/api-projects";
import { AnalyzeButtonSplit } from "@/components/molecules/ControlsAndButtons/AnalyzeButtonSplit";
import { isTauri } from "@/lib/tauri";
import { useRunStore, registerRunCompleteHandler } from "@/store/run-store";
import { cn } from "@/lib/utils";

const MILESTONES_DIR = ".cursor/milestones";
const MILESTONE_PROMPT_PATH = ".cursor/prompts/milestone.md";
const MILESTONE_OUTPUT_PATH = ".cursor/setup/milestone.md";

const markdownClasses =
  "text-sm text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:bg-muted/50 [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_p]:mb-2 last:[&_p]:mb-0 [&_table]:border-collapse [&_th]:border [&_td]:border [&_th]:px-2 [&_td]:px-2 [&_th]:py-1 [&_td]:py-1";
import {
  parseTicketsMd,
  serializeTicketsToMd,
  type ParsedTicket,
} from "@/lib/todos-kanban";

const EXCLUDED_AGENT_IDS = ["devops", "requirements"];

const MILESTONE_PHASES = [
  {
    phaseNumber: 1,
    title: "Phase 1 — Foundation",
    goal: "Project setup, env, Supabase project, Auth, base layout, design tokens.",
    ticketRange: "#1–#12",
    promptToUse: "architecture.md, design.md",
    contextToPaste: `This project follows the standard webapp plan Phase 1: Next.js App Router, Tailwind, Supabase. We need:
- Architecture: Next.js server/client split, Supabase as backend, Server Actions or API routes, Auth flow.
- Design: CSS variables for theme (light/dark), base layout, typography and spacing scale, shadcn/ui usage.`,
  },
  {
    phaseNumber: 2,
    title: "Phase 2 — Core data & API",
    goal: "Supabase schema, RLS, TypeScript types, Zod schemas, Server Actions, error envelope.",
    ticketRange: "#13–#20",
    promptToUse: "architecture.md",
    contextToPaste: `Phase 2 of the webapp plan: Supabase schema and RLS, TypeScript types matching the schema, Zod for validation, Server Actions for CRUD. Standard response envelope: { success, data, error }. Document the data layer, API conventions, and auth checks in Server Actions.`,
  },
  {
    phaseNumber: 3,
    title: "Phase 3 — Core UI",
    goal: "Main entity list/detail, forms, loading/error states, navigation.",
    ticketRange: "#21–#31",
    promptToUse: "design.md",
    contextToPaste: `Phase 3: Core UI for main entities. List page, detail page, create/edit forms with validation and loading states. Use shadcn/ui (Table, Card, Form, Button, Input). Document component hierarchy, form patterns, and loading/skeleton approach.`,
  },
  {
    phaseNumber: 4,
    title: "Phase 4 — Quality & polish",
    goal: "Unit tests, E2E tests, error boundaries, toasts, a11y, responsive.",
    ticketRange: "#32–#42",
    promptToUse: "testing.md",
    contextToPaste: `Phase 4: Testing and quality. Unit tests (Vitest) for utils and validation; E2E (Playwright) for critical flows (auth, main CRUD). Error boundaries and toasts. Accessibility (focus, ARIA, contrast) and responsive layout. Document testing philosophy and patterns.`,
  },
  {
    phaseNumber: 5,
    title: "Phase 5 — Production",
    goal: "Env validation, security headers, README, deploy steps, production checklist.",
    ticketRange: "#43–#48",
    promptToUse: "documentation.md",
    contextToPaste: `Phase 5: Production readiness. Environment variable validation at startup (Zod or t3-env). Security headers (CSP, X-Frame-Options). README with quick start and env vars. Deployment for Vercel + Supabase. Production checklist (env, secrets, domain, RLS).`,
  },
];

type GeneratedTicket = {
  title: string;
  description?: string;
  priority: "P0" | "P1" | "P2" | "P3";
  featureName: string;
};

interface ProjectMilestonesTabProps {
  project: Project;
  projectId: string;
  onTicketAdded?: () => void;
}

export function ProjectMilestonesTab({
  project,
  projectId,
  onTicketAdded,
}: ProjectMilestonesTabProps) {
  const [specificInputs, setSpecificInputs] = useState<Record<number, string>>({});
  const [generatingPhase, setGeneratingPhase] = useState<number | null>(null);
  const [generatedTicket, setGeneratedTicket] = useState<{
    phaseNumber: number;
    ticket: GeneratedTicket;
  } | null>(null);
  const [addingToBacklog, setAddingToBacklog] = useState(false);

  const [milestoneFiles, setMilestoneFiles] = useState<string[]>([]);
  const [selectedMilestoneFile, setSelectedMilestoneFile] = useState<string | null>(null);
  const [milestoneContent, setMilestoneContent] = useState<string | null>(null);
  const [loadingMilestoneList, setLoadingMilestoneList] = useState(true);
  const [loadingMilestoneContent, setLoadingMilestoneContent] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!project.repoPath) {
      setLoadingMilestoneList(false);
      return;
    }
    let cancelled = false;
    setLoadingMilestoneList(true);
    listProjectFiles(projectId, MILESTONES_DIR, project.repoPath)
      .then((list) => {
        if (cancelled) return;
        const md = list
          .filter((e) => !e.isDirectory && (e.name.endsWith(".md") || e.name.endsWith(".milestone.md")))
          .map((e) => e.name)
          .sort();
        setMilestoneFiles(md);
      })
      .catch(() => {
        if (!cancelled) setMilestoneFiles([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingMilestoneList(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, project.repoPath]);

  useEffect(() => {
    if (!selectedMilestoneFile || !project.repoPath) {
      setMilestoneContent(null);
      return;
    }
    let cancelled = false;
    setLoadingMilestoneContent(true);
    readProjectFileOrEmpty(projectId, `${MILESTONES_DIR}/${selectedMilestoneFile}`, project.repoPath)
      .then((text) => {
        if (!cancelled) setMilestoneContent(text?.trim() || null);
      })
      .catch(() => {
        if (!cancelled) setMilestoneContent(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingMilestoneContent(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, project.repoPath, selectedMilestoneFile]);

  const handleCopyContext = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success("Phase context copied to clipboard"),
      () => toast.error("Failed to copy")
    );
  }, []);

  const runTempTicket = useRunStore((s) => s.runTempTicket);

  const handleAnalyze = useCallback(async () => {
    if (!project.repoPath?.trim()) return;
    setAnalyzing(true);
    try {
      const result = await analyzeProjectDoc(
        projectId,
        MILESTONE_PROMPT_PATH,
        MILESTONE_OUTPUT_PATH,
        project.repoPath,
        { runTempTicket: isTauri ? runTempTicket : undefined }
      );
      if (result?.viaWorker) {
        toast.success("Analyze started. See Worker tab.");
        return;
      }
      toast.success("Milestone analysis updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analyze failed");
    } finally {
      setAnalyzing(false);
    }
  }, [projectId, project.repoPath, isTauri, runTempTicket]);

  const handleGenerateTicket = useCallback(
    async (phase: (typeof MILESTONE_PHASES)[number]) => {
      const input = specificInputs[phase.phaseNumber]?.trim() || "";
      const prompt = `${phase.contextToPaste}\n\nSpecific inputs:\n${input || "—"}`;

      let existingFeatures: string[] = [];
      if (project.repoPath) {
        try {
          const ticketsMd = await readProjectFileOrEmpty(
            projectId,
            ".cursor/planner/tickets.md",
            project.repoPath
          );
          const tickets = parseTicketsMd(ticketsMd || "");
          const names = new Set(tickets.map((t) => t.featureName).filter(Boolean));
          existingFeatures = Array.from(names);
        } catch {
          // ignore
        }
      }

      if (!project.repoPath?.trim()) {
        toast.error("Project repo path is required");
        return;
      }

      setGeneratingPhase(phase.phaseNumber);
      setGeneratedTicket(null);
      try {
        if (isTauri) {
          const res = await fetch("/api/generate-ticket-from-prompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, existingFeatures, projectPath: project.repoPath, promptOnly: true }),
          });
          const data = await res.json();
          if (!res.ok) {
            toast.error(data.error || "Failed to generate ticket");
            return;
          }
          const promptText = data.prompt;
          if (!promptText) {
            toast.error("No prompt returned");
            return;
          }
          const requestId = `milestone-${phase.phaseNumber}-${Date.now()}`;
          const phaseNum = phase.phaseNumber;
          registerRunCompleteHandler(`parse_ticket_milestone:${requestId}`, (stdout: string) => {
            const jsonMatch = stdout.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? jsonMatch[0] : stdout;
            try {
              const parsed = JSON.parse(jsonStr) as { title?: string; description?: string; priority?: string; featureName?: string };
              const priority = ["P0", "P1", "P2", "P3"].includes(parsed.priority ?? "") ? parsed.priority! : "P1";
              setGeneratedTicket({
                phaseNumber: phaseNum,
                ticket: {
                  title: String(parsed.title ?? "").trim().slice(0, 200),
                  description: typeof parsed.description === "string" ? parsed.description.trim().slice(0, 2000) : undefined,
                  priority: priority as "P0" | "P1" | "P2" | "P3",
                  featureName: String(parsed.featureName ?? "Uncategorized").trim().slice(0, 100),
                },
              });
            } catch {
              toast.error("Could not parse agent output");
            }
            setGeneratingPhase(null);
          });
          await runTempTicket(project.repoPath.trim(), promptText, `Generate ticket (Phase ${phase.phaseNumber})`, {
            onComplete: "parse_ticket_milestone",
            payload: { requestId },
          });
          toast.success("Generate ticket running in Run tab.");
          return;
        }
        const res = await fetch("/api/generate-ticket-from-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, existingFeatures }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to generate ticket");
          return;
        }
        setGeneratedTicket({
          phaseNumber: phase.phaseNumber,
          ticket: {
            title: data.title,
            description: data.description,
            priority: data.priority ?? "P1",
            featureName: data.featureName ?? "Uncategorized",
          },
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : String(e));
      } finally {
        setGeneratingPhase(null);
      }
    },
    [specificInputs, project.repoPath, projectId, runTempTicket]
  );

  const handleAddToBacklog = useCallback(async () => {
    if (!project.repoPath || !generatedTicket) return;
    setAddingToBacklog(true);
    try {
      const ticketsMd = await readProjectFileOrEmpty(
        projectId,
        ".cursor/planner/tickets.md",
        project.repoPath
      );
      const tickets = parseTicketsMd(ticketsMd || "");
      const nextNumber =
        tickets.length === 0
          ? 1
          : Math.max(...tickets.map((t) => t.number)) + 1;
      const t = generatedTicket.ticket;

      let agents: string[] = [];
      try {
        const list = await listProjectFiles(projectId, ".cursor/agents", project.repoPath);
        const mdFiles = list.filter(
          (e) => !e.isDirectory && e.name.toLowerCase().endsWith(".md")
        );
        const excluded = new Set(EXCLUDED_AGENT_IDS.map((x) => x.toLowerCase()));
        agents = mdFiles
          .map((e) => e.name.replace(/\.md$/i, ""))
          .filter((id) => !excluded.has(id.toLowerCase()));
      } catch {
        // ignore
      }

      const newTicket: ParsedTicket = {
        id: `ticket-${nextNumber}`,
        number: nextNumber,
        title: t.title,
        description: t.description,
        priority: t.priority,
        featureName: t.featureName.trim() || "Uncategorized",
        done: false,
        status: "Todo",
        ...(agents.length > 0 && { agents }),
      };
      const updatedTickets = [...tickets, newTicket];
      const serialized = serializeTicketsToMd(updatedTickets, {
        projectName: project.name,
      });
      await writeProjectFile(
        projectId,
        ".cursor/planner/tickets.md",
        serialized,
        project.repoPath
      );
      setGeneratedTicket(null);
      onTicketAdded?.();
      toast.success(`Ticket #${nextNumber} added to backlog.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : String(e));
    } finally {
      setAddingToBacklog(false);
    }
  }, [project, projectId, generatedTicket, onTicketAdded]);

  if (!project.repoPath?.trim()) {
    return (
      <EmptyState
        icon={<Flag className="size-6 text-muted-foreground" />}
        title="No repo path"
        description="Set a repo path for this project to use milestones and add tickets."
      />
    );
  }

  const hasNoMilestones =
    !loadingMilestoneList && milestoneFiles.length === 0;

  if (hasNoMilestones) {
    return (
      <EmptyState
        icon={<Flag className="size-6 text-muted-foreground" />}
        title="No milestones yet"
        description="Run Analyze to generate milestone content, or add .md files to .cursor/milestones/."
        action={
          <AnalyzeButtonSplit
            promptPath={MILESTONE_PROMPT_PATH}
            projectId={projectId}
            repoPath={project.repoPath ?? undefined}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
            label="Analyze to generate"
          />
        }
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Use the phase context and your specific inputs to generate tickets; add
          them to the backlog from here or from Planner.
        </p>
        <AnalyzeButtonSplit
          promptPath={MILESTONE_PROMPT_PATH}
          projectId={projectId}
          repoPath={project.repoPath ?? undefined}
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
          label="Analyze"
        />
      </div>

      {/* Milestone files — .cursor/milestones/ */}
      <SectionCard accentColor="orange">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-orange-500" />
          <h3 className="text-sm font-semibold">Milestone files</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Files in <code className="rounded bg-muted px-1 py-0.5">{MILESTONES_DIR}</code>. Click to view.
        </p>
        {loadingMilestoneList ? (
          <div className="flex items-center gap-2 py-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Loading…</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {milestoneFiles.map((name) => (
                <Button
                  key={name}
                  variant={selectedMilestoneFile === name ? "secondary" : "outline"}
                  size="sm"
                  className="font-mono text-xs"
                  onClick={() => setSelectedMilestoneFile(name)}
                >
                  {name}
                </Button>
              ))}
            </div>
            <div className="flex-1 min-w-0 border border-border/60 rounded-md overflow-hidden">
              {loadingMilestoneContent ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : milestoneContent ? (
                <ScrollArea className="h-[280px]">
                  <div className={cn("p-3", markdownClasses)}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{milestoneContent}</ReactMarkdown>
                  </div>
                </ScrollArea>
              ) : (
                <div className="p-4 text-xs text-muted-foreground text-center">
                  Select a file to preview.
                </div>
              )}
            </div>
          </div>
        )}
      </SectionCard>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 pr-4">
          {MILESTONE_PHASES.map((phase) => (
            <SectionCard
              key={phase.phaseNumber}
              accentColor="violet"
              className="flex flex-col gap-4"
            >
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {phase.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {phase.goal}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tickets: {phase.ticketRange} · Prompt: {phase.promptToUse}
                </p>
              </div>
              <div className="rounded-md border border-border/60 bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Phase context (copy and paste into Cursor)
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handleCopyContext(phase.contextToPaste)}
                  >
                    <Copy className="size-3.5 mr-1" />
                    Copy
                  </Button>
                </div>
                <pre className="text-xs text-foreground/90 whitespace-pre-wrap font-sans overflow-x-auto">
                  {phase.contextToPaste}
                </pre>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Specific inputs (optional)
                </label>
                <textarea
                  className="w-full min-h-[72px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="e.g. Our main entities: Project, Task. Use Supabase with RLS."
                  value={specificInputs[phase.phaseNumber] ?? ""}
                  onChange={(e) =>
                    setSpecificInputs((prev) => ({
                      ...prev,
                      [phase.phaseNumber]: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  disabled={generatingPhase !== null}
                  onClick={() => handleGenerateTicket(phase)}
                >
                  {generatingPhase === phase.phaseNumber ? (
                    <Loader2 className="size-4 animate-spin mr-2" />
                  ) : (
                    <PlusCircle className="size-4 mr-2" />
                  )}
                  Generate ticket
                </Button>
                {generatedTicket?.phaseNumber === phase.phaseNumber && (
                  <div className="flex flex-wrap items-center gap-2 ml-2">
                    <span className="text-xs text-muted-foreground">
                      Generated: {generatedTicket.ticket.title}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={addingToBacklog}
                      onClick={handleAddToBacklog}
                    >
                      {addingToBacklog ? (
                        <Loader2 className="size-4 animate-spin mr-1" />
                      ) : null}
                      Add to backlog
                    </Button>
                  </div>
                )}
              </div>
            </SectionCard>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
