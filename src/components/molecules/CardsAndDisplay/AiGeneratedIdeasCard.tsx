import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/AiGeneratedIdeasCard.tsx");
import { LoadingState } from "@/components/shared/EmptyState";
import { AiGeneratorInput } from "@/components/atoms/inputs/AiGeneratorInput";
import { AiIdeaListItem } from "@/components/atoms/list-items/AiIdeaListItem";
import { isTauri } from "@/lib/tauri";
import { useRunStore, registerRunCompleteHandler } from "@/store/run-store";

import type { IdeaCategory, IdeaRecord } from "@/types/idea";

const CATEGORIES = ["saas", "iaas", "paas", "website", "webapp", "webshop", "other"] as const;

interface AiGeneratedIdeasCardProps {
  CATEGORY_LABELS: Record<IdeaCategory, string>;
  addToMyIdeas: (item: IdeaRecord, source: "ai") => Promise<void>;
}

export function AiGeneratedIdeasCard({ CATEGORY_LABELS, addToMyIdeas }: AiGeneratedIdeasCardProps) {
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(3);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<IdeaRecord[]>([]);

  const runTempTicket = useRunStore((s) => s.runTempTicket);
  const defaultProjectPath = useRunStore((s) => s.activeProjects[0] ?? s.allProjects[0] ?? "");

  const handleAiGenerate = useCallback(async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiResults([]);
    try {
      if (isTauri && defaultProjectPath) {
        const res = await fetch("/api/generate-ideas", {
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
        const requestId = `ideas-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        registerRunCompleteHandler(`parse_ideas:${requestId}`, (stdout: string) => {
          const jsonMatch = stdout.match(/\[[\s\S]*\]/);
          const jsonStr = jsonMatch ? jsonMatch[0] : stdout;
          try {
            const parsed = JSON.parse(jsonStr) as { title?: string; description?: string; category?: string }[];
            const ideas = (Array.isArray(parsed) ? parsed : []).slice(0, aiCount).map((item, i) => ({
              id: Math.floor(Math.random() * 1000000) + i,
              title: String(item.title ?? "Untitled").slice(0, 200),
              description: String(item.description ?? "").slice(0, 1000),
              category: (CATEGORIES.includes((item.category as (typeof CATEGORIES)[number]) ?? "other") ? item.category : "other") as IdeaRecord["category"],
              source: "ai" as const,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })) as IdeaRecord[];
            setAiResults(ideas);
            if (!ideas.length) toast.info("No results. Try another topic.");
          } catch {
            toast.error("Could not parse agent output");
          }
          setAiLoading(false);
        });
        await runTempTicket(defaultProjectPath, prompt, "Generate ideas", {
          onComplete: "parse_ideas",
          payload: { requestId },
        });
        toast.success("Generate ideas running in Run tab.");
        return;
      }
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), count: aiCount }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || res.statusText);
      }
      const data = await res.json();
      setAiResults(Array.isArray(data.ideas) ? data.ideas : []);
      if (!data.ideas?.length) toast.info("No results. Try another topic.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setAiLoading(false);
    }
  }, [aiTopic, aiCount, defaultProjectPath, runTempTicket]);

  return (
    <Card
      title={<TitleWithIcon icon={Sparkles} title="AI generated ideas" className={classes[0]} iconClassName="text-primary/90" />}
      subtitle="Enter a topic or scenario; we&apos;ll suggest business ideas you can add to My ideas."
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
              <AiIdeaListItem
                key={i}
                item={item}
                CATEGORY_LABELS={CATEGORY_LABELS}
                onAddFromAi={async (item) => {
                  const newItem = {
                    ...item,
                    id: Math.floor(Math.random() * 1000000), // temp ID, replace with real ID from backend
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };
                  await addToMyIdeas(newItem, "ai");
                }}
              />
            ))}
          </ul>
        </ScrollArea>
      )}
    </Card>
  );
}