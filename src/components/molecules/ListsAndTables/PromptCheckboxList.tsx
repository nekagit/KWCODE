import { Checkbox } from "@/components/shadcn/checkbox";
import type { Prompt } from "@/types/project";

interface PromptCheckboxListProps {
  prompts: Prompt[];
  selectedPromptIds: number[];
  setSelectedPromptIds: React.Dispatch<React.SetStateAction<number[]>>;
}

export function PromptCheckboxList({
  prompts,
  selectedPromptIds,
  setSelectedPromptIds,
}: PromptCheckboxListProps) {
  return (
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
  );
}
