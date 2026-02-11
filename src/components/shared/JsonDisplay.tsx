import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
    <div className={cn("", className)}>
      <p className="text-xs text-muted-foreground mb-2">{title}</p>
      <ScrollArea className={cn(height, "rounded border bg-muted/30 p-3 font-mono text-xs whitespace-pre-wrap")}>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </ScrollArea>
    </div>
  );
};
