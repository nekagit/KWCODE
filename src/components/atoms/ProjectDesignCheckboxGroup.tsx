import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Palette } from "lucide-react";

interface ProjectDesignCheckboxGroupProps {
  designs: { id: string; name: string }[];
  selectedDesignIds: string[];
  onToggleDesign: (id: string) => void;
}

export const ProjectDesignCheckboxGroup: React.FC<ProjectDesignCheckboxGroupProps> = ({
  designs,
  selectedDesignIds,
  onToggleDesign,
}) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Palette className="h-4 w-4" />
        Designs ({selectedDesignIds.length} linked)
      </Label>
      <ScrollArea className="h-[180px] rounded border p-2">
        <div className="space-y-2">
          {designs.map((d) => (
            <label key={d.id} className="flex items-center gap-2 cursor-pointer text-sm rounded px-2 py-1 hover:bg-muted/50">
              <Checkbox
                checked={selectedDesignIds.includes(d.id)}
                onCheckedChange={() => onToggleDesign(d.id)}
              />
              <span className="truncate">{d.name}</span>
            </label>
          ))}
          {designs.length === 0 && (
            <p className="text-xs text-muted-foreground p-2">No designs. Save from Design page first.</p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
