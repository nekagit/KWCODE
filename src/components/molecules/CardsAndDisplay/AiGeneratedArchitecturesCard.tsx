"use client";

/** Ai Generated Architectures Card component. */
import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { LoadingState } from "@/components/shared/EmptyState";
import { AiGeneratorInput } from "@/components/atoms/inputs/AiGeneratorInput";
import { AiArchitectureListItem } from "@/components/atoms/list-items/AiArchitectureListItem";
import { isTauri } from "@/lib/tauri";
import { useRunStore, registerRunCompleteHandler } from "@/store/run-store";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/AiGeneratedArchitecturesCard.tsx");

const ARCH_CATEGORIES = ["ddd", "tdd", "bdd", "dry", "solid", "kiss", "yagni", "clean", "hexagonal", "cqrs", "event_sourcing", "microservices", "rest", "graphql", "scenario"] as const;

type AiResult = ArchitectureRecord;

interface AiGeneratedArchitecturesCardProps {
  CATEGORY_LABELS: Record<ArchitectureCategory, string>;
  addFromAi: (item: AiResult) => Promise<void>;
}

export function AiGeneratedArchitecturesCard({ CATEGORY_LABELS, addFromAi }: AiGeneratedArchitecturesCardProps) {
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(3);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<AiResult[]>([]);

  const runTempTicket = useRunStore((s) => s.runTempTicket);
  const defaultProjectPath = useRunStore((s) => s.activeProjects[0] ?? s.allProjects[0] ?? "");

  const handleAiGenerate = useCallback(async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiResults([]);
    try {
      if (isTauri && defaultProjectPath) {
        const res = await fetch("/api/generate-architectures", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: aiTopic.trim(), count: aiCount, promptOnly: true }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || err.detail || res.statusText);
        }
        const data = (await res.json()) as { prompt?: string };
        const prompt = data.prompt;
        if (!prompt) throw new Error("No prompt returned");
        const requestId = `arch-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        registerRunCompleteHandler(`parse_architectures:${requestId}`, (stdout: string) => {
          const jsonMatch = stdout.match(/\[[\s\S]*\]/);
          const jsonStr = jsonMatch ? jsonMatch[0] : stdout;
          try {
            const parsed = JSON.parse(jsonStr) as { name?: string; description?: string; category?: string; practices?: string; scenarios?: string }[];
            const architectures = (Array.isArray(parsed) ? parsed : []).slice(0, aiCount).map((item) => ({
              id: crypto.randomUUID(),
              name: String(item.name ?? "Untitled").slice(0, 200),
              description: String(item.description ?? "").slice(0, 800),
              category: (ARCH_CATEGORIES.includes((item.category as (typeof ARCH_CATEGORIES)[number]) ?? "scenario") ? item.category : "scenario") as ArchitectureCategory,
              practices: String(item.practices ?? "").slice(0, 2000),
              scenarios: String(item.scenarios ?? "").slice(0, 2000),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })) as ArchitectureRecord[];
            setAiResults(architectures);
            if (!architectures.length) toast.info("No results. Try another topic.");
          } catch {
            toast.error("Could not parse agent output");
          }
          setAiLoading(false);
        });
        await runTempTicket(defaultProjectPath, prompt, "Generate architectures", {
          onComplete: "parse_architectures",
          payload: { requestId },
        });
        toast.success("Generate architectures running in Run tab.");
        return;
      }
      const res = await fetch("/api/generate-architectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), count: aiCount }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || res.statusText);
      }
      const data = await res.json();
      setAiResults(Array.isArray(data.architectures) ? data.architectures : []);
      if (!data.architectures?.length) toast.info("No results. Try another topic.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setAiLoading(false);
    }
  }, [aiTopic, aiCount, defaultProjectPath, runTempTicket]);

  return (
    <Card
      title={<TitleWithIcon icon={Sparkles} title="AI generated" className={classes[0]} iconClassName="text-primary/90" />}
      subtitle="Enter a topic or scenario; we&apos;ll suggest architecture definitions you can add to My definitions."
    >
      <AiGeneratorInput
        value={aiTopic}
        onChange={setAiTopic}
        onGenerate={handleAiGenerate}
        loading={aiLoading}
      />
      {aiLoading ? (
        <LoadingState />
      ) : aiResults.length > 0 && (
        <ScrollArea className={classes[1]}>
          <ul className={classes[2]}>
            {aiResults.map((item, i) => (
              <AiArchitectureListItem
                key={item.id ?? i}
                item={item}
                CATEGORY_LABELS={CATEGORY_LABELS}
                onAddFromAi={addFromAi}
              />
            ))}
          </ul>
        </ScrollArea>
      )}
    </Card>
  );
}
