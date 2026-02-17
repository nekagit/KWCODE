"use client";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface SeparatorLineProps
  extends React.ComponentPropsWithoutRef<typeof Separator> {
  className?: string;
}

export function SeparatorLine({ className, ...props }: SeparatorLineProps) {
  return <Separator className={cn(className)} {...props} />;
}
