import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";

interface ProjectCheckboxListItemProps {
  path: string;
  name: string;
  isChecked: boolean;
  onToggle: (path: string) => void;
}

export const ProjectCheckboxListItem: React.FC<ProjectCheckboxListItemProps> = ({
  path,
  name,
  isChecked,
  onToggle,
}) => {
  return (
    <label
      key={path}
      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted/50"
    >
      <Checkbox checked={isChecked} onCheckedChange={() => onToggle(path)} />
      <span className="truncate text-sm font-mono" title={path}>
        {name}
      </span>
    </label>
  );
};
