"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormLabelProps
  extends React.ComponentPropsWithoutRef<typeof Label> {
  className?: string;
}

export function FormLabel({ className, ...props }: FormLabelProps) {
  return <Label className={cn(className)} {...props} />;
}
