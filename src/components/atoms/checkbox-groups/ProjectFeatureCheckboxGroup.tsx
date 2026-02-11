import React from 'react';
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers } from "lucide-react";
import { CheckboxComponent } from "@/components/shared/CheckboxComponent";

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
            <CheckboxComponent
              key={f.id}
              id={f.id}
              label={f.title}
              checked={selectedFeatureIds.includes(f.id)}
              onCheckedChange={() => onToggleFeature(f.id)}
            />
          ))}
          {features.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No features. Add some on the Feature tab.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
