"use client";

import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/shared/Card";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { AiGeneratorInput } from "@/components/atoms/inputs/AiGeneratorInput";
import { LoadingState } from "@/components/shared/EmptyState";
import { IdeaCategory, IdeaRecord } from "@/components/organisms/IdeasPageContent";
import { IdeaListItem } from "@/components/atoms/list-items/IdeaListItem";

interface AiGeneratedIdeasCardProps {
  CATEGORY_LABELS: Record<IdeaCategory, string>;
  addToMyIdeas: (item: { title: string; description: string; category: IdeaCategory }, source: "template" | "ai") => Promise<void>;
}

export function AiGeneratedIdeasCard({ CATEGORY_LABELS, addToMyIdeas }: AiGeneratedIdeasCardProps) {
  const [aiTopic, setAiTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<{ title: string; description: string; category: IdeaCategory }[]>([]);

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

  const handleGenerateProject = async (ideaId: number) => {
    // This component does not directly handle project generation.
    // The parent (IdeasPageContent) is responsible for this.
    // For now, we'll log a message.
    console.log(`Generate project for idea ID: ${ideaId}`);
  };

  const handleOpenEdit = (idea: IdeaRecord) => {
    // This component does not directly handle editing.
    // The parent (IdeasPageContent) is responsible for this.
    // For now, we'll log a message.
    console.log(`Open edit for idea: ${idea.title}`);
  };

  const handleDelete = async (ideaId: number) => {
    // This component does not directly handle deletion.
    // The parent (IdeasPageContent) is responsible for this.
    // For now, we'll log a message.
    console.log(`Delete idea ID: ${ideaId}`);
  };

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
              <IdeaListItem
                key={i}
                idea={{ ...idea, id: i, source: "ai" }} // Provide a unique ID and source
                CATEGORY_LABELS={CATEGORY_LABELS}
                generatingProjectIdeaId={null} // Or connect to actual state if exists
                onGenerateProject={handleGenerateProject}
                onOpenEdit={handleOpenEdit} // Pass the placeholder for now
                onDelete={handleDelete} // Pass the placeholder for now
              />
            ))}
          </ul>
        </ScrollArea>
      )}
    </Card>
  );
}
