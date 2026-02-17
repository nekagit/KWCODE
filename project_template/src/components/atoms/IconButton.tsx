"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function IconButton({
  className,
  ...props
}: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(className)}
      {...props}
    />
  );
}
