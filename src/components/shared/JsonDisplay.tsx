import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import sharedClasses from './shared-classes';

interface JsonDisplayProps {
  title: string;
  data: any;
  height?: string;
  className?: string;
}

export const JsonDisplay: React.FC<JsonDisplayProps> = ({
  title,
  data,
  height = "h-24",
  className,
}) => {
  return (
    <div data-shared-ui className={cn(sharedClasses.JsonDisplay.root, className)}>
      <p className={sharedClasses.JsonDisplay.title}>{title}</p>
      <ScrollArea className={cn(height, sharedClasses.JsonDisplay.scrollArea)}>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </ScrollArea>
    </div>
  );
};
