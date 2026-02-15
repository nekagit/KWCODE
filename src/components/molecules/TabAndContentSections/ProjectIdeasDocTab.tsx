"use client";

import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Loader2,
  Lightbulb,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ScanSearch,
} from "lucide-react";
import { readProjectFileOrEmpty, writeProjectFile, analyzeProjectDoc } from "@/lib/api-projects";
import { isTauri } from "@/lib/tauri";
import { useRunStore, registerRunCompleteHandler } from "@/store/run-store";
import {
  parseIdeasMd,
  serializeIdeasMd,
  buildNumberedBlock,
  buildBulletBlock,
  improvedTextToTitleAndBody,
  type ParsedIdeasDoc,
  type IdeaBlock,
} from "@/lib/ideas-md";
import type { Project } from "@/types/project";
import { SectionCard } from "@/components/shared/DisplayPrimitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog as SharedDialog } from "@/components/shared/Dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const IDEAS_SETUP_PATH = ".cursor/setup/ideas.md";
const IDEAS_PROMPT_PATH = ".cursor/prompts/ideas.md";
const markdownClasses =
  "text-sm text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 last:[&_p]:mb-0 [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:rounded";

interface ProjectIdeasDocTabProps {
  project: Project;
  projectId: string;
}

export function ProjectIdeasDocTab({ project, projectId }: ProjectIdeasDocTabProps) {
  const [content, setContent] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedIdeasDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [introExpanded, setIntroExpanded] = useState(false);
  const [showRawDialog, setShowRawDialog] = useState(false);
  const [newIdeaRaw, setNewIdeaRaw] = useState("");
  const [improving, setImproving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchDoc = useCallback(async () => {
    if (!project.repoPath) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const text = await readProjectFileOrEmpty(projectId, IDEAS_SETUP_PATH, project.repoPath);
      setContent(text && text.trim() ? text : null);
      setParsed(text && text.trim() ? parseIdeasMd(text) : { intro: "", ideas: [], format: "bullets" });
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
  }, [fetchDoc]);

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

  const deleteIdea = useCallback(
    async (ideaId: string) => {
      if (!parsed) return;
      const next = parsed.ideas.filter((i) => i.id !== ideaId);
      await saveDoc(parsed.intro, next, parsed.format);
    },
    [parsed, saveDoc]
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
      await analyzeProjectDoc(projectId, IDEAS_PROMPT_PATH, IDEAS_SETUP_PATH, project.repoPath ?? undefined);
      await fetchDoc();
      toast.success("Ideas doc updated from prompt.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analyze failed");
    } finally {
      setAnalyzing(false);
    }
  }, [projectId, fetchDoc]);

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
          <Button
            variant="default"
            size="sm"
            className="gap-1.5"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanSearch className="h-3.5 w-3.5" />}
            Analyze
          </Button>
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
          {/* Intro block (collapsible) */}
          {parsed.intro && (
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
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {String(parsed.intro ?? "")}
                  </ReactMarkdown>
                </div>
              )}
            </SectionCard>
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

          {/* Idea cards */}
          <SectionCard accentColor="amber">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-semibold">Ideas</h3>
              {parsed.ideas.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {parsed.ideas.length} item{parsed.ideas.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {parsed.ideas.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
                No ideas yet. Add one above or edit {IDEAS_SETUP_PATH} in your repo.
              </div>
            ) : (
              <div className="space-y-3">
                {parsed.ideas.map((idea) => (
                  <div
                    key={idea.id}
                    className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/80 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium leading-tight">{idea.title}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm("Remove this idea from ideas.md?")) deleteIdea(idea.id);
                        }}
                        aria-label="Delete idea"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {idea.body ? (
                      <div
                        className={cn("text-xs text-muted-foreground [&_p]:mb-1 last:[&_p]:mb-0", markdownClasses)}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {String(idea.body).slice(0, 500) + (idea.body.length > 500 ? "…" : "")}
                        </ReactMarkdown>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
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
    </div>
  );
}
