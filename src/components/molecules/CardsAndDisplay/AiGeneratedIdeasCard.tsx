"use client";

import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/TitleWithIcon";
import { AiGeneratorInput } from "@/components/atoms/AiGeneratorInput";
import { AiIdeaListItem } from "@/components/atoms/AiIdeaListItem";
import { LoadingState } from "@/components/shared/EmptyState";

interface IdeaCategoryLabels {
  saas: string;
  iaas: string;
  paas: string;
  website: string;
  webapp: string;
  webshop: string;
  other: string;
}

interface AiGeneratedIdeasCardProps {
  CATEGORY_LABELS: IdeaCategoryLabels;
  addToMyIdeas: (item: { title: string; description: string; category: keyof IdeaCategoryLabels }, source: "template" | "ai") => Promise<void>;
}

export function AiGeneratedIdeasCard({ CATEGORY_LABELS, addToMyIdeas }: AiGeneratedIdeasCardProps) {
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<{ title: string; description: string; category: keyof IdeaCategoryLabels }[]>([]);

  const handleGenerate = useCallback(async () => {
    if (!aiTopic.trim()) return;
    setAiLoading(true);
    setAiResults([]);
    try {
      const res = await fetch("/api/generate-ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic.trim(), count: 5 }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || res.statusText);
      }
      const data = await res.json();
      setAiResults(Array.isArray(data.ideas) ? data.ideas : []);
      if (!data.ideas?.length) toast.info("No ideas returned. Try another topic.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setAiLoading(false);
    }
  }, [aiTopic]);

  return (
    <Card
      title={<TitleWithIcon icon={Sparkles} title="AI generated ideas" className="text-lg" />}
      subtitle="Enter a topic or niche; we&apos;ll suggest ideas you can add to My ideas."
    >
      <AiGeneratorInput
        placeholder="e.g. developer tools, fitness apps, B2B HR"
        value={aiTopic}
        onChange={setAiTopic}
        onGenerate={handleGenerate}
        loading={aiLoading}
      />
      {aiLoading ? (
        <LoadingState />
      ) : aiResults.length > 0 && (
        <ScrollArea className="h-[400px] pr-4 mt-4">
          <ul className="space-y-3">
            {aiResults.map((idea, i) => (
              <AiIdeaListItem
                key={i}
                idea={idea}
                CATEGORY_LABELS={CATEGORY_LABELS}
                onAddToMyIdeas={addToMyIdeas}
              />
            ))}
          </ul>
        </ScrollArea>
      )}
    </Card>
  );
}
