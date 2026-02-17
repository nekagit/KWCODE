"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrimaryButton({
  className,
  ...props
}: ButtonProps) {
  return (
    <Button
      variant="default"
      className={cn(className)}
      {...props}
    />
  );
}
