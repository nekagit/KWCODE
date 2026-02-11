import React from 'react';
import { Checkbox } from "@/components/shadcn/checkbox";
import { Folders } from "lucide-react";

interface ProjectCheckboxItemProps {
  path: string;
  isChecked: boolean;
  onToggle: (path: string) => void;
}

export const ProjectCheckboxItem: React.FC<ProjectCheckboxItemProps> = ({
  path,
  isChecked,
  onToggle,
}) => {
  return (
    <label
      key={path}
      className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 hover:bg-muted/50"
    >
      <Checkbox
        checked={isChecked}
        onCheckedChange={() => onToggle(path)}
      />
      <span className="text-sm truncate max-w-[320px]" title={path}>
        {path.split("/").pop() ?? path}
      </span>
    </label>
  );
};
