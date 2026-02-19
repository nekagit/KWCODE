/** Project Checkbox Item component. */
import React from 'react';
import { CheckboxComponent } from "@/components/shared/CheckboxComponent";

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
  const name = path.split("/").pop() ?? path;
  return (
    <div className="rounded-md border px-3 py-2 hover:bg-muted/50">
      <CheckboxComponent
        id={path}
        label={name}
        checked={isChecked}
        onCheckedChange={() => onToggle(path)}
      />
    </div>
  );
};