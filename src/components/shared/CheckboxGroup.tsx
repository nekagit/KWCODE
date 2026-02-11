import React from 'react';
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
    <div className="grid gap-2">
      <Label>{label}</Label>
      <ScrollArea className="h-[100px] rounded border p-2">
        <div className="space-y-1">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
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
