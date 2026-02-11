import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Feature } from "@/types/project";

interface FeaturesDisplayListProps {
  features: Feature[];
}

export const FeaturesDisplayList: React.FC<FeaturesDisplayListProps> = ({
  features,
}) => {
  return (
    <ScrollArea className="h-[220px] rounded border p-2">
      <div className="space-y-2 text-sm">
        {features.map((f) => (
          <div key={f.id} className="rounded border p-2 bg-muted/20">
            <p className="font-medium truncate">{f.title}</p>
            <p className="text-xs text-muted-foreground">
              {f.prompt_ids.length} prompts · {f.project_paths.length} projects
            </p>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
