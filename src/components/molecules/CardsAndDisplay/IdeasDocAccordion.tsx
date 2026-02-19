"use client";

/** Ideas Doc Accordion component. */
import { useState, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2, FileText, Lightbulb, ArrowRightCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  parseIdeasMd,
  parseIdeasMdStructured,
  getIdeaFields,
  type IdeaBlock,
  type IdeasStructuredDoc,
  type IdeasStructuredSection,
  type ParsedIdeasDoc,
} from "@/lib/ideas-md";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { IDEAS_DOC_PATH } from "@/lib/cursor-paths";
const IDEAS_MD_PATH = IDEAS_DOC_PATH;
const markdownClasses =
  "text-sm text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-2 last:[&_p]:mb-0 [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:rounded";

export interface IdeasDocAccordionProps {
  /** Called after an idea is converted to DB so parent can refresh My ideas list */
  onConvert?: () => void;
}

export function IdeasDocAccordion({ onConvert }: IdeasDocAccordionProps) {
  const [content, setContent] = useState<string | null>(null);
  const [structured, setStructured] = useState<IdeasStructuredDoc | null>(null);
  const [parsed, setParsed] = useState<ParsedIdeasDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const fetchDoc = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data/ideas-doc");
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { content?: string | null };
      const text = data.content && data.content.trim() ? data.content : null;
      setContent(text);
      if (text) {
        setStructured(parseIdeasMdStructured(text));
        setParsed(parseIdeasMd(text));
      } else {
        setStructured(null);
        setParsed(null);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load ideas.md");
      setContent(null);
      setStructured(null);
      setParsed(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoc();
  }, [fetchDoc]);

  const handleConvert = useCallback(
    async (idea: IdeaBlock) => {
      setConvertingId(idea.id);
      try {
        const title = idea.title.trim() || "Untitled idea";
        const description = idea.body?.trim() || idea.raw?.trim() || "";
        const res = await fetch("/api/data/ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            description,
            category: "other",
            source: "manual",
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error || res.statusText);
        }
        toast.success("Idea added to My ideas");
        onConvert?.();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to convert idea");
      } finally {
        setConvertingId(null);
      }
    },
    [onConvert]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border/40 bg-muted/10 py-12">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Loading ideas.md…</p>
        </div>
      </div>
    );
  }

  if (!content || (!structured?.isStructured && !parsed?.ideas?.length)) {
    return (
      <div className="rounded-xl border border-border/40 bg-muted/10 p-6 text-center">
        <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No <code className="rounded bg-muted px-1 py-0.5 text-xs">{IDEAS_MD_PATH}</code> in the
          workspace, or it has no parseable ideas.
        </p>
      </div>
    );
  }

  const renderIdeaRow = (idea: IdeaBlock) => {
    const fields = getIdeaFields(idea.body);
    const isConverting = convertingId === idea.id;
    return (
      <div
        key={idea.id}
        className="flex flex-col gap-2 rounded-lg border border-border/50 bg-card/50 p-3"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{idea.title}</p>
            {(fields.problem || fields.solution) && (
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                {fields.problem || fields.solution || ""}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() => handleConvert(idea)}
            disabled={isConverting}
          >
            {isConverting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ArrowRightCircle className="h-3.5 w-3.5" />
            )}
            Convert
          </Button>
        </div>
        {idea.body && (
          <div className={cn("text-xs border-t border-border/40 pt-2", markdownClasses)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{idea.body}</ReactMarkdown>
          </div>
        )}
      </div>
    );
  };

  if (structured?.isStructured && structured.sections.length > 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          From {IDEAS_MD_PATH}
        </h3>
        <Accordion
          type="multiple"
          className="w-full rounded-xl border border-border/40 bg-muted/5 p-2"
          defaultValue={
            structured.sections.some((s) => s.id === "section-preamble")
              ? ["section-preamble"]
              : structured.sections[0]
                ? [structured.sections[0].id]
                : []
          }
        >
          {structured.sections.map((section: IdeasStructuredSection) => (
            <AccordionItem key={section.id} value={section.id} className="border-border/40">
              <AccordionTrigger className="text-left hover:no-underline py-3">
                <span className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
                  {section.title}
                  {section.ideas.length > 0 && (
                    <span className="text-xs font-normal text-muted-foreground">
                      ({section.ideas.length} idea{section.ideas.length !== 1 ? "s" : ""})
                    </span>
                  )}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-3">
                {section.content && (
                  <div className={cn("mb-4 p-2 rounded-md bg-muted/30", markdownClasses)}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{section.content}</ReactMarkdown>
                  </div>
                )}
                <div className="space-y-2">
                  {section.ideas.map((idea) => renderIdeaRow(idea))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
  }

  // Fallback: flat list from parseIdeasMd (intro + ideas)
  const ideas = parsed?.ideas ?? [];
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        From {IDEAS_MD_PATH}
      </h3>
      <Accordion type="multiple" className="w-full rounded-xl border border-border/40 bg-muted/5 p-2" defaultValue={["intro"]}>
        {parsed?.intro && (
          <AccordionItem value="intro" className="border-border/40">
            <AccordionTrigger className="text-left hover:no-underline py-3">
              Context &amp; vision
            </AccordionTrigger>
            <AccordionContent className={cn("pt-1 pb-3", markdownClasses)}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{parsed.intro}</ReactMarkdown>
            </AccordionContent>
          </AccordionItem>
        )}
        <AccordionItem value="ideas" className="border-border/40">
          <AccordionTrigger className="text-left hover:no-underline py-3">
            <span className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
              Ideas ({ideas.length})
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-1 pb-3">
            <div className="space-y-2">
              {ideas.map((idea) => renderIdeaRow(idea))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
