import React from 'react';
import sharedClasses from './shared-classes';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CheckboxComponentProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const CheckboxComponent: React.FC<CheckboxComponentProps> = ({
  id,
  label,
  checked,
  onCheckedChange,
}) => {
  return (
    <div data-shared-ui className={sharedClasses.CheckboxComponent.root}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  );
};
