import { Checkbox } from "@/components/shadcn/checkbox";
import { ShadcnCardContent, ShadcnCardDescription, ShadcnCardHeader, ShadcnCardTitle } from "@/components/shadcn/card";
import { GlassCard } from "@/components/atoms/GlassCard";
import type { Prompt } from "@/types/project";

interface PromptsAndTimingProps {
  prompts: Prompt[];
  selectedPromptIds: number[];
  setSelectedPromptIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export function PromptsAndTiming({ prompts, selectedPromptIds, setSelectedPromptIds }: PromptsAndTimingProps) {
  return (
    <GlassCard>
      <ShadcnCardHeader>
        <ShadcnCardTitle className="text-lg">Prompts &amp; timing</ShadcnCardTitle>
        <ShadcnCardDescription className="text-base">
          Select which prompt IDs to run. Timing (delays, etc.) is configured on the Configuration page.
        </ShadcnCardDescription>
      </ShadcnCardHeader>
      <ShadcnCardContent>
        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50"
            >
              <Checkbox
                checked={selectedPromptIds.includes(p.id)}
                onCheckedChange={(checked) => {
                  setSelectedPromptIds((prev) =>
                    checked ? [...prev, p.id] : prev.filter((id) => id !== p.id)
                  );
                }}
              />
              <span className="text-sm">
                {p.id}: {p.title}
              </span>
            </label>
          ))}
        </div>
      </ShadcnCardContent>
    </GlassCard>
  );
}
