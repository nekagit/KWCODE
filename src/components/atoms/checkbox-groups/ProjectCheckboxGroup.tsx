import React from 'react';
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckboxComponent } from "@/components/shared/CheckboxComponent";

interface ProjectCheckboxGroupProps {
  label: string;
  items: { id: string; name: string }[];
  selectedItems: string[];
  onToggleItem: (id: string) => void;
}

export const ProjectCheckboxGroup: React.FC<ProjectCheckboxGroupProps> = ({
  label,
  items,
  selectedItems,
  onToggleItem,
}) => {
  const handleCheckedChange = (id: string, checked: boolean) => {
    onToggleItem(id);
  };

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <ScrollArea className="h-[100px] rounded border p-2">
        <div className="space-y-1">
          {items.map((item) => {
            return (
              <CheckboxComponent
                key={item.id}
                id={item.id}
                label={item.name}
                checked={selectedItems.includes(item.id)}
                onCheckedChange={(checked: boolean) => handleCheckedChange(item.id, checked)}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
