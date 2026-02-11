import React from 'react';
import { Checkbox } from "@/components/shadcn/checkbox";
import { Label } from "@/components/shadcn/label";
import { ScrollArea } from "@/components/shadcn/scroll-area";

interface ProjectCheckboxGroupProps {
  allProjects: string[];
  selectedProjectPaths: string[];
  onSelectionChange: (paths: string[]) => void;
}

export const ProjectCheckboxGroup: React.FC<ProjectCheckboxGroupProps> = ({
  allProjects,
  selectedProjectPaths,
  onSelectionChange,
}) => {
  const handleCheckedChange = (path: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedProjectPaths, path]
      : selectedProjectPaths.filter((p) => p !== path);
    onSelectionChange(newSelection);
  };

  return (
    <div className="grid gap-2">
      <Label>Projects (optional — leave empty to use active list)</Label>
      <ScrollArea className="h-[100px] rounded border p-2">
        <div className="space-y-1">
          {allProjects.map((path) => {
            const name = path.split("/").pop() ?? path;
            return (
              <label
                key={path}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={selectedProjectPaths.includes(path)}
                  onCheckedChange={(checked: boolean) => handleCheckedChange(path, checked)}
                />
                {name}
              </label>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
