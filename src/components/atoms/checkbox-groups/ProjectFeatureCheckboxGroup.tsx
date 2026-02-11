import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers } from "lucide-react";

type FeatureItem = { id: string; title: string };

interface ProjectFeatureCheckboxGroupProps {
  features: FeatureItem[];
  selectedFeatureIds: string[];
  onToggleFeature: (id: string) => void;
}

export const ProjectFeatureCheckboxGroup: React.FC<ProjectFeatureCheckboxGroupProps> = ({
  features,
  selectedFeatureIds,
  onToggleFeature,
}) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Layers className="h-4 w-4" />
        Features ({selectedFeatureIds.length} linked)
      </Label>
      <ScrollArea className="h-[180px] rounded border p-2">
        <div className="space-y-2">
          {features.map((f) => (
            <label key={f.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
              <Checkbox
                checked={selectedFeatureIds.includes(f.id)}
                onCheckedChange={() => onToggleFeature(f.id)}
              />
              <span className="truncate">{f.title}</span>
            </label>
          ))}
          {features.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No features. Add some on the Feature tab.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
