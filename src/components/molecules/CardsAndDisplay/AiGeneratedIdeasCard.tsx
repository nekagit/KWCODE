import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
fetch('http://127.0.0.1:7242/ingest/3a8fa5bb-85c1-4305-bdaa-558e16902420',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'src/components/molecules/CardsAndDisplay/AiGeneratedIdeasCard.tsx:6',message:'TitleWithIcon imported in AiGeneratedIdeasCard',data:{typeofTitleWithIcon:typeof TitleWithIcon},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
import { LoadingState } from "@/components/shared/EmptyState";
import { AiGeneratorInput } from "@/components/atoms/inputs/AiGeneratorInput";
import { AiIdeaListItem } from "@/components/atoms/list-items/AiIdeaListItem";

import type { IdeaCategory, IdeaRecord } from "@/types/idea";

interface AiGeneratedIdeasCardProps {
  CATEGORY_LABELS: Record<IdeaCategory, string>;
  addToMyIdeas: (item: IdeaRecord, source: "ai") => Promise<void>;
}

export function AiGeneratedIdeasCard({ CATEGORY_LABELS, addToMyIdeas }: AiGeneratedIdeasCardProps) {
  const [aiTopic, setAiTopic] = useState("");
  const [aiCount, setAiCount] = useState(3);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<IdeaRecord[]>([]);

  const handleAiGenerate = useCallback(async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiResults([]);
    try {
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
  }, [aiTopic, aiCount]);

  return (
    <Card
      title={<TitleWithIcon icon={Sparkles} title="AI generated ideas" className="text-lg" />}
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
        <ScrollArea className="h-[400px] pr-4 mt-4">
          <ul className="space-y-3">
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