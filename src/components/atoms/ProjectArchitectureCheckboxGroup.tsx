import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2 } from "lucide-react";

interface ProjectArchitectureCheckboxGroupProps {
  architectures: { id: string; name: string }[];
  selectedArchitectureIds: string[];
  onToggleArchitecture: (id: string) => void;
}

export const ProjectArchitectureCheckboxGroup: React.FC<ProjectArchitectureCheckboxGroupProps> = ({
  architectures,
  selectedArchitectureIds,
  onToggleArchitecture,
}) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Building2 className="h-4 w-4" />
        Architecture ({selectedArchitectureIds.length} linked)
      </Label>
      <ScrollArea className="h-[180px] rounded border p-2">
        <div className="space-y-2">
          {architectures.map((a) => (
            <label key={a.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
              <Checkbox
                checked={selectedArchitectureIds.includes(a.id)}
                onCheckedChange={() => onToggleArchitecture(a.id)}
              />
              <span className="truncate">{a.name}</span>
            </label>
          ))}
          {architectures.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No architectures. Add from Architecture page first.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
