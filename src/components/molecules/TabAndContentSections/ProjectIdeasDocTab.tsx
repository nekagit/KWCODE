"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Loader2,
  Lightbulb,
  Plus,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Flag,
} from "lucide-react";
import { ConvertToMilestonesDialog } from "@/components/molecules/FormsAndDialogs/ConvertToMilestonesDialog";
import { AnalyzeButtonSplit } from "@/components/molecules/ControlsAndButtons/AnalyzeButtonSplit";
import { readProjectFileOrEmpty, readCursorDocFromServer, writeProjectFile, analyzeProjectDoc } from "@/lib/api-projects";
import { isTauri } from "@/lib/tauri";
import { useRunStore, registerRunCompleteHandler } from "@/store/run-store";
import {
  parseIdeasMd,
  parseIdeasMdStructured,
  serializeIdeasMd,
  buildNumberedBlock,
  buildBulletBlock,
  improvedTextToTitleAndBody,
  getIdeaFields,
  type ParsedIdeasDoc,
  type IdeaBlock,
  type IdeasStructuredDoc,
  type IdeasStructuredSection,
} from "@/lib/ideas-md";
import type { Project } from "@/types/project";
import { SectionCard } from "@/components/shared/DisplayPrimitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog as SharedDialog } from "@/components/shared/Dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { IDEAS_DOC_PATH, IDEAS_PROMPT_PATH } from "@/lib/cursor-paths";
const IDEAS_SETUP_PATH = IDEAS_DOC_PATH;
const markdownClasses =
  "text-sm text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 last:[&_p]:mb-0 [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:rounded";

interface ProjectIdeasDocTabProps {
  project: Project;
  projectId: string;
  docsRefreshKey?: number;
}

export function ProjectIdeasDocTab({ project, projectId, docsRefreshKey }: ProjectIdeasDocTabProps) {
  const [content, setContent] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedIdeasDoc | null>(null);
  const [structured, setStructured] = useState<IdeasStructuredDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [introExpanded, setIntroExpanded] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["section-preamble"]));
  const [expandedIdeas, setExpandedIdeas] = useState<Set<string>>(new Set());
  const [showRawDialog, setShowRawDialog] = useState(false);
  const [newIdeaRaw, setNewIdeaRaw] = useState("");
  const [improving, setImproving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [convertMilestonesOpen, setConvertMilestonesOpen] = useState(false);
  const [convertMilestonesDefaultName, setConvertMilestonesDefaultName] = useState("");

  const fetchDoc = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let text = "";
      if (project.repoPath) {
        text = await readProjectFileOrEmpty(projectId, IDEAS_SETUP_PATH, project.repoPath);
      }
      // Fallback: if project repo read is empty, try app .cursor folder so content shows when project is this repo
      if (!text?.trim()) {
        text = await readCursorDocFromServer(IDEAS_SETUP_PATH);
      }
      setContent(text && text.trim() ? text : null);
      const parsedDoc = text && text.trim() ? parseIdeasMd(text) : { intro: "", ideas: [], format: "bullets" as const };
      setParsed(parsedDoc);
      const structuredDoc = text && text.trim() ? parseIdeasMdStructured(text) : { sections: [], isStructured: false };
      setStructured(structuredDoc);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setContent(null);
      setParsed(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, project.repoPath]);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc, docsRefreshKey]);

  const saveDoc = useCallback(
    async (intro: string, ideas: IdeaBlock[], format: "numbered" | "bullets") => {
      if (!project.repoPath) return;
      setSaving(true);
      try {
        const full = serializeIdeasMd(intro, ideas, format);
        await writeProjectFile(projectId, IDEAS_SETUP_PATH, full, project.repoPath);
        setContent(full);
        setParsed({ intro, ideas, format });
        toast.success("Ideas saved to ideas.md");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to save");
      } finally {
        setSaving(false);
      }
    },
    [projectId, project.repoPath]
  );

  const runTempTicket = useRunStore((s) => s.runTempTicket);

  const addImprovedIdea = useCallback(async () => {
    const raw = newIdeaRaw.trim();
    if (!raw || !parsed || !project.repoPath?.trim()) return;
    setImproving(true);
    try {
      if (isTauri) {
        const res = await fetch(`/api/data/projects/${projectId}/improve-idea`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawIdea: raw,
            projectName: project.name,
            promptOnly: true,
          }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error((j as { error?: string }).error || res.statusText);
        }
        const data = (await res.json()) as { prompt?: string };
        const prompt = data.prompt;
        if (!prompt) throw new Error("No prompt returned");
        const key = `improve_idea:${projectId}`;
        registerRunCompleteHandler(key, async (stdout: string) => {
          const improved = stdout.trim() || raw;
          const currentParsed = parsed;
          if (!currentParsed) return;
          const nextIdeas = [...currentParsed.ideas];
          if (currentParsed.format === "numbered") {
            const { title, body } = improvedTextToTitleAndBody(improved);
            nextIdeas.push(buildNumberedBlock(title, body, nextIdeas.length + 1));
          } else {
            nextIdeas.push(buildBulletBlock(improved));
          }
          await saveDoc(currentParsed.intro, nextIdeas, currentParsed.format);
          setNewIdeaRaw("");
          toast.success("Idea added to ideas.md");
          setImproving(false);
        });
        await runTempTicket(project.repoPath.trim(), prompt, "Improve idea", {
          onComplete: "improve_idea",
          payload: { projectId },
        });
        toast.success("Improve idea running in Run tab.");
        return;
      }
      const res = await fetch(`/api/data/projects/${projectId}/improve-idea`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawIdea: raw,
          projectName: project.name,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || res.statusText);
      }
      const { improved } = (await res.json()) as { improved: string };
      const nextIdeas = [...parsed.ideas];
      if (parsed.format === "numbered") {
        const { title, body } = improvedTextToTitleAndBody(improved);
        nextIdeas.push(buildNumberedBlock(title, body, nextIdeas.length + 1));
      } else {
        nextIdeas.push(buildBulletBlock(improved));
      }
      await saveDoc(parsed.intro, nextIdeas, parsed.format);
      setNewIdeaRaw("");
      toast.success("Idea added to ideas.md");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to improve or add idea");
    } finally {
      setImproving(false);
    }
  }, [newIdeaRaw, parsed, projectId, project.name, project.repoPath, runTempTicket, saveDoc]);

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeProjectDoc(
        projectId,
        IDEAS_PROMPT_PATH,
        IDEAS_SETUP_PATH,
        project.repoPath ?? undefined,
        { runTempTicket: isTauri ? runTempTicket : undefined }
      );
      if (result?.viaWorker) {
        toast.success("Analysis started.");
        return;
      }
      await fetchDoc();
      if (result?.placeholder && result?.message) {
        toast.warning("Placeholder written", { description: result.message, duration: 8000 });
      } else {
        toast.success("Ideas doc updated from prompt.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analyze failed");
    } finally {
      setAnalyzing(false);
    }
  }, [projectId, fetchDoc, isTauri, runTempTicket]);

  if (!project.repoPath) {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/10 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Set a repository path for this project to load and edit ideas from{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{IDEAS_SETUP_PATH}</code>.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border/40 bg-muted/10 py-24">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Loading ideas…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!parsed) {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/10 p-6 text-center">
        <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Add <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{IDEAS_SETUP_PATH}</code> to
          describe your ideas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">Ideas roadmap (ideas.md)</h2>
        <div className="flex flex-wrap items-center gap-2">
          <AnalyzeButtonSplit
            promptPath={IDEAS_PROMPT_PATH}
            projectId={projectId}
            repoPath={project.repoPath ?? undefined}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
            label="Analyze"
          />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowRawDialog(true)}
          >
            <FileText className="h-3.5 w-3.5" />
            View raw ideas.md
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-14rem)]">
        <div className="space-y-6 pr-4">
          {structured?.isStructured && structured.sections.length > 0 ? (
            <>
              {/* Structured roadmap: ## sections + #### idea cards */}
              {structured.sections.map((section: IdeasStructuredSection) => {
                const isExpanded = expandedSections.has(section.id);
                const hasIdeas = section.ideas.length > 0;
                return (
                  <SectionCard key={section.id} accentColor="amber">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 text-left"
                      onClick={() =>
                        setExpandedSections((prev) => {
                          const next = new Set(prev);
                          if (next.has(section.id)) next.delete(section.id);
                          else next.add(section.id);
                          return next;
                        })
                      }
                    >
                      <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                      <h3 className="text-sm font-semibold">{section.title}</h3>
                      {hasIdeas && (
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {section.ideas.length} idea{section.ideas.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="mt-3 space-y-4">
                        {section.content && (
                          <div className={cn("p-2 pr-4 rounded-md bg-muted/30", markdownClasses)}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                          </div>
                        )}
                        {section.ideas.map((idea) => {
                          const fields = getIdeaFields(idea.body);
                          const ideaExpanded = expandedIdeas.has(idea.id);
                          return (
                            <div
                              key={idea.id}
                              className="rounded-lg border border-border/50 bg-card/50 overflow-hidden"
                            >
                              <div className="flex w-full items-center gap-2 p-3 text-left">
                                <button
                                  type="button"
                                  className="flex flex-1 min-w-0 items-center gap-2 hover:bg-muted/30 transition-colors rounded -m-1 p-1"
                                  onClick={() =>
                                    setExpandedIdeas((prev) => {
                                      const next = new Set(prev);
                                      if (next.has(idea.id)) next.delete(idea.id);
                                      else next.add(idea.id);
                                      return next;
                                    })
                                  }
                                >
                                  <span className="text-xs font-medium text-amber-600/90 shrink-0">Idea</span>
                                  <span className="text-sm font-medium truncate">{idea.title}</span>
                                  {(fields.impact || fields.effort) && (
                                    <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:inline">
                                      {[fields.effort, fields.impact].filter(Boolean).join(" · ")}
                                    </span>
                                  )}
                                  {ideaExpanded ? (
                                    <ChevronUp className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                                  ) : (
                                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                                  )}
                                </button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="gap-1.5 shrink-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConvertMilestonesDefaultName(idea.title);
                                    setConvertMilestonesOpen(true);
                                  }}
                                >
                                  <Flag className="h-3.5 w-3.5" />
                                  Convert to milestones
                                </Button>
                              </div>
                              {ideaExpanded && (
                                <div className="px-3 pb-3 pt-0 space-y-3 border-t border-border/40">
                                  {fields.problem && (
                                    <div>
                                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Problem</p>
                                      <p className="text-xs text-foreground/90">{fields.problem.slice(0, 400)}{fields.problem.length > 400 ? "…" : ""}</p>
                                    </div>
                                  )}
                                  {fields.solution && (
                                    <div>
                                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">Solution</p>
                                      <p className="text-xs text-foreground/90">{fields.solution.slice(0, 400)}{fields.solution.length > 400 ? "…" : ""}</p>
                                    </div>
                                  )}
                                  {(fields.impact || fields.effort || fields.successMetrics) && (
                                    <div className="flex flex-wrap gap-2">
                                      {fields.impact && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400">{fields.impact}</span>}
                                      {fields.effort && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{fields.effort}</span>}
                                      {fields.successMetrics && <span className="text-[10px] text-muted-foreground truncate max-w-[200px]" title={fields.successMetrics}>{fields.successMetrics.slice(0, 60)}…</span>}
                                    </div>
                                  )}
                                  <div className={cn("text-xs", markdownClasses)}>
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{idea.body}</ReactMarkdown>
                                  </div>
                                  <div className="pt-2 border-t border-border/40">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="gap-1.5"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConvertMilestonesDefaultName(idea.title);
                                        setConvertMilestonesOpen(true);
                                      }}
                                    >
                                      <Flag className="h-3.5 w-3.5" />
                                      Convert to milestones
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </SectionCard>
                );
              })}
            </>
          ) : (
            <>
              {/* Legacy: single intro block when not structured */}
              {parsed?.intro && (
                <SectionCard accentColor="amber">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 text-left"
                    onClick={() => setIntroExpanded((e) => !e)}
                  >
                    <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                    <h3 className="text-sm font-semibold">Context & vision</h3>
                    {introExpanded ? (
                      <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {introExpanded && (
                    <div className={cn("mt-3 p-2 pr-4", markdownClasses)}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(parsed.intro ?? "")}</ReactMarkdown>
                    </div>
                  )}
                </SectionCard>
              )}
            </>
          )}

          {/* Add new idea */}
          <SectionCard accentColor="amber">
            <div className="flex items-center gap-2 mb-3">
              <Plus className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold">Add idea (AI-improved)</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Type a short idea; we&apos;ll polish it with AI and append it to ideas.md.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Textarea
                className="min-h-[72px] flex-1 text-sm"
                placeholder="e.g. Command palette (⌘K) for quick project search"
                value={newIdeaRaw}
                onChange={(e) => setNewIdeaRaw(e.target.value)}
                disabled={improving}
              />
              <Button
                size="sm"
                className="gap-1.5 shrink-0"
                onClick={addImprovedIdea}
                disabled={!newIdeaRaw.trim() || improving}
              >
                {improving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Improve & add
              </Button>
            </div>
          </SectionCard>
        </div>
      </ScrollArea>

      <SharedDialog
        isOpen={showRawDialog}
        title={IDEAS_SETUP_PATH}
        onClose={() => setShowRawDialog(false)}
        panelClassName="max-w-4xl"
        bodyClassName="max-h-[80vh] overflow-auto"
      >
        {content != null && content.trim() !== "" ? (
          <div className={cn("p-2 whitespace-pre-wrap font-mono text-xs", markdownClasses)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{String(content)}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No content.</p>
        )}
      </SharedDialog>

      <ConvertToMilestonesDialog
        isOpen={convertMilestonesOpen}
        onClose={() => setConvertMilestonesOpen(false)}
        projectId={projectId}
        defaultName={convertMilestonesDefaultName}
      />
    </div>
  );
}
