"use client";

import { Card } from "@/components/shared/Card";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { TitleWithIcon } from "@/components/atoms/TitleWithIcon";
import { AiGeneratorInput } from "@/components/atoms/AiGeneratorInput";

interface TestGenerationCardProps {
  aiPrompt: string;
  setAiPrompt: (value: string) => void;
  aiLoading: boolean;
  aiResult: string | null;
  handleAiGenerate: () => Promise<void>;
}

export function TestGenerationCard({
  aiPrompt,
  setAiPrompt,
  aiLoading,
  aiResult,
  handleAiGenerate,
}: TestGenerationCardProps) {
  return (
    <Card
      title={<TitleWithIcon icon={Sparkles} title="AI test generation" className="text-lg" />}
      subtitle="Describe what you want to test; we generate a short test plan or outline (uses prompt API)."
    >
      <AiGeneratorInput
        placeholder="e.g. login form validation, API /users GET, checkout flow"
        value={aiPrompt}
        onChange={setAiPrompt}
        onGenerate={handleAiGenerate}
        loading={aiLoading}
      />
      {aiResult && (
        <div className="rounded-lg border bg-muted/30 p-4 text-sm whitespace-pre-wrap mt-4">
          {aiResult}
        </div>
      )}
    </Card>
  );
}
