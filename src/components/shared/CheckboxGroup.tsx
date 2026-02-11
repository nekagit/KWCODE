import React from 'react';
import sharedClasses from './shared-classes';
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckboxComponent } from "@/components/shared/CheckboxComponent";

interface CheckboxGroupProps<T extends { id: string | number; name: string }> {
  label: string;
  items: T[];
  selectedItems: (string | number)[];
  onToggleItem: (id: string | number) => void;
  emptyMessage?: string;
}

export const CheckboxGroup = <T extends { id: string | number; name: string }>({
  label,
  items,
  selectedItems,
  onToggleItem,
  emptyMessage = "No items to display.",
}: CheckboxGroupProps<T>) => {
  const handleCheckedChange = (id: string | number, checked: boolean) => {
    onToggleItem(id);
  };

  return (
    <div data-shared-ui className={sharedClasses.CheckboxGroup.root}>
      <Label>{label}</Label>
      <ScrollArea className={sharedClasses.CheckboxGroup.scrollArea}>
        <div className={sharedClasses.CheckboxGroup.inner}>
          {items.length === 0 ? (
            <p className={sharedClasses.CheckboxGroup.emptyMessage}>{emptyMessage}</p>
          ) : (
            items.map((item) => (
              <CheckboxComponent
                key={item.id}
                id={String(item.id)}
                label={item.name}
                checked={selectedItems.includes(item.id)}
                onCheckedChange={(checked: boolean) => handleCheckedChange(item.id, checked)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
