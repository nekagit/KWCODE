"use client";

import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { LoadingState } from "@/components/shared/EmptyState";
import { AiGeneratorInput } from "@/components/atoms/inputs/AiGeneratorInput";
import { AiArchitectureListItem } from "@/components/atoms/list-items/AiArchitectureListItem";
import type { ArchitectureRecord, ArchitectureCategory } from "@/types/architecture";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/AiGeneratedArchitecturesCard.tsx");

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

  const handleAiGenerate = useCallback(async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiResults([]);
    try {
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
  }, [aiTopic, aiCount]);

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
