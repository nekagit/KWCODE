import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PromptGeneratorFormProps {
  generateDescription: string;
  setGenerateDescription: (description: string) => void;
  handleGenerate: () => Promise<void>;
  generateLoading: boolean;
}

export const PromptGeneratorForm: React.FC<PromptGeneratorFormProps> = ({
  generateDescription,
  setGenerateDescription,
  handleGenerate,
  generateLoading,
}) => {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="generate-desc">Description</Label>
        <Textarea
          id="generate-desc"
          value={generateDescription}
          onChange={(e) => setGenerateDescription(e.target.value)}
          placeholder="e.g. A prompt that refactors React components to use TypeScript and strict typing"
          rows={4}
        />
      </div>
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={handleGenerate}
          disabled={!generateDescription.trim() || generateLoading}
        >
          {generateLoading ? "Generating..." : "Generate"}
        </Button>
      </div>
    </>
  );
};
