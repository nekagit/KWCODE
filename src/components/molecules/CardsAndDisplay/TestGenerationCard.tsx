"use client";

/** Test Generation Card component. */
import { Card } from "@/components/shared/Card";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";
import { TitleWithIcon } from "@/components/atoms/headers/TitleWithIcon";
import { AiGeneratorInput } from "@/components/atoms/inputs/AiGeneratorInput";
import { getClasses } from "@/components/molecules/tailwind-molecules";
const classes = getClasses("CardsAndDisplay/TestGenerationCard.tsx");

interface TestGenerationCardProps {
  aiPromptRecord: string;
  setAiPromptRecord: (value: string) => void;
  aiLoading: boolean;
  aiResult: string | null;
  handleAiGenerate: () => Promise<void>;
}

export function TestGenerationCard({
  aiPromptRecord,
  setAiPromptRecord,
  aiLoading,
  aiResult,
  handleAiGenerate,
}: TestGenerationCardProps) {
  return (
    <Card
      title={<TitleWithIcon icon={Sparkles} title="AI test generation" className={classes[0]} iconClassName="text-primary/90" />}
      subtitle="Describe what you want to test; we generate a short test plan or outline (uses prompt API)."
    >
      <AiGeneratorInput
        placeholder="e.g. login form validation, API /users GET, checkout flow"
        value={aiPromptRecord}
        onChange={setAiPromptRecord}
        onGenerate={handleAiGenerate}
        loading={aiLoading}
      />
      {aiResult && (
        <div className={classes[1]}>
          {aiResult}
        </div>
      )}
    </Card>
  );
}
